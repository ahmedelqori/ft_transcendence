import { fastify } from "../server.js";
import {
  startGameLoop,
  stopGameLoop,
  updatePaddlePosition,
  resetBallAndPaddles,
  gameLoops,
  pauseGame,
  resumeGame
} from "../gameLogic/gameplay.js";
import {
  defaultGameConfig,
  WS_CLOSE,
  Game,
  createGameRoom,
  CLEANUP
} from "../gameLogic/gameConfig.js";
import {
  sendErrorAndClose,
  Message,
  sendToUser,
} from "./game.socket.utils.js";
import { authenticate} from "../middlewares/auth.middleware.js";

export const localGameConnections = new Map();
export const localGameRooms = new Map();

export const localWebsocketRouteSchema = {
  params: {
    type: 'object',
    required: ['gameId'],
    properties: {
      gameId: { 
        type: 'string', 
        pattern: '^local_[0-9]+$',
        description: 'Local Game ID'
      }
    }
  }
};

export const setupLocalWebSocketHandlers = async function (fastify) {
  fastify.log.info("Registering Local Game WebSocket handlers");

  fastify.get(
    ":gameId",
    {
      websocket: true,
      schema: localWebsocketRouteSchema,
      preHandler: authenticate,
    },
    handleLocalWebSocketConnection
  );
};

async function handleLocalWebSocketConnection(socket, req) {
  const gameId = req.params.gameId;
  
  if (!gameId.startsWith('local_')) {
    sendErrorAndClose(
      socket,
      "Invalid local game ID format",
      WS_CLOSE.POLICY_VIOLATION
    );
    return;
  }

  fastify.log.info(`Local game WebSocket connection: gameId=${gameId}`);
  
  let gameRoom = localGameRooms.get(gameId);
  if (!gameRoom) {
    gameRoom = createGameRoom(gameId);
    localGameRooms.set(gameId, gameRoom);
    fastify.log.info(`Created new local game room: ${gameId}`);
  }
  const userId = `player_${Date.now()}`;
  socket.gameId = gameId;
  socket.userId = userId;
  
  if (!localGameConnections.has(gameId)) {
    localGameConnections.set(gameId, new Map());
  }
  localGameConnections.get(gameId).set(userId, socket);

  socket.send(Message("connected", { message: "Local game connected" }));
  socket.send(
    Message("initGame", {
      gameConfig: defaultGameConfig,
      gameState: gameRoom.gameState,
      player: req.user
    })
  );

  setupLocalSocketEventHandlers(socket);
}

function setupLocalSocketEventHandlers(socket) {
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleLocalMessage(socket, data);
    } catch (err) {
      fastify.log.error(`Error parsing local game message: ${err}`);
      sendErrorAndClose(
        socket,
        "Invalid message format",
        WS_CLOSE.INTERNAL_ERROR
      );
    }
  });

  socket.on("close", () => {
    clearInterval(socket.pingInterval);
    handleLocalDisconnect(socket.gameId, socket.userId);
  });
}

function handleLocalMessage(socket, data) {
  const messageHandlers = {
    startOfflineGame: () => handleOfflineGameStart(socket),
    joinGame: () => handleOfflineGameStart(socket),
    offlinePaddleMove: () => handleOfflinePaddleMove(socket.gameId, socket.userId, data.position, data.side),
    pauseGame: () => handlePauseLocalGame(socket.gameId),
    resumeGame: () => handleResumeLocalGame(socket.gameId),
  };

  const handler = messageHandlers[data.type];
  if (handler) {
    handler();
  } else {
    fastify.log.warn(`Unknown message type for local game: ${data.type}`);
    socket.send(Message("error", { message: "Unknown message type" }));
  }
}

function handleOfflineGameStart(socket) {
  try {
    let gameRoom = localGameRooms.get(socket.gameId);
    if (!gameRoom) {
      gameRoom = createGameRoom(socket.gameId);
      localGameRooms.set(socket.gameId, gameRoom);
    }

    gameRoom.isOfflineGame = true;
    gameRoom.players[socket.userId] = {
      id: socket.userId,
      position: "offline-controller",
    };

    fastify.log.info(`Player ${socket.userId} started local game ${socket.gameId}`);

    sendToUser(
      socket.gameId,
      socket.userId,
      Message("joinedOfflineGame", {
        gameId: socket.gameId,
        userId: socket.userId,
        gameState: gameRoom.gameState,
      })
    );

    gameRoom.gameState.state = Game.JOINED;
    setTimeout(() => {
      if (gameRoom.gameState.state === Game.JOINED) {
        initiateLocalGameStart(socket.gameId, socket.userId, gameRoom);
      }
    }, 1000);
  } catch (error) {
    fastify.log.error(
      `Error in handleOfflineGameStart: ${error.message}`
    );
    socket.send(Message("error", { message: "Failed to start local game" }));
  }
}

function initiateLocalGameStart(gameId, userId, gameRoom) {
  gameRoom.gameState.state = Game.IN_PLAY;
  resetBallAndPaddles(gameRoom.gameState);
  const connections = localGameConnections.get(gameId);
  if (!connections) return;
  for (const socket of connections.values()) {
    socket.send(Message("gameStarted", {
      startedBy: userId,
      gameState: gameRoom.gameState,
    }));
  }

  fastify.log.info(`Local game ${gameId} started`);
  startGameLoop(gameId, gameRoom.gameState, (updatedGameState) => {
    try {
      if (updatedGameState.state === Game.FINISHED) {
        handleLocalGameOver(gameId, updatedGameState);
      }
      const gameLoop = gameLoops.get(gameId);
      if (gameLoop && gameLoop.running) {
        const connections = localGameConnections.get(gameId);
        if (connections) {
          for (const socket of connections.values()) {
            socket.send(Message("gameStateUpdate", updatedGameState));
          }
        }
      }
    } catch (loopError) {
      fastify.log.error(`Error in local game loop: ${loopError.message}`);
    }
  });
}

function handleOfflinePaddleMove(gameId, userId, position, side) {
  const gameRoom = localGameRooms.get(gameId);
  if (!gameRoom) return false;
  const pos = Number(position);
  if (isNaN(pos)) {
    fastify.log.warn(`Invalid position value from local game: ${position}`);
    return false;
  }
  if (gameRoom.gameState.state !== Game.IN_PLAY) return false;
  const isLeftPaddle = side === "left";
  updatePaddlePosition(gameRoom.gameState, userId, pos, isLeftPaddle);
  return true;
}

function handlePauseLocalGame(gameId) {
  const gameRoom = localGameRooms.get(gameId);
  if (!gameRoom) return;
  if (gameRoom.gameState.state !== Game.IN_PLAY) return;
  gameRoom.gameState.state = Game.PAUSED;
  pauseGame(gameId);
  const connections = localGameConnections.get(gameId);
  if (connections) {
    for (const socket of connections.values()) {
      socket.send(Message("gamePaused", {
        reason: "userRequested",
        message: "Game paused"
      }));
    }
  }
  fastify.log.info(`Local game ${gameId} paused`);
}

function handleResumeLocalGame(gameId) {
  const gameRoom = localGameRooms.get(gameId);
  if (!gameRoom) return;
  if (gameRoom.gameState.state !== Game.PAUSED) return;
  gameRoom.gameState.state = Game.IN_PLAY;
  resumeGame(gameId);
  const connections = localGameConnections.get(gameId);
  if (connections) {
    for (const socket of connections.values()) {
      socket.send(Message("gameResumed", {
        reason: "userRequested",
        message: "Game resumed"
      }));
    }
  }
  fastify.log.info(`Local game ${gameId} resumed`);
}

function handleLocalDisconnect(gameId, userId) {
  fastify.log.info(`User disconnected from local game ${gameId}`);
  if (localGameConnections.has(gameId)) {
    localGameConnections.get(gameId).delete(userId);
    if (localGameConnections.get(gameId).size === 0) {
      localGameConnections.delete(gameId);
      stopGameLoop(gameId);
      setTimeout(() => {
        localGameRooms.delete(gameId);
        fastify.log.info(`Local game ${gameId} resources cleaned up`);
      }, CLEANUP);
    }
  }
}

async function handleLocalGameOver(gameId, finalGameState) {
  const gameRoom = localGameRooms.get(gameId);
  if (!gameRoom) return;
  gameRoom.gameState.state = Game.FINISHED;
  gameRoom.endedAt = Date.now();
  stopGameLoop(gameId);
  const connections = localGameConnections.get(gameId);
  if (connections) {
    for (const socket of connections.values()) {
      socket.send(Message("gameFinished", {
        gameState: finalGameState,
        endTime: gameRoom.endedAt,
        message: `Game finished. Winner: ${finalGameState.winner}`,
      }));
    }
  }
  setTimeout(() => {
    localGameRooms.delete(gameId);
    localGameConnections.delete(gameId);
    fastify.log.info(`Local game ${gameId} resources cleaned up`);
  }, CLEANUP);
}