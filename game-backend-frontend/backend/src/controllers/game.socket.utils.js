import { fastify } from "../server.js";
import { connections } from "../gameLogic/gameConfig.js";
import { WS_CLOSE, Game } from "../gameLogic/gameConfig.js";

export const Message = (messageType, messagePayload) =>
  JSON.stringify({ type: messageType, data: messagePayload });

export function sendErrorAndClose(socket, message, code) {
  socket.send(Message("error", { message: message }));
  socket.close(code);
}

export async function checkUserGamePermission(gameId, userId, gameRooms) {
  try {
    const gameRoom = gameRooms?.get(gameId);
    if (gameRoom) {
      if (
        gameRoom.gameState.state === Game.FINISHED ||
        gameRoom.gameState.state === Game.CANCELED
      ) {
        fastify.log.warn(
          `Cannot join a ${Game[gameRoom.gameState.state]} game ${gameId}`
        );
        return {
          hasPermission: false,
          reason: `This game has already ended (${
            Game[gameRoom.gameState.state]
          })`,
        };
      }

      if (gameRoom.gameData) {
        const game = gameRoom.gameData;
        if (game.playerOneId === userId || game.playerTwoId === userId) {
          return { hasPermission: true, gameData: game };
        }
      }
    }

    const game = await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      fastify.log.warn(`Game ${gameId} not found in database`);
      return { hasPermission: false, reason: "Game not found" };
    }

    if (["FINISHED", "CANCELED"].includes(game.status)) {
      fastify.log.warn(`Cannot join a ${game.status} game ${gameId}`);
      return {
        hasPermission: false,
        reason: `This game has already ended (${game.status})`,
      };
    }

    if (game.playerOneId === userId || game.playerTwoId === userId) {
      if (gameRooms.has(gameId)) {
        gameRooms.get(gameId).gameData = game;
      }
      return { hasPermission: true, gameData: game };
    }

    fastify.log.warn(
      `User ${userId} attempted to join game ${gameId} without permission`
    );
    return {
      hasPermission: false,
      reason: "You don't have permission to join this game",
    };
  } catch (error) {
    fastify.log.error(
      `Error checking game permissions for ${gameId}: ${error.message}`
    );
    return {
      hasPermission: false,
      reason: "Server error while checking permissions",
    };
  }
}

export function runHeartBeatMechanism(socket) {
  socket.isAlive = true;
  const pingInterval = setInterval(() => {
    if (socket.isAlive === false) {
      if (connections.has(socket.gameId)) {
        const gameConnections = connections.get(socket.gameId);
        if (gameConnections.get(socket.userId) === socket) {
          gameConnections.delete(socket.userId);
          fastify.log.info(
            `Removed dead connection for user ${socket.userId} in game ${socket.gameId}`
          );
        }
        if (gameConnections.size === 0) {
          connections.delete(socket.gameId);
          fastify.log.info(`Removed empty game ${socket.gameId} from connections`);
        }
      }
      clearInterval(pingInterval);
      socket.terminate();
      return;
    }
    socket.isAlive = false;
    try {
      socket.ping();
    } catch (err) {
      fastify.log.error(`${err.message}`);
    }
  }, 5000);

  if (!socket.pongActive) {
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.pongActive = true;
  }
  return pingInterval;
}

// *************************** MESSAGING UTILITIES ***************************
export function sendToUser(gameId, userId, data) {
  const socket = connections.get(gameId)?.get(userId);
  if (!socket) return false;

  try {
    socket.send(data);
    return true;
  } catch (err) {
    fastify.log.error(`Error sending to user ${userId}: ${err.message}`);
    return false;
  }
}

export function broadcast(gameId, excludeUserId, data) {
  if (!connections.has(gameId)) return;

  for (const [userId, socket] of connections.get(gameId).entries()) {
    if (userId !== excludeUserId) {
      try {
        socket.send(data);
      } catch (err) {
        fastify.log.error(
          `Error broadcasting to user ${userId}: ${err.message}`
        );
      }
    }
  }
}

export function broadcastAll(gameId, data) {
  if (!connections.has(gameId)) return;

  for (const socket of connections.get(gameId).values()) {
    try {
      socket.send(data);
    } catch (err) {
      fastify.log.error(`Error broadcasting: ${err.message}`);
    }
  }
}

// *************************** CONNECTION UTILITIES ***************************
export function handleOldConnection(
  gameId,
  userId,
  newSocket,
  gameRooms,
  defaultGameConfig
) {
  const oldSocket = connections.get(gameId).get(userId);

  if (oldSocket && oldSocket !== newSocket) {
    try {
      oldSocket.changed = true;
      oldSocket.send(
        Message("error", {
          message:
            "Your game session was opened in another device and will be terminated here.",
        })
      );
      connections.get(gameId).set(userId, newSocket);
      oldSocket.close(WS_CLOSE.NORMAL);
      fastify.log.warn(
        `User ${userId} connected from a new location, terminating previous session`
      );
      newSocket.send(
        Message("info", {
          message:
            "You were already connected from another location. That session has been terminated.",
        })
      );

      const gameRoom = gameRooms.get(gameId);
      if (gameRoom && gameRoom.gameState) {
        newSocket.alreadyJoined = true;
        newSocket.send(
          Message("initGame", {
            gameConfig: defaultGameConfig,
            gameState: gameRoom.gameState,
          })
        );

        if (gameRoom.players && gameRoom.players[userId]) {
          const playerPosition = gameRoom.players[userId].position;
          sendToUser(
            gameId,
            userId,
            Message("joinedGame", {
              gameId: gameId,
              userId: userId,
              position: playerPosition,
              players: Object.values(gameRoom.players),
              gameState: gameRoom.gameState,
            })
          );
        }
      }

      fastify.log.info(
        `Sent current game state to reconnected player ${userId} from new location`
      );
      return true;
    } catch (err) {
      fastify.log.error(`Error for user ${userId}: ${err.message}`);
      return false;
    }
  }
  return false;
}

export function checkChangingDevice(connections, socket, gameRooms, defaultGameConfig, setupSocketEventHandlers){
    if (connections.has(socket.gameId) && connections.get(socket.gameId).has(socket.userId)) {
      handleOldConnection(socket.gameId, socket.userId, socket, gameRooms, defaultGameConfig);
      setupSocketEventHandlers(socket);
      return true;
    } else {
        setupNewConnection(connections, socket)
        return false;
      }
}



export function setupNewConnection(connections, socket) {
  if (!connections.has(socket.gameId)) {
    connections.set(socket.gameId, new Map([[socket.userId, socket]]));
  } else {
    connections.get(socket.gameId).set(socket.userId, socket);
  }
}

export function sendInitialGameData(
  gameId,
  socket,
  gameRooms,
  defaultGameConfig,
  createGameState
) {
  let gameRoom = gameRooms.get(gameId);
  if (gameRoom) {
    socket.send(
      Message("initGame", {
        gameConfig: defaultGameConfig,
        gameState: gameRoom.gameState,
      })
    );
  } else {
    socket.send(
      Message("initGame", {
        gameConfig: defaultGameConfig,
        gameState: createGameState(),
      })
    );
  }
}

export async function updateGameInDatabase(gameId, gameRoom, winner) {
  try {
    const game = gameRoom.gameData || await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });
    const updateData = {
      endedAt: new Date(),
      playerOneScore: gameRoom.gameState.score.left,
      playerTwoScore: gameRoom.gameState.score.right
    };
    
    const activePlayersCount = Object.keys(gameRoom.players || {}).length;
    const disconnectedPlayersCount = Object.keys(gameRoom.disconnectedPlayers || {}).length;
    
    if (activePlayersCount === 0 && disconnectedPlayersCount === 2) {
      updateData.status = "CANCELED";
      fastify.log.info(`Game ${gameId} marked as CANCELED since both players disconnected`);
      
      await fastify.prisma.game.update({
        where: { id: gameId },
        data: updateData
      });
      return true;
    }
    updateData.status = "FINISHED";
    let winnerId = determineWinnerId(winner, game, gameRoom);
    if (winnerId) {
      updateData.winnerId = winnerId;
    }

    await fastify.prisma.game.update({
      where: { id: gameId },
      data: updateData
    });
    
    fastify.log.info(winnerId 
      ? `Game ${gameId} updated in database with winner ID: ${winnerId}` 
      : `Game ${gameId} updated in database without a winner`
    );
    return true;
  } catch (error) {
    fastify.log.error(
      `Failed to update game ${gameId} in database: ${error.message}`
    );
    return false;
  }
}

function determineWinnerId(winner, game, gameRoom) {
  const activePlayersCount = Object.keys(gameRoom.players || {}).length;
  const disconnectedPlayersCount = Object.keys(gameRoom.disconnectedPlayers || {}).length;
  
  if (activePlayersCount === 0 && disconnectedPlayersCount === 2) {
    fastify.log.info(`Both players disconnected - no winner determined`);
    return null;
  }

  if (winner === "left" && game.playerOneId) {
    fastify.log.info(`Left player wins, winnerId set to ${game.playerOneId}`);
    return game.playerOneId;
  }
  
  if (winner === "right" && game.playerTwoId) {
    fastify.log.info(`Right player wins, winnerId set to ${game.playerTwoId}`);
    return game.playerTwoId;
  }
  
  const activePlayers = Object.keys(gameRoom.players || {});
  if (activePlayers.length > 0) {
    const lastPlayerId = parseInt(activePlayers[0]);
    fastify.log.info(`Used remaining active player as winner: ${lastPlayerId}`);
    return lastPlayerId;
  }
  fastify.log.warn(`Could not determine a winner for game ${game.id}`);
  return null;
}
