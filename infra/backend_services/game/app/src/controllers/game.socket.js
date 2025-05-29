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
  runHeartBeatMechanism,
  sendToUser,
  broadcast,
  broadcastAll,
  sendInitialGameData,
  updateGameInDatabase,
  checkChangingDevice,
  notifyGameFinished
} from "./game.socket.utils.js";
import { authenticate, TOKEN } from "../middlewares/auth.middleware.js";

// *************************** WEBSOCKET SETUP ***************************

export const setupWebSocketHandlers = async function (fastify) {
  fastify.log.info("Registering WebSocket handlers");

  fastify.get(
    ":gameId",
    {
      websocket: true,
      schema: websocketRouteSchema,
      preHandler: authenticate,
    },
    handleWebSocketConnection
  );
};

// *************************** CONNECTION HANDLER ***************************

async function handleWebSocketConnection(socket, req) {
  const gameId = parseInt(req.params.gameId);
  const userId = req.user?.id;
  fastify.log.info(
    `WebSocket connection attempt: gameId=${gameId}, userId=${userId}, authenticated through token`
  );

  try {
    let gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      gameRoom = createGameRoom(gameId);
      gameRooms.set(gameId, gameRoom);
    }

    const permissionCheck = await checkUserGamePermission(
      gameId,
      userId,
      gameRooms
    );
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
    sendErrorAndClose(
      socket,
      "Error verifying permissions",
      WS_CLOSE.INTERNAL_ERROR
    );
    return;
  }
  socket.gameId = gameId
  socket.userId = userId;
  socket.token = req.token

  if (checkChangingDevice(connections, socket, gameRooms, defaultGameConfig, setupSocketEventHandlers)){
    return
  }
  socket.send(Message("connected", { message: "You are connected" }));
  fastify.log.info(`User ${userId} connected to game ${gameId}`);
  socket.pingInterval = runHeartBeatMechanism(socket);

  sendInitialGameData(
    gameId,
    socket,
    gameRooms,
    defaultGameConfig,
    createGameState
  );
  setupSocketEventHandlers(socket);
}

function setupSocketEventHandlers(socket) {
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleMessage(socket, data);
    } catch (err) {
      fastify.log.error(`Error parsing message: ${err}`);
      sendErrorAndClose(
        socket,
        "Invalid message format",
        WS_CLOSE.INTERNAL_ERROR
      );
    }
  });

  socket.on("close", (code, reason) => {
    fastify.log.warn(`socket close event triggered with code ${code}`);
    clearInterval(socket.pingInterval);
    
    // Store socket properties before cleanup
    const gameId = socket.gameId;
    const userId = socket.userId;
    
    if (socket.changed) {
      return;
    }

    if (!gameId || !userId) {
      fastify.log.error(`Invalid socket state on disconnect: gameId=${gameId}, userId=${userId}`);
      return;
    }

    handleDisconnect(socket, code);
  });
}

// *************************** MESSAGE HANDLERS ***************************

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

// *************************** JOIN GAME HANDLING ***************************

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

    if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId]) {
      return handlePossibleReconnection(socket);
    }

    handleNewPlayerJoin(socket);
  } catch (error) {
    const gameId = socket.gameId;
    const userId = socket.userId;
    fastify.log.error(
      `Error in handleJoinGame for game ${gameId}, user ${userId}: ${error.message}`
    );
    sendToUser(
      gameId,
      userId,
      Message("error", {
        message: "Failed to join game due to an internal error",
      })
    );
  }
}

function handlePossibleReconnection(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = gameRooms.get(gameId);
  
  const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
  const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;

  if (reconnectTime <= gameRoom.maxReconnectTime) {
    return handleReconnection(socket, gameRoom);
  } else {
    fastify.log.warn(
      `Player ${userId} reconnection window expired (${reconnectTime}ms > ${gameRoom.maxReconnectTime}ms)`
    );
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
  };

  fastify.log.info(
    `Player ${userId} joined game ${gameId} as ${playerPosition} player`
  );

  const playerValues = Object.values(players);

  broadcast(
    gameId,
    userId,
    Message("playerJoined", {
      gameId: gameId,
      userId: userId,
      position: playerPosition,
      players: playerValues,
    })
  );

  sendToUser(
    gameId,
    userId,
    Message("joinedGame", {
      gameId: gameId,
      userId: userId,
      position: playerPosition,
      players: playerValues,
      gameState: gameRoom.gameState,
    })
  );

  if (playerKeys.length === 1) { 
    gameRoom.gameState.state = Game.JOINED;
    fastify.log.info(`Game ${gameId} has two players, ready to start`);
    broadcastAll(
      gameId,
      Message("readyToStart", {
        gameRoom: gameRoom,
        gameState: gameRoom.gameState,
      })
    );

    setTimeout(() => {
      if (gameRoom.gameState.state === Game.JOINED) {
        initiateGameStart(gameId, Object.keys(players)[0], gameRoom)
        fastify.log.info(`Game ${gameId} auto-started`);
      }
    }, 5000);
    await fastify.prisma.game.update({
      data: {
        status: "IN_PROGRESS",
      },
    });
  }
}

// *************************** RECONNECTION HANDLING ***************************

function handleReconnection(socket, gameRoom) {
  try {
    const gameId = socket.gameId;
    const userId = socket.userId;
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
    
    gameRoom.players[userId] = {
      id: userId,
      position: disconnectedPlayer.position,
    };
    
    delete gameRoom.disconnectedPlayers[userId];
    
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
      fastify.log.info(`Reconnection timer cleared for game ${gameId}`);
    }

    // Send one-time state update to the reconnecting player
    sendToUser(gameId, userId, Message("gameStateUpdate", gameRoom.gameState));
    sendToUser(
      gameId,
      userId,
      Message("reconnectedToGame", {
        gameId: gameId,
        position: disconnectedPlayer.position,
        gameState: gameRoom.gameState,
        players: Object.values(gameRoom.players),
        reconnectionTime: Date.now() - disconnectedPlayer.disconnectedAt,
      })
    );

    broadcast(
      gameId,
      userId,
      Message("playerReconnected", {
        position: disconnectedPlayer.position,
        userId: userId,
      })
    );

    fastify.log.info(
      `Player ${userId} successfully reconnected to game ${gameId}`
    );

    if (
      gameRoom.gameState.state === Game.PAUSED &&
      Object.keys(gameRoom.players).length === 2 &&
      Object.keys(gameRoom.disconnectedPlayers).length === 0
    ) {
      gameRoom.gameState.state = Game.IN_PLAY;
      resumeGame(gameId);

      broadcastAll(
        gameId,
        Message("gameResumed", {
          message: "All players reconnected, game resumed",
          resumedAt: Date.now(),
        })
      );
    }

    // Only send a state update broadcast if the game is actually running
    const gameLoop = gameLoops.get(gameId);
    if (gameLoop && gameLoop.running) {
      broadcastAll(gameId, Message("gameStateUpdate", gameRoom.gameState));
    }
    
    return true;
  } catch (error) {
    const gameId = socket.gameId;
    const userId = socket.userId;
    fastify.log.error(
      `Error in handleReconnection for game ${gameId}, user ${userId}: ${error.message}`
    );
    return false;
  }
}

function handleTimeOutReconnection(socket, gameRoom) {
  try {
    const gameId = socket.gameId;
    const userId = socket.userId;
    fastify.log.info(
      `Handling reconnection timeout for user ${userId} in game ${gameId}`
    );

    if (!gameRoom.disconnectedPlayers[userId]) {
      fastify.log.warn(
        `No disconnected player data for ${userId} in game ${gameId}`
      );
      return false;
    }

    const position = gameRoom.disconnectedPlayers[userId].position;
    delete gameRoom.disconnectedPlayers[userId];

    sendToUser(
      gameId,
      userId,
      Message("reconnectionExpired", {
        gameId: gameId,
        message: `Your reconnection window expired. Game status: ${gameRoom.gameState.state}`,
        gameState: gameRoom.gameState,
      })
    );

    // If game hasn't started yet, allow player to rejoin
    if (gameRoom.gameState.state === Game.START || gameRoom.gameState.state === Game.JOINED) {
      const playersNum = Object.keys(gameRoom.players).length;
      if (playersNum < 2) {
        const newPosition = playersNum === 0 ? "left" : "right";
        gameRoom.players[userId] = { id: userId, position: newPosition };
        sendToUser(
          gameId,
          userId,
          Message("joinedGame", {
            gameId: gameId,
            position: newPosition,
            players: Object.values(gameRoom.players),
            gameState: gameRoom.gameState,
          })
        );
        return true;
      }
    }

    // If game is in progress, notify other players
    if (gameRoom.gameState.state === Game.PAUSED || gameRoom.gameState.state === Game.IN_PLAY) {
      broadcastAll(
        gameId,
        Message("playerAbandoned", {
          position: position,
          userId: userId,
        })
      );
    }

    return false;
  } catch (error) {
    fastify.log.error(`Error in handleTimeOutReconnection for game ${socket.gameId}, user ${socket.userId}: ${error.message}`);
    return false;
  }
}

// *************************** GAME STATE MANAGEMENT ***************************

function initiateGameStart(gameId, userId, gameRoom) {
  gameRoom.gameState.state = Game.IN_PLAY;
  resetBallAndPaddles(gameRoom.gameState);

  broadcastAll(
    gameId,
    Message("gameStarted", {
      startedBy: userId,
      gameState: gameRoom.gameState,
      players: Object.values(gameRoom.players),
    })
  );

  fastify.log.info(`Game ${gameId} started by user ${userId}`);

  startGameLoop(gameId, gameRoom.gameState, (updatedGameState) => {
    try {
      if (updatedGameState.state === Game.FINISHED) {
        handleGameOver(gameId, updatedGameState);
        return; // Stop processing after game over
      }
      
      // Only send gameStateUpdate messages when the game is actively running
      const gameLoop = gameLoops.get(gameId);
      if (gameLoop && gameLoop.running) {
        broadcastAll(gameId, Message("gameStateUpdate", updatedGameState));
      }
    } catch (loopError) {
      fastify.log.error(
        `Error in game loop for game ${gameId}: ${loopError.message}`
      );
    }
  });
  return true;
}

// *************************** PADDLE MOVEMENT ***************************

function handlePaddleMove(socket, position) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = gameRooms.get(gameId);

  if (!gameRoom) {
    return false;
  }

  const pos = Number(position);
  if (isNaN(pos)) {
    fastify.log.warn(`Invalid position value from user ${userId}: ${position}`);
    return false;
  }

  if (gameRoom.gameState.state !== Game.IN_PLAY) {
    fastify.log.info(
      `Paddle move ignored - game ${gameId} not in play (state: ${gameRoom.gameState.state})`
    );
    return false;
  }

  const playerData = gameRoom.players[userId];
  if (playerData && playerData.position) {
    const isLeftPaddle = playerData.position === "left";
    fastify.log.debug(
      `Player ${userId} controls ${isLeftPaddle ? "left" : "right"} paddle`
    );
    updatePaddlePosition(gameRoom.gameState, userId, pos, isLeftPaddle);
    return true;
  }

  if (!gameRoom.gameData) {
    fastify.log.warn(
      `No position info found for player ${userId} in game ${gameId}`
    );
    return false;
  }

  const isLeftPaddle = gameRoom.gameData.playerOneId === userId;
  fastify.log.debug(
    `From gameData: Player ${userId} controls ${
      isLeftPaddle ? "left" : "right"
    } paddle`
  );
  updatePaddlePosition(gameRoom.gameState, userId, pos, isLeftPaddle);
  return true;
}

// *************************** GAME PAUSE/RESUME ***************************

function handlePauseGame(socket) {
  const gameId = socket.gameId;
  const userId = socket.userId;
  const gameRoom = validateGameAndPlayer(gameId, userId, socket, "pause");
  if (!gameRoom) return false;

  try {
    if (gameRoom.gameState.state !== Game.IN_PLAY) {
      fastify.log.warn(
        `Cannot pause game ${gameId} in state ${gameRoom.gameState.state}`
      );
      sendErrorAndClose(
        socket,
        "Game cannot be paused in current state",
        WS_CLOSE.POLICY_VIOLATION
      );
      return false;
    }

    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);

    broadcastAll(
      gameId,
      Message("gamePaused", {
        pausedBy: userId,
        reason: "userRequested",
        message: `Game paused by player ${userId}`,
      })
    );

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
      fastify.log.warn(
        `Cannot resume game ${gameId} in state ${gameRoom.gameState.state}`
      );
      sendToUser(
        gameId,
        userId,
        Message("error", { message: "Game cannot be resumed in current state" })
      );
      return false;
    }

    gameRoom.gameState.state = Game.IN_PLAY;
    resumeGame(gameId);

    broadcastAll(
      gameId,
      Message("gameResumed", {
        resumedBy: userId,
        reason: "userRequested",
        message: `Game resumed by player ${userId}`,
      })
    );

    fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error resuming game ${gameId}: ${error.message}`);
    return false;
  }
}

// *************************** DISCONNECTION HANDLING ***************************

function handleDisconnect(socket, closeCode) {
  const userId = socket.userId;
  const gameId = socket.gameId;

  if (!userId || !gameId) {
    fastify.log.error(`Cannot handle disconnect: Invalid socket state - gameId=${gameId}, userId=${userId}`);
    return;
  }
  
  fastify.log.info(
    `User ${userId} disconnected from game ${gameId} ${
      closeCode ? ` with code ${closeCode}` : ""
    }`
  );

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
  const userId = socket.userId;
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
      fastify.log.warn(
        `Unhandled game state ${gameState.state} in handleDisconnect for game ${gameId}`
      );
  }
}

function handleEarlyDisconnect(gameRoom, socket) {
  const userId = socket.userId;
  const gameId = socket.gameId;

  if (gameRoom.players[userId]) {
    delete gameRoom.players[userId];
    fastify.log.info(`Removed player ${userId} from the game ${gameId}`);
    broadcast(
      gameId,
      userId,
      Message("playerLeft", {
        message: "Opponent left the game",
        userId: userId,
      })
    );
  }
}

function handleActiveGameDisconnect(gameRoom, socket, closeCode) {
  const userId = socket.userId;
  const gameId = socket.gameId;
  const isIntentionalDisconnect =
    closeCode === WS_CLOSE.NORMAL || closeCode === WS_CLOSE.GOING_AWAY;

  const playerPosition = gameRoom.players[userId].position;
  gameRoom.disconnectedPlayers[userId] = {
    ...gameRoom.players[userId],
    disconnectedAt: Date.now(),
    intentionalDisconnect: isIntentionalDisconnect,
  };

  delete gameRoom.players[userId];

  fastify.log.info(
    `Removed player ${userId} (${playerPosition}) from active players in game ${gameId}`
  );

  // Handle last player disconnect
  if (Object.keys(gameRoom.players).length === 0) {
    handleLastPlayerDisconnect(gameRoom, socket);
    return;
  }

  // Pause game if it was in play
  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }

  // Notify players and setup reconnection timer
  broadcastDisconnectNotification(gameId, userId, isIntentionalDisconnect);
  setupReconnectionTimer(gameRoom, socket, isIntentionalDisconnect);
}

async function handleLastPlayerDisconnect(gameRoom, socket) {
  const gameId = socket.gameId;
  
  fastify.log.warn(
    `Last player disconnected from game ${gameId}, canceling game`
  );

  // Set game as canceled with no winner
  gameRoom.gameState.state = Game.CANCELED;
  gameRoom.gameState.winner = null;
  gameRoom.endedAt = new Date();

  broadcastAll(
    gameId,
    Message("gameFinished", {
      gameState: gameRoom.gameState,
      message: "Game canceled - both players disconnected",
      reason: "bothDisconnected",
      forfeit: true,
    })
  );

  try {
    // Get the game data from the database
    const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error(`Game ${gameId} not found in database`);
    }

    // Find which player is on which side
    const leftPlayerId = Object.values(gameRoom.players).find(p => p.position === "left")?.id;
    const rightPlayerId = Object.values(gameRoom.players).find(p => p.position === "right")?.id;

    // Map scores based on player positions
    let playerOneScore, playerTwoScore;
    if (game.playerOneId === leftPlayerId) {
      playerOneScore = gameRoom.gameState.score.left;
      playerTwoScore = gameRoom.gameState.score.right;
    } else {
      playerOneScore = gameRoom.gameState.score.right;
      playerTwoScore = gameRoom.gameState.score.left;
    }

    const updateData = {
      endedAt: new Date(),
      playerOneScore: playerOneScore,
      playerTwoScore: playerTwoScore,
      status: "CANCELED",
      winnerId: -1  // Use -1 to indicate no winner for canceled games
    };

    const updatedGame = await fastify.prisma.game.update({
      where: { id: gameId },
      data: updateData
    });

    fastify.log.info(
      `Game ${gameId} updated in database as canceled with scores ${playerOneScore}-${playerTwoScore}`
    );

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
      `Failed to update game ${gameId} in database: ${error.message}`
    );
  }
}

function broadcastDisconnectNotification(gameId, userId, isIntentionalDisconnect) {
  broadcastAll(
    gameId,
    Message("gamePaused", {
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
  const timeout = isIntentionalDisconnect
    ? gameRoom.intentionalDisconnectTime
    : gameRoom.maxReconnectTime;

  fastify.log.info(
    `Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`
  );

  gameRoom.disconnectTimer = setTimeout(async () => {
    await handleReconnectionTimeout(socket, gameRoom);
  }, timeout);
}

async function handleReconnectionTimeout(socket, gameRoom) {
  const userId = socket.userId;
  const gameId = socket.gameId;
  
  if (!gameRoom.disconnectedPlayers[userId]) return;

  stopGameLoop(gameId);
  gameRoom.gameState.state = Game.CANCELED;

  // Get the game data from the database
  const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error(`Game ${gameId} not found in database`);
  }

  // Check if both players are disconnected
  const activePlayers = Object.keys(gameRoom.players || {});
  const disconnectedPlayersCount = Object.keys(gameRoom.disconnectedPlayers || {}).length;
  
  if (activePlayers.length === 0 && disconnectedPlayersCount === 2) {
    // Case 1: Both players disconnected - keep original scores
    const leftPlayerId = Object.values(gameRoom.players).find(p => p.position === "left")?.id;
    const rightPlayerId = Object.values(gameRoom.players).find(p => p.position === "right")?.id;

    let playerOneScore, playerTwoScore;
    if (game.playerOneId === leftPlayerId) {
      playerOneScore = gameRoom.gameState.score.left;
      playerTwoScore = gameRoom.gameState.score.right;
    } else {
      playerOneScore = gameRoom.gameState.score.right;
      playerTwoScore = gameRoom.gameState.score.left;
    }

    gameRoom.endedAt = new Date();

    fastify.log.info(
      `Game ${gameId} finished - both players disconnected with score ${playerOneScore}-${playerTwoScore}`
    );

    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: gameRoom.gameState,
        message: `Game ended - both players disconnected with score ${playerOneScore}-${playerTwoScore}`,
        reason: "bothDisconnected",
        forfeit: true,
      })
    );

    try {
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

      fastify.log.info(
        `Game ${gameId} updated in database as canceled with scores ${playerOneScore}-${playerTwoScore}`
      );

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
        `Failed to update game ${gameId} in database: ${error.message}`
      );
    }
  } else {
    // Case 2: One player disconnected - set score to 10-0
    const disconnectedPosition = gameRoom.disconnectedPlayers[userId].position;
    const winnerPosition = disconnectedPosition === "left" ? "right" : "left";
    
    // Update scores - ensure both scores are set correctly
    if (disconnectedPosition === "left") {
      gameRoom.gameState.score.left = 0;
      gameRoom.gameState.score.right = 10;
    } else {
      gameRoom.gameState.score.left = 10;
      gameRoom.gameState.score.right = 0;
    }
    gameRoom.gameState.winner = winnerPosition;

    // Find the winner's userId from the remaining players
    const remainingPlayers = Object.values(gameRoom.players);
    const winnerPlayer = remainingPlayers.find(player => player.position === winnerPosition);
    const winnerId = winnerPlayer ? winnerPlayer.id : null;

    gameRoom.endedAt = new Date();

    fastify.log.info(
      `Game ${gameId} finished - reconnecting player ${userId} (${disconnectedPosition}) lost with score ${gameRoom.gameState.score.left}-${gameRoom.gameState.score.right}`
    );

    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: gameRoom.gameState,
        message: `Game ended - reconnecting player lost with score ${gameRoom.gameState.score.left}-${gameRoom.gameState.score.right}`,
        reason: "reconnectionTimeout",
        forfeit: true,
      })
    );

    try {
      await updateGameInDatabase(socket, gameRoom, winnerId);
    } catch (error) {
      fastify.log.error(
        `Failed to update game ${gameId} in database: ${error.message}`
      );
    }
  }
}

// *************************** GAME OVER HANDLING ***************************

async function handleGameOver(gameId, finalGameState) {
  try {
    fastify.log.info(
      `Game ${gameId} has ended. Winner: ${finalGameState.winner}, Score: ${finalGameState.score.left}-${finalGameState.score.right}`
    );

    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(
        `Cannot handle game over for non-existent game ${gameId}`
      );
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

    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: finalGameState,
        endTime: gameRoom.endedAt,
        message: `Game finished. Winner: ${finalGameState.winner}, Score: ${finalGameState.score.left}-${finalGameState.score.right}`,
      })
    );

    try {
      // Get the game data from the database
      const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new Error(`Game ${gameId} not found in database`);
      }

      // Find which player is on which side
      const leftPlayerId = Object.values(gameRoom.players).find(p => p.position === "left")?.id;
      const rightPlayerId = Object.values(gameRoom.players).find(p => p.position === "right")?.id;

      // Map scores based on player positions
      let playerOneScore, playerTwoScore;
      if (game.playerOneId === leftPlayerId) {
        playerOneScore = finalGameState.score.left;
        playerTwoScore = finalGameState.score.right;
      } else {
        playerOneScore = finalGameState.score.right;
        playerTwoScore = finalGameState.score.left;
      }

      // Determine winner based on scores
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

      fastify.log.info(
        `Game ${gameId} updated in database with winner ID: ${winnerId} (Score: ${playerOneScore}-${playerTwoScore}, Left: ${finalGameState.score.left}, Right: ${finalGameState.score.right})`
      );

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
    fastify.log.error(
      `Error in handleGameOver for game ${gameId}: ${error.message}`
    );
    stopGameLoop(gameId);
    broadcastAll(
      gameId,
      Message("gameError", {
        message: "Game ended with errors",
        gameId: gameId,
      })
    );
  }
}

// *************************** UTILITY FUNCTIONS ***************************

function validateGameAndPlayer(gameId, userId, socket, action) {
  const gameRoom = gameRooms.get(gameId);

  if (!gameRoom) {
    fastify.log.warn(
      `Attempt to ${action} non-existent game ${gameId} by user ${userId}`
    );
    if (socket) {
      sendErrorAndClose(
        socket,
        "Game does not exist",
        WS_CLOSE.POLICY_VIOLATION
      );
    }
    return null;
  }

  if (!gameRoom.players[userId]) {
    fastify.log.warn(
      `Unauthorized attempt to ${action} game ${gameId} by user ${userId}`
    );
    if (socket) {
      sendErrorAndClose(
        socket,
        `You are not authorized to ${action} this game`,
        WS_CLOSE.POLICY_VIOLATION
      );
    }
    return null;
  }

  return gameRoom;
}