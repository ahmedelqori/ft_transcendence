import { fastify } from "../server.js";
import { websocketRouteSchema } from "../routes/game.routes.js";
import {
  startGameLoop,
  stopGameLoop,
  updatePaddlePosition,
  resetBallAndPaddles,
  pauseGame,
  resumeGame,
  gameLoops
} from "../gameLogic/gameplay.js";
import {
  defaultGameConfig,
  gameRooms,
  connections,
  WS_CLOSE,
  Game,
  createGameState,
  createGameRoom,
  CLEANUP
} from "../gameLogic/gameConfig.js";
import {
  checkUserGamePermission,
  sendErrorAndClose,
  Message,
  sendToUser,
  broadcast,
  broadcastAll,
  sendInitialGameData,
  updateGameInDatabase,
  checkChangingDevice,
  notifyGameFinished
} from "./game.socket.utils.js";
import { authenticate, TOKEN } from "../middlewares/auth.middleware.js";
import { clearTournamentGameTimeout } from "./tournamentTimeout.js";

export const setupWebSocketHandlers = async function (fastify) {
  fastify.log.info("Registering WebSocket handlers");
  fastify.get(":gameId",
    {
      websocket: true,
      schema: websocketRouteSchema,
      preHandler: authenticate,
    },
    handleWebSocketConnection
  );
};


async function handleWebSocketConnection(socket, req) {
  const gameId = parseInt(req.params.gameId);
  const userId = req.user?.id;
  fastify.log.info(`WebSocket connection attempt: gameId=${gameId}, userId=${userId}, authenticated through token`);
  try {
    let gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      gameRoom = createGameRoom(gameId);
      gameRooms.set(gameId, gameRoom);
    }
    const permissionCheck = await checkUserGamePermission(gameId, userId, gameRooms);
    if (!permissionCheck.hasPermission) {
      sendErrorAndClose(
        socket,
        permissionCheck.reason,
        WS_CLOSE.POLICY_VIOLATION
      );
      return;
    }
    if (permissionCheck.gameData && !gameRoom.gameData) {
      gameRoom.gameData = permissionCheck.gameData;
      fastify.log.info(`Updated gameData for game ${gameId}`);
    }
  } catch (error) {
    fastify.log.error(`Error checking permissions: ${error.message}`);
    sendErrorAndClose(socket, "Error verifying permissions", WS_CLOSE.INTERNAL_ERROR);
    return;
  }
  socket.gameId = gameId
  socket.userId = userId;
  socket.token = req.token
  socket.user = req.user
  if (checkChangingDevice(connections, socket, gameRooms, defaultGameConfig, setupSocketEventHandlers)) return
  socket.send(Message("connected", { message: "You are connected" }));
  fastify.log.info(`User ${userId} connected to game ${gameId}`);
  sendInitialGameData(gameId, socket, gameRooms, defaultGameConfig,createGameState);
  setupSocketEventHandlers(socket);
}

function setupSocketEventHandlers(socket) {
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleMessage(socket, data);
    } catch (err) {
      fastify.log.error(`Error parsing message: ${err}`);
      sendErrorAndClose(socket, "Invalid message format", WS_CLOSE.INTERNAL_ERROR);
    }
  });

  socket.on("close", (code, reason) => {
    fastify.log.warn(`socket close event triggered with code ${code}`);   
    const gameId = socket.gameId;
    const userId = socket.userId;
    if (socket.changed) return;
    if (!gameId || !userId) {
      fastify.log.error(`Invalid socket state on disconnect: gameId=${gameId}, userId=${userId}`);
      return;
    }
    handleDisconnect(socket, code);
  });
}

function handleMessage(socket, data) {
  const messageHandlers = {
    joinGame: () => handleJoinGame(socket),
    paddleMove: () => handlePaddleMove(socket, data.position),
    pauseGame: () => handlePauseGame(socket),
    resumeGame: () => handleResumeGame(socket),
  };

  const handler = messageHandlers[data.type];
  if (handler) {
    handler();
  } else {
    fastify.log.warn(`Unknown message type: ${data.type}`);
    socket.send(Message("error", { message: "Unknown message type" }));
  }
}

function handleJoinGame(socket) {
  try {
    const gameId = socket.gameId;
    const userId = socket.userId;
    let gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      gameRoom = createGameRoom(gameId);
      gameRooms.set(gameId, gameRoom);
      fastify.log.info(`Created new game room for game ${gameId}`);
    }
    if (socket.alreadyJoined) return;
    if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId])
      return handlePossibleReconnection(socket);
    handleNewPlayerJoin(socket);
  } catch (error) {
    const gameId = socket.gameId;
    const userId = socket.userId;
    fastify.log.error(`Error in handleJoinGame for game ${gameId}, user ${userId}: ${error.message}`);
    sendToUser(gameId, userId, Message("error", {message: "Failed to join game due to an internal error"}));
  }
}

function handlePossibleReconnection(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = gameRooms.get(gameId);
  const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
  const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;
  if (reconnectTime <= gameRoom.maxReconnectTime)
    return handleReconnection(socket, gameRoom);
  else {
    fastify.log.warn(`Player ${userId} reconnection window expired (${reconnectTime}ms > ${gameRoom.maxReconnectTime}ms)`);
    handleTimeOutReconnection(socket, gameRoom);
    return false;
  }
}

async function handleNewPlayerJoin(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = gameRooms.get(gameId);
  const players = gameRoom.players;
  const playerKeys = Object.keys(players);
  const playersCount = playerKeys.length;
  const playerPosition = playersCount === 0 ? "left" : "right";
  players[userId] = {
    id: userId,
    position: playerPosition,
    player: socket.user
  };
  fastify.log.info(`Player ${userId} joined game ${gameId} as ${playerPosition} player`);
  const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
    where: { id: gameId },
  });  
  if (playersCount === 0 && game?.tournementId && game.tournementId !== 0) {
    clearTournamentGameTimeout(gameId);
  }
  const playerValues = Object.values(players);
  broadcast(gameId, userId, Message("playerJoined", {
      gameId: gameId,
      userId: userId,
      position: playerPosition,
      players: playerValues,
    })
  );
  sendToUser(gameId, userId,
    Message("joinedGame", {
      gameId: gameId,
      userId: userId,
      position: playerPosition,
      players: playerValues,
      gameState: {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0
      },
    })
  );
  
  if (playersCount === 0) {
    fastify.log.info(`First player ${userId} joined game ${gameId}, starting 30-second forfeit timer`);
    gameRoom.forfeitTimer = setTimeout(async () => {
      await handleForfeitTimeout(gameId, userId, gameRoom);
    }, 30000);
  } else if (playerKeys.length === 1) { 
    if (gameRoom.forfeitTimer) {
      clearTimeout(gameRoom.forfeitTimer);
      gameRoom.forfeitTimer = null;
      fastify.log.info(`Second player joined game ${gameId}, forfeit timer cleared`);
    }
    
    gameRoom.gameState.state = Game.JOINED;
    fastify.log.info(`Game ${gameId} has two players, ready to start`);
    broadcastAll(gameId, Message("readyToStart", {
        gameRoom: gameRoom,
        gameState: {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0},
      })
    );
    setTimeout(() => {
      if (gameRoom.gameState.state === Game.JOINED) {
        initiateGameStart(gameId, Object.keys(players)[0], gameRoom)
        fastify.log.info(`Game ${gameId} auto-started`);
      }
    }, 5000);
    await fastify.prisma.game.update({
      where: { id: gameId },
      data: {
        status: "IN_PROGRESS",
      },
    });
  }
}

function handleReconnection(socket, gameRoom) {
  try {
    const gameId = socket.gameId;
    const userId = socket.userId;
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];    
    const game = gameRoom.gameData;
    gameRoom.players[userId] = {
      id: userId,
      position: disconnectedPlayer.position,
      player: socket.user
    };
    delete gameRoom.disconnectedPlayers[userId];
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
      fastify.log.info(`Reconnection timer cleared for game ${gameId}`);
    }
    sendToUser(gameId, userId, Message("gameStateUpdate", {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0}));
    sendToUser(gameId, userId, Message("reconnectedToGame", {gameId: gameId,position: disconnectedPlayer.position,
        gameState: {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0},
        players: Object.values(gameRoom.players),
        reconnectionTime: Date.now() - disconnectedPlayer.disconnectedAt,
      })
    );
    broadcast(gameId, userId,Message("playerReconnected", {
        position: disconnectedPlayer.position,
        userId: userId,
      })
    );
    fastify.log.info(`Player ${userId} successfully reconnected to game ${gameId}`);
    if (gameRoom.gameState.state === Game.PAUSED && Object.keys(gameRoom.players).length === 2 && Object.keys(gameRoom.disconnectedPlayers).length === 0) {
      resumeGame(gameId);
    }
    const gameLoop = gameLoops.get(gameId);
    if (gameLoop && gameLoop.running) broadcastAll(gameId, Message("gameStateUpdate", {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0}));
    return true;
  } catch (error) {
    fastify.log.error(`Error in handleReconnection for game ${socket.gameId}, user ${socket.userId}: ${error.message}`);
    return false;
  }
}

function handleTimeOutReconnection(socket, gameRoom) {
  try {
    const gameId = socket.gameId;
    const userId = socket.userId;
    fastify.log.info(`Handling reconnection timeout for user ${userId} in game ${gameId}`);
    if (!gameRoom.disconnectedPlayers[userId]) {
      fastify.log.warn(`No disconnected player data for ${userId} in game ${gameId}`);
      return false;
    }
    const position = gameRoom.disconnectedPlayers[userId].position;
    delete gameRoom.disconnectedPlayers[userId];
    const game = gameRoom.gameData;
    sendToUser(gameId, userId, Message("reconnectionExpired", {
        gameId: gameId,
        message: `Your reconnection window expired. Game status: ${gameRoom.gameState.state}`,
        gameState: {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournementId || 0},}));
    if (gameRoom.gameState.state === Game.START || gameRoom.gameState.state === Game.JOINED) {
      const playersNum = Object.keys(gameRoom.players).length;
      if (playersNum < 2) {
        const newPosition = playersNum === 0 ? "left" : "right";
        gameRoom.players[userId] = { id: userId, position: newPosition };
        sendToUser(gameId, userId, Message("joinedGame", {
            gameId: gameId,
            position: newPosition,
            players: Object.values(gameRoom.players),
            gameState: {...gameRoom.gameState, gameId: gameId, tournamentId: game?.tournamentId || 0},})
        );
        return true;
      }
    }
    if (gameRoom.gameState.state === Game.PAUSED || gameRoom.gameState.state === Game.IN_PLAY)
      broadcastAll(gameId, Message("playerAbandoned", {position: position, userId: userId,}));
    return false;
  } catch (error) {
    fastify.log.error(`Error in handleTimeOutReconnection for game ${socket.gameId}, user ${socket.userId}: ${error.message}`);
    return false;
  }
}

function initiateGameStart(gameId, userId, gameRoom) {
  gameRoom.gameState.state = Game.IN_PLAY;
  resetBallAndPaddles(gameRoom.gameState);
  const game = gameRoom.gameData;
  broadcastAll(gameId, Message("gameStarted", {
      startedBy: userId,
      gameState: {...gameRoom.gameState,gameId: gameId,tournamentId: game?.tournementId || 0},
      players: Object.values(gameRoom.players),
    })
  );
  fastify.log.info(`Game ${gameId} started by user ${userId}`);
  startGameLoop(gameId, gameRoom.gameState, (updatedGameState) => {
    try {
      if (updatedGameState.state === Game.FINISHED) {
        handleGameOver(gameId, updatedGameState);
        return;
      }      
      const gameLoop = gameLoops.get(gameId);
      if (gameLoop && gameLoop.running)
        broadcastAll(gameId, Message("gameStateUpdate", {...updatedGameState, gameId: gameId, tournamentId: game?.tournementId || 0}));
    } catch (loopError) {
      fastify.log.error(`Error in game loop for game ${gameId}: ${loopError.message}`);
    }
  });
  return true;
}

function handlePaddleMove(socket, position) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) return false;
  const pos = Number(position);
  if (isNaN(pos)) {
    fastify.log.warn(`Invalid position value from user ${userId}: ${position}`);
    return false;
  }
  if (gameRoom.gameState.state !== Game.IN_PLAY) {
    fastify.log.info(`Paddle move ignored - game ${gameId} not in play (state: ${gameRoom.gameState.state})`);
    return false;
  }
  const playerData = gameRoom.players[userId];
  if (playerData && playerData.position) {
    const isLeftPaddle = playerData.position === "left";
    fastify.log.debug(`Player ${userId} controls ${isLeftPaddle ? "left" : "right"} paddle`);
    updatePaddlePosition(gameRoom.gameState, userId, pos, isLeftPaddle);
    return true;
  }
  if (!gameRoom.gameData) {
    fastify.log.warn(`No position info found for player ${userId} in game ${gameId}`);
    return false;
  }
  const isLeftPaddle = gameRoom.gameData.playerOneId === userId;
  fastify.log.debug(`From gameData: Player ${userId} controls ${isLeftPaddle ? "left" : "right"} paddle`);
  updatePaddlePosition(gameRoom.gameState, userId, pos, isLeftPaddle);
  return true;
}

function handlePauseGame(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = validateGameAndPlayer(gameId, userId, socket, "pause");
  if (!gameRoom) return false;
  try {
    if (gameRoom.gameState.state !== Game.IN_PLAY) {
      fastify.log.warn(`Cannot pause game ${gameId} in state ${gameRoom.gameState.state}`);
      sendErrorAndClose(socket, "Game cannot be paused in current state", WS_CLOSE.POLICY_VIOLATION);
      return false;
    }
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
    broadcastAll(gameId,Message("gamePaused", {pausedBy: userId, reason: "userRequested", message: `Game paused by player ${userId}`,}));
    fastify.log.info(`Game ${gameId} paused by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error pausing game ${gameId}: ${error.message}`);
    return false;
  }
}

function handleResumeGame(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = validateGameAndPlayer(gameId, userId, socket, "resume");
  if (!gameRoom) return false;
  try {
    if (gameRoom.gameState.state !== Game.PAUSED) {
      fastify.log.warn(`Cannot resume game ${gameId} in state ${gameRoom.gameState.state}`);
      sendToUser(gameId, userId, Message("error", { message: "Game cannot be resumed in current state" }));
      return false;
    }
    gameRoom.gameState.state = Game.IN_PLAY;
    resumeGame(gameId);
    broadcastAll(gameId, Message("gameResumed", {resumedBy: userId, reason: "userRequested", message: `Game resumed by player ${userId}`,}));
    fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error resuming game ${gameId}: ${error.message}`);
    return false;
  }
}

function handleDisconnect(socket, closeCode) {
  const userId = socket.userId;
  const gameId = socket.gameId;

  if (!userId || !gameId) {
    fastify.log.error(`Cannot handle disconnect: Invalid socket state - gameId=${gameId}, userId=${userId}`);
    return;
  }
  fastify.log.info(`User ${userId} disconnected from game ${gameId} ${closeCode ? ` with code ${closeCode}` : ""}`);
  cleanupConnection(gameId, userId);
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    fastify.log.warn(`No game room found for ${gameId}, nothing to clean up`);
    return;
  }
  handleDisconnectByGameState(gameRoom, socket, closeCode);
}

function cleanupConnection(gameId, userId) {
  if (!gameId || !userId) {
    fastify.log.error(`Cannot cleanup connection: Invalid parameters - gameId=${gameId}, userId=${userId}`);
    return;
  }
  if (connections.has(gameId)) {
    const gameConnections = connections.get(gameId);
    if (gameConnections.has(userId)) {
      gameConnections.delete(userId);
      fastify.log.info(`Removed connection for user ${userId} from game ${gameId}`);
    }
    if (gameConnections.size === 0) {
      connections.delete(gameId);
      fastify.log.info(`Removed empty game ${gameId} from connections`);
    }
  }
}

function handleDisconnectByGameState(gameRoom, socket, closeCode) {
  const { gameState } = gameRoom;
  const gameId = socket.gameId;

  switch (gameState.state) {
    case Game.CANCELED:
    case Game.FINISHED:
      return;
    case Game.START:
    case Game.JOINED:
      handleEarlyDisconnect(gameRoom, socket);
      break;
    case Game.IN_PLAY:
    case Game.PAUSED:
      handleActiveGameDisconnect(gameRoom, socket, closeCode);
      break;
    default:
      fastify.log.warn(`Unhandled game state ${gameState.state} in handleDisconnect for game ${gameId}`);
  }
}

async function handleLastPlayerDisconnect(gameRoom, socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  
  const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) throw new Error(`Game ${gameId} not found in database`);
  
  if (game.tournementId && game.tournementId !== 0) {
    fastify.log.info(`Tournament game ${gameId}: Last player ${userId} disconnected, they win by being last to leave`);
    await handleIntentionalDisconnection(gameId, userId, gameRoom, false);
    return;
  }
  
  fastify.log.warn(`Regular game ${gameId}: Last player disconnected, canceling game`);
  try {
    await handleBothPlayersDisconnected(gameId, gameRoom, game);
  } catch (error) {
    fastify.log.error(`Failed to update game ${gameId} in database: ${error.message}`);
  }
}

async function handleTournamentLastPlayerWin(gameRoom, gameId, winnerId, winnerPosition, game) {
  await handleIntentionalDisconnection(gameId, winnerId, gameRoom, false);
}

async function handleBothPlayersDisconnected(gameId, gameRoom, game) {
  gameRoom.gameState.state = Game.CANCELED;
  gameRoom.gameState.winner = null;
  gameRoom.endedAt = new Date();
  
  const currentLeftScore = gameRoom.gameState.score.left || 0;
  const currentRightScore = gameRoom.gameState.score.right || 0;
  
  const leftPlayerId = getPlayerIdByPosition("left", gameRoom, game);
  let playerOneScore, playerTwoScore;
  if (game.playerOneId === leftPlayerId) {
    playerOneScore = currentLeftScore;
    playerTwoScore = currentRightScore;
  } else {
    playerOneScore = currentRightScore;
    playerTwoScore = currentLeftScore;
  }
  
  const updateData = {
    endedAt: new Date(),
    playerOneScore: playerOneScore,
    playerTwoScore: playerTwoScore,
    status: "CANCELED",
    winnerId: -1
  };
  
  const updatedGame = await fastify.prisma.game.update({
    where: { id: gameId },
    data: updateData
  });
  
  fastify.log.info(`Game ${gameId} canceled - both players disconnected with scores ${playerOneScore}-${playerTwoScore}`);
  
  broadcastAll(gameId, Message("gameFinished", {
    gameState: {...gameRoom.gameState, tournamentId: game.tournementId},
    message: "Game canceled - both players disconnected",
    reason: "bothDisconnected",
    forfeit: true,
    tournamentId: updatedGame.tournementId
  }));
  
  if (updatedGame.tournementId) {
    try {
      await notifyGameFinished(TOKEN, {...game, ...updatedGame});
      fastify.log.info(`Tournament ${updatedGame.tournementId} notified about canceled game ${gameId}`);
    } catch (error) {
      fastify.log.error(`Failed to notify tournament service: ${error.message}`);
    }
  }
  
  return updatedGame;
}

async function handleIntentionalDisconnection(gameId, disconnectedUserId, gameRoom, isEarlyDisconnect = false) {
  try {
    const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });
    
    if (!game) throw new Error(`Game ${gameId} not found in database`);

    if (gameRoom.forfeitTimer) {
      clearTimeout(gameRoom.forfeitTimer);
      gameRoom.forfeitTimer = null;
    }
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
    }

    const disconnectedPlayer = gameRoom.players[disconnectedUserId] || gameRoom.disconnectedPlayers[disconnectedUserId];
    const allPlayerIds = [game.playerOneId, game.playerTwoId];
    const remainingPlayerId = allPlayerIds.find(id => id !== disconnectedUserId);
    
    if (!remainingPlayerId) {
      return await handleBothPlayersDisconnected(gameId, gameRoom, game);
    }

    const winnerId = remainingPlayerId;
    const loserId = disconnectedUserId;
    
    const winnerPosition = getPlayerPosition(winnerId, gameRoom, game);
    const loserPosition = getPlayerPosition(loserId, gameRoom, game);
    
    fastify.log.info(`Game ${gameId}: Player ${loserId} (${loserPosition}) disconnected, Player ${winnerId} (${winnerPosition}) wins`);

    gameRoom.gameState.state = Game.FINISHED;
    gameRoom.gameState.winner = winnerPosition;
    gameRoom.endedAt = new Date();
    const playerOneScore = game.playerOneId === winnerId ? 10 : 0;
    const playerTwoScore = game.playerTwoId === winnerId ? 10 : 0;
    const leftScore = winnerPosition === "left" ? 10 : 0;
    const rightScore = winnerPosition === "right" ? 10 : 0;
    fastify.log.info(`Intentional disconnect forfeit: ${winnerId} wins 10-0`);
    gameRoom.gameState.score.left = leftScore;
    gameRoom.gameState.score.right = rightScore;
    const updateData = {
      endedAt: new Date(),
      playerOneScore: playerOneScore,
      playerTwoScore: playerTwoScore,
      status: "FINISHED",
      winnerId: winnerId
    };
    const updatedGame = await fastify.prisma.game.update({
      where: { id: gameId },
      data: updateData
    });
    fastify.log.info(`Game ${gameId} updated - player ${winnerId} wins with database score ${playerOneScore}-${playerTwoScore}`);
    const message = isEarlyDisconnect ? "You win by forfeit!" : "You win by forfeit - opponent disconnected!";
    broadcastAll(gameId, Message("gameFinished", {
      gameState: {...gameRoom.gameState, tournamentId: game?.tournementId},
      message: message,
      forfeit: true,
      winnerId: winnerId,
      tournamentId: updatedGame.tournementId
    }));

    if (updatedGame.tournementId) {
      try {
        await notifyGameFinished(TOKEN, {...game, ...updatedGame});
        fastify.log.info(`Tournament ${updatedGame.tournementId} notified about game ${gameId}`);
      } catch (error) {
        fastify.log.error(`Failed to notify tournament service: ${error.message}`);
      }
    }

    setTimeout(() => {
      try {
        gameRooms.delete(gameId);
        connections.delete(gameId);
        fastify.log.debug(`Game ${gameId} resources cleaned up after disconnection`);
      } catch (cleanupError) {
        fastify.log.error(`Error during game cleanup: ${cleanupError.message}`);
      }
    }, CLEANUP);

    return updatedGame;

  } catch (error) {
    fastify.log.error(`Error handling intentional disconnection for game ${gameId}: ${error.message}`);
    throw error;
  }
}

function getPlayerPosition(playerId, gameRoom, game) {
  const activePlayer = gameRoom.players[playerId];
  if (activePlayer?.position) {
    return activePlayer.position;
  }
  const disconnectedPlayer = gameRoom.disconnectedPlayers[playerId];
  if (disconnectedPlayer?.position) {
    return disconnectedPlayer.position;
  }
  return game.playerOneId === playerId ? "left" : "right";
}

function getPlayerIdByPosition(position, gameRoom, game) {
  const activePlayer = Object.values(gameRoom.players || {}).find(p => p.position === position);
  if (activePlayer) return activePlayer.id;
  const disconnectedPlayer = Object.values(gameRoom.disconnectedPlayers || {}).find(p => p.position === position);
  if (disconnectedPlayer) return disconnectedPlayer.id;
  return position === "left" ? game.playerOneId : game.playerTwoId;
}

function handleEarlyDisconnect(gameRoom, socket) {
  const userId = socket.userId;
  const gameId = socket.gameId;
  fastify.log.info(`Early disconnect from player ${userId} in the game ${gameId}`);
  handleIntentionalDisconnection(gameId, userId, gameRoom, true);
}

function handleActiveGameDisconnect(gameRoom, socket, closeCode) {
  const userId = socket.userId;
  const gameId = socket.gameId;
  const isIntentionalDisconnect = closeCode === WS_CLOSE.NORMAL;
  if (isIntentionalDisconnect) {
    fastify.log.info(`Intentional disconnect during active game from player ${userId} in game ${gameId}`);
    handleIntentionalDisconnection(gameId, userId, gameRoom, false);
    return;
  }
  const playerPosition = gameRoom.players[userId].position;
  gameRoom.disconnectedPlayers[userId] = { 
    ...gameRoom.players[userId], 
    disconnectedAt: Date.now(), 
    intentionalDisconnect: isIntentionalDisconnect
  };
  delete gameRoom.players[userId];
  fastify.log.info(`Removed player ${userId} (${playerPosition}) from active players in game ${gameId}`);
  if (Object.keys(gameRoom.players).length === 0) {
    handleLastPlayerDisconnect(gameRoom, socket);
    return;
  }
  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }
  broadcastDisconnectNotification(gameId, userId, isIntentionalDisconnect);
  setupReconnectionTimer(gameRoom, socket, isIntentionalDisconnect);
}

function broadcastDisconnectNotification(gameId, userId, isIntentionalDisconnect) {
  broadcastAll(gameId, Message("gamePaused", {
      reason: "playerDisconnected",
      message: "Player disconnected. Waiting for reconnection...",
      intentional: isIntentionalDisconnect,
      userId: userId,
    })
  );
}

function setupReconnectionTimer(gameRoom, socket, isIntentionalDisconnect) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const timeout = isIntentionalDisconnect ? gameRoom.intentionalDisconnectTime : gameRoom.maxReconnectTime;
  fastify.log.info(`Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`);
  gameRoom.disconnectTimer = setTimeout(async () => {
    await handleReconnectionTimeout(socket, gameRoom);
  }, timeout);
}

async function handleReconnectionTimeout(socket, gameRoom) {
  const userId = socket.userId;
  const gameId = socket.gameId;
  if (!gameRoom.disconnectedPlayers[userId]) return;
  stopGameLoop(gameId);
  
  const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
    where: { id: gameId },
  });
  if (!game) throw new Error(`Game ${gameId} not found in database`);
  
  const activePlayers = Object.keys(gameRoom.players || {});
  const disconnectedPlayersCount = Object.keys(gameRoom.disconnectedPlayers || {}).length;
  
  if (activePlayers.length === 0 && disconnectedPlayersCount === 2) {
    if (game.tournementId && game.tournementId !== 0) {
      const disconnectedPlayers = Object.values(gameRoom.disconnectedPlayers);
      const lastToDisconnect = disconnectedPlayers.reduce((latest, current) => 
        current.disconnectedAt > latest.disconnectedAt ? current : latest
      );
      
      fastify.log.info(`Tournament game ${gameId}: Both players disconnected, last to disconnect (${lastToDisconnect.id}) wins`);
      await handleIntentionalDisconnection(gameId, disconnectedPlayers.find(p => p.id !== lastToDisconnect.id).id, gameRoom, false);
      return;
    }
    
    fastify.log.info(`Regular game ${gameId} finished - both players disconnected`);
    await handleBothPlayersDisconnected(gameId, gameRoom, game);
  } else {
    fastify.log.info(`Game ${gameId}: Player ${userId} failed to reconnect - using unified disconnection handler`);
    await handleIntentionalDisconnection(gameId, userId, gameRoom, false);
  }
}

async function handleForfeitTimeout(gameId, firstPlayerId, gameRoom) {
  try {
    const playerCount = Object.keys(gameRoom.players).length;
    if (playerCount >= 2 || gameRoom.gameState.state !== Game.START) return;
    
    const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });
    
    const allPlayerIds = [game.playerOneId, game.playerTwoId];
    const loserPlayerId = allPlayerIds.find(id => id !== firstPlayerId);
    
    if (loserPlayerId) {
      await handleIntentionalDisconnection(gameId, loserPlayerId, gameRoom, true);
    } else {
      await handleIntentionalDisconnection(gameId, firstPlayerId, gameRoom, true);
    }
  } catch (error) {
    fastify.log.error(`Error handling forfeit timeout for game ${gameId}: ${error.message}`);
  }
}

async function handleGameOver(gameId, finalGameState) {
  try {
    fastify.log.info(`Game ${gameId} has ended. Winner: ${finalGameState.winner}, Score: ${finalGameState.score.left}-${finalGameState.score.right}`);
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(`Cannot handle game over for non-existent game ${gameId}`);
      stopGameLoop(gameId);
      return;
    }
    gameRoom.gameState.state = Game.FINISHED;
    gameRoom.endedAt = Date.now();
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
    }
    stopGameLoop(gameId);
    try {
      const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
        where: { id: gameId },
      });
      if (!game) throw new Error(`Game ${gameId} not found in database`);
      broadcastAll(gameId, Message("gameFinished", {
          gameState: {...finalGameState, tournamentId : game.tournementId},
          endTime: gameRoom.endedAt,
          message: `Game finished. Winner: ${finalGameState.winner}, Score: ${finalGameState.score.left}-${finalGameState.score.right}`,
        })
      );
      const leftPlayerId = Object.values(gameRoom.players).find(p => p.position === "left")?.id;
      let playerOneScore, playerTwoScore;
      if (game.playerOneId === leftPlayerId) {
        playerOneScore = finalGameState.score.left;
        playerTwoScore = finalGameState.score.right;
      } else {
        playerOneScore = finalGameState.score.right;
        playerTwoScore = finalGameState.score.left;
      }
      const winnerId = playerOneScore > playerTwoScore ? game.playerOneId : game.playerTwoId;
      const updateData = {
        endedAt: new Date(),
        playerOneScore: playerOneScore,
        playerTwoScore: playerTwoScore,
        status: "FINISHED",
        winnerId: winnerId
      };
      const updatedGame = await fastify.prisma.game.update({
        where: { id: gameId },
        data: updateData
      });
      fastify.log.info(`Game ${gameId} updated in database with winner ID: ${winnerId} (Score: ${playerOneScore}-${playerTwoScore}, Left: ${finalGameState.score.left}, Right: ${finalGameState.score.right})`);
      if (updatedGame.tournementId) {
        try {
          await notifyGameFinished(TOKEN, {...game, ...updatedGame});
          fastify.log.info(`Tournament ${updatedGame.tournementId} notified about canceled game ${gameId}`);
        } catch (error) {
          fastify.log.error(`Failed to notify tournament service: ${error.message}`);
        }
      }
    } catch (error) {
      fastify.log.error(
        `Database error in handleGameOver for game ${gameId}: ${error.message}`
      );
    }
    setTimeout(() => {
      try {
        gameRooms.delete(gameId);
        connections.delete(gameId);
        fastify.log.debug(`Game ${gameId} resources cleaned up`);
      } catch (cleanupError) {
        fastify.log.error(`Error during game cleanup: ${cleanupError.message}`);
      }
    }, CLEANUP);
  } catch (error) {
    fastify.log.error(`Error in handleGameOver for game ${gameId}: ${error.message}`);
    stopGameLoop(gameId);
    broadcastAll(gameId, Message("gameError", {
        message: "Game ended with errors",
        gameId: gameId,
      })
    );
  }
}

function validateGameAndPlayer(gameId, userId, socket, action) {
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    fastify.log.warn(`Attempt to ${action} non-existent game ${gameId} by user ${userId}`);
    if (socket)
      sendErrorAndClose(socket, "Game does not exist",WS_CLOSE.POLICY_VIOLATION);
    return null;
  }
  if (!gameRoom.players[userId]) {
    fastify.log.warn(`Unauthorized attempt to ${action} game ${gameId} by user ${userId}`);
    if (socket)
      sendErrorAndClose(socket, `You are not authorized to ${action} this game`, WS_CLOSE.POLICY_VIOLATION);
    return null;
  }
  return gameRoom;
}