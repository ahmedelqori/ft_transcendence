import { fastify } from "../server.js";
import { websocketRouteSchema } from "../routes/game.routes.js";
import {
  startGameLoop,
  stopGameLoop,
  updatePaddlePosition,
  resetBallAndPaddles,
  pauseGame,
  resumeGame,
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
  checkChangingDevice
} from "./game.socket.utils.js";
import { authenticate } from "../middlewares/auth.middleware.js";

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

  socket.on("close", (event) => {
    fastify.log.warn(`socket close event triggred with code ${event}`);
    clearInterval(socket.pingInterval);
    if (socket.changed) {
      return;
    }
    handleDisconnect(socket.gameId, socket.userId, event);
  });
}

// *************************** MESSAGE HANDLERS ***************************

function handleMessage(socket, data) {
  const messageHandlers = {
    joinGame: () => handleJoinGame(socket),
    paddleMove: () => handlePaddleMove(socket.gameId, socket.userId, data.position),
    pauseGame: () => handlePauseGame(socket.gameId, socket.userId),
    resumeGame: () => handleResumeGame(socket.gameId, socket.userId),
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
    let gameRoom = gameRooms.get(socket.gameId);
    if (!gameRoom) {
      gameRoom = createGameRoom(socket.gameId);
      gameRooms.set(socket.gameId, gameRoom);
      fastify.log.info(`Created new game room for game ${socket.gameId}`);
    }

    if (socket.alreadyJoined){
      fastify.log.info(
        `Skipping redundant join request from user ${socket.userId} who already joined`
      );
      return;
    }

    if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[socket.userId]) {
      return handlePossibleReconnection(socket.gameId, socket.userId, gameRoom);
    }

    handleNewPlayerJoin(socket.gameId, socket.userId, gameRoom);
  } catch (error) {
    fastify.log.error(
      `Error in handleJoinGame for game ${socket.gameId}, user ${socket.userId}: ${error.message}`
    );
    sendToUser(
      socket.gameId,
      socket.userId,
      Message("error", {
        message: "Failed to join game due to an internal error",
      })
    );
  }
}

function handlePossibleReconnection(gameId, userId, gameRoom) {
  const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
  const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;

  if (reconnectTime <= gameRoom.maxReconnectTime) {
    return handleReconnection(gameId, userId, gameRoom);
  } else {
    fastify.log.warn(
      `Player ${userId} reconnection window expired (${reconnectTime}ms > ${gameRoom.maxReconnectTime}ms)`
    );
    handleTimeOutReconnection(gameId, userId, gameRoom);
    return false;
  }
}

function handleNewPlayerJoin(gameId, userId, gameRoom) {
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
  }
}

// *************************** RECONNECTION HANDLING ***************************

function handleReconnection(gameId, userId, gameRoom) {
  try {
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

    // Update all clients with current game state
    broadcastAll(gameId, Message("gameStateUpdate", gameRoom.gameState));
    return true;
  } catch (error) {
    fastify.log.error(
      `Error in handleReconnection for game ${gameId}, user ${userId}: ${error.message}`
    );
    return false;
  }
}

function handleTimeOutReconnection(gameId, userId, gameRoom) {
  try {
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

    if (
      gameRoom.gameState.state === Game.START ||
      gameRoom.gameState.state === Game.JOINED
    ) {
      const playersNum = Object.keys(gameRoom.players).length;
      if (playersNum < 2) {
        const newPosition = playersNum === 0 ? "left" : "right";
        gameRoom.players[userId] = {
          id: userId,
          position: newPosition,
        };

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

    if (
      gameRoom.gameState.state === Game.PAUSED ||
      gameRoom.gameState.state === Game.IN_PLAY
    ) {
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
    fastify.log.error(`Error in handleTimeOutReconnection: ${error.message}`);
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
      if (updatedGameState.state == Game.FINISHED) {
        handleGameOver(gameId, updatedGameState);
      }
      broadcastAll(gameId, Message("gameStateUpdate", updatedGameState));
    } catch (loopError) {
      fastify.log.error(
        `Error in game loop for game ${gameId}: ${loopError.message}`
      );
    }
  });
  return true;
}

// *************************** PADDLE MOVEMENT ***************************

function handlePaddleMove(gameId, userId, position) {
  const socket = connections.get(gameId)?.get(userId);
  const gameRoom = gameRooms.get(gameId);

  if (!gameRoom || !socket) {
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

function handlePauseGame(gameId, userId) {
  const socket = connections.get(gameId)?.get(userId);
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

function handleResumeGame(gameId, userId) {
  const socket = connections.get(gameId)?.get(userId);
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

// *************************** DISCONNECT HANDLING ***************************

function handleDisconnect(gameId, userId, closeCode) {
  fastify.log.info(
    `User ${userId} disconnected from game ${gameId} ${
      closeCode ? ` with code ${closeCode}` : ""
    }`
  );

  if (connections.has(gameId)) {
    connections.get(gameId).delete(userId);
    if (connections.get(gameId).size === 0) {
      connections.delete(gameId);
    }
  }

  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    fastify.log.warn(`No game room found for ${gameId}, nothing to clean up`);
    return;
  }

  switch (gameRoom.gameState.state) {
    case Game.CANCELED:
    case Game.FINISHED:
      return;
    case Game.START:
    case Game.JOINED:
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
      return;
    case Game.IN_PLAY:
    case Game.PAUSED:
      disconnectTimeout(gameRoom, gameId, userId, closeCode);
      return;
    default:
      fastify.log.warn(
        `Unhandled game state ${gameRoom.gameState.state} in handleDisconnect for game ${gameId}`
      );
      return;
  }
}

function disconnectTimeout(gameRoom, gameId, userId, closeCode) {
  const isIntentionalDisconnect =
    closeCode === WS_CLOSE.NORMAL || closeCode === WS_CLOSE.GOING_AWAY;

  const playerPosition = gameRoom.players[userId].position;

  gameRoom.disconnectedPlayers[userId] = {
    ...gameRoom.players[userId],
    disconnectedAt: Date.now(),
    intentionalDisconnect: isIntentionalDisconnect,
  };

  const remainingPlayers = { ...gameRoom.players };
  delete remainingPlayers[userId];
  delete gameRoom.players[userId];

  fastify.log.info(
    `Removed player ${userId} (${playerPosition}) from active players in game ${gameId}`
  );

  const remainingPlayerIds = Object.keys(remainingPlayers);
  const remainingPlayerId =
    remainingPlayerIds.length > 0 ? remainingPlayerIds[0] : null;

  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }

  if (remainingPlayerIds.length === 0) {
    fastify.log.warn(
      `Last player disconnected from game ${gameId}, ending game`
    );

    setWinnerByPosition(gameRoom, playerPosition);

    gameRoom.gameState.state = Game.CANCELED;
    gameRoom.endedAt = new Date();

    updateGameInDatabase(gameId, gameRoom, gameRoom.gameState.winner)
      .then(() => {
        fastify.log.info(
          `Game ${gameId} updated in database after all players disconnected`
        );
      })
      .catch((error) => {
        fastify.log.error(
          `Failed to update game ${gameId} in database: ${error.message}`
        );
      });

    return;
  }

  broadcastAll(
    gameId,
    Message("gamePaused", {
      reason: "playerDisconnected",
      message: "Player disconnected. Waiting for reconnection...",
      intentional: isIntentionalDisconnect,
      userId: userId,
    })
  );

  const timeout = isIntentionalDisconnect
    ? gameRoom.intentionalDisconnectTime
    : gameRoom.maxReconnectTime;

  fastify.log.info(
    `Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`
  );

  gameRoom.disconnectTimer = setTimeout(async () => {
    await handleReconnectionTimeout(gameId, userId, gameRoom);
  }, timeout);
}

async function handleReconnectionTimeout(gameId, userId, gameRoom) {
  if (gameRoom.disconnectedPlayers[userId]) {
    stopGameLoop(gameId);
    gameRoom.gameState.state = Game.CANCELED;

    let winnerId = null;

    const remainingPlayerIds = Object.keys(gameRoom.players);
    if (remainingPlayerIds.length > 0) {
      winnerId = remainingPlayerIds[0];
      fastify.log.info(
        `Determining winner: Player ${winnerId} with position ${gameRoom.players[winnerId]?.position}`
      );
    } else {
      const disconnectedPosition =
        gameRoom.disconnectedPlayers[userId]?.position;
      if (disconnectedPosition === "left") {
        winnerId = setWinnerByPosition(gameRoom, "right");
      } else if (disconnectedPosition === "right") {
        winnerId = setWinnerByPosition(gameRoom, "left");
      } else {
        fastify.log.warn(
          `Could not determine winner position. disconnectedPosition=${disconnectedPosition}`
        );
      }
    }

    gameRoom.endedAt = new Date();

    fastify.log.info(
      `Game ${gameId} finished due to player disconnect. Winner ID: ${winnerId}`
    );

    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: gameRoom.gameState,
        message: winnerId
          ? `Game won by ${winnerId} due to opponent disconnection`
          : "Game ended due to disconnection",
        reason: gameRoom.disconnectedPlayers[userId].intentionalDisconnect
          ? "playerLeft"
          : "connectionTimeout",
        forfeit: true,
      })
    );

    try {
      await updateGameInDatabase(gameId, gameRoom, gameRoom.gameState.winner);
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
      `Game ${gameId} has ended. Winner: ${finalGameState.winner}`
    );

    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(
        `Cannot handle game over for non-existent game ${gameId}`
      );
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
        message: `Game finished. Winner: ${finalGameState.winner}`,
      })
    );

    try {
      await updateGameInDatabase(gameId, gameRoom, finalGameState.winner);
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

function setWinnerByPosition(gameRoom, position) {
  if (position === "left") {
    gameRoom.gameState.winner = "right";
    gameRoom.gameState.score.right = defaultGameConfig.scoreToWin;
    gameRoom.gameState.score.left = 0;
    return "right";
  } else if (position === "right") {
    gameRoom.gameState.winner = "left";
    gameRoom.gameState.score.left = defaultGameConfig.scoreToWin;
    gameRoom.gameState.score.right = 0;
    return "left";
  } else {
    fastify.log.warn(`Invalid position for determining winner: ${position}`);
    return null;
  }
}