import { fastify } from "../server.js";
import { connections } from "../gameLogic/gameConfig.js";
import { WS_CLOSE, Game } from "../gameLogic/gameConfig.js";

export const Message = (messageType, messagePayload) =>
  JSON.stringify({ type: messageType, data: messagePayload });

export function hasTwoConnectedPlayers(gameId) {
  if (!connections.has(gameId)) {
    return false;
  }
  const gameConnections = connections.get(gameId);
  return [...gameConnections.keys()].length >= 2;
}

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

      // If gameData exists in gameRoom, use it for permission check
      if (gameRoom.gameData) {
        const game = gameRoom.gameData;
        if (game.playerOneId === userId || game.playerTwoId === userId) {
          return { hasPermission: true, gameData: game };
        }
      }
    }

    // If we don't have game data in gameRoom, fetch from database
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
      // Store game data in the room for easy player identification
      if (gameRooms.has(gameId)) {
        gameRooms.get(gameId).gameData = game;
        fastify.log.info(`Stored game data in gameRoom for ${gameId}`);
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

export function runHeartBeatMechanism(socket, gameId, userId) {
  socket.isAlive = true;
  const pingInterval = setInterval(() => {
    if (socket.isAlive === false) {
      if (connections.has(gameId)) {
        const gameConnections = connections.get(gameId);
        if (gameConnections.get(userId) === socket) {
          gameConnections.delete(userId);
          fastify.log.info(
            `Removed dead connection for user ${userId} in game ${gameId}`
          );
        }
        if (gameConnections.size === 0) {
          connections.delete(gameId);
          fastify.log.info(`Removed empty game ${gameId} from connections`);
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

      // Copy user object from old socket if available
      if (oldSocket.user) {
        newSocket.user = oldSocket.user;
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

export function setupNewConnection(gameId, userId, socket) {
  if (!connections.has(gameId)) {
    connections.set(gameId, new Map([[userId, socket]]));
    return true;
  } else if (hasTwoConnectedPlayers(gameId)) {
    sendErrorAndClose(socket, "Game room is full", WS_CLOSE.POLICY_VIOLATION);
    return false;
  } else {
    connections.get(gameId).set(userId, socket);
    return true;
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
    const game =
      gameRoom.gameData ||
      (await fastify.prisma.game.findUnique({
        where: { id: gameId },
      }));

    if (!game) {
      fastify.log.error(`Game ${gameId} not found in database for update`);
      return false;
    }

    // Determine winner ID based on player position (left/right)
    let winnerId = null;

    // Check if we have a valid winner position
    if (winner === "left" && game.playerOneId) {
      winnerId = game.playerOneId;
      fastify.log.info(`Left player wins, winnerId set to ${winnerId}`);
    } else if (winner === "right" && game.playerTwoId) {
      winnerId = game.playerTwoId;
      fastify.log.info(`Right player wins, winnerId set to ${winnerId}`);
    } else if (Object.keys(gameRoom.players).length > 0) {
      // Fallback: use one of the remaining players if we have any
      winnerId = parseInt(Object.keys(gameRoom.players)[0]);
      fastify.log.info(`Used remaining player as winner: ${winnerId}`);
    } else {
      // Final fallback if no players left and we can't determine from position
      fastify.log.warn(`Could not determine a winner for game ${gameId}`);

      // Check disconnected players as a final resort
      const disconnectedPlayerIds = Object.keys(
        gameRoom.disconnectedPlayers || {}
      );
      if (disconnectedPlayerIds.length > 0) {
        // If there's only one disconnected player, the other is the winner
        if (disconnectedPlayerIds.length === 1) {
          const disconnectedId = parseInt(disconnectedPlayerIds[0]);

          // If playerOne is disconnected, playerTwo wins
          if (disconnectedId === game.playerOneId) {
            winnerId = game.playerTwoId;
            fastify.log.info(
              `Using player two as winner since player one disconnected`
            );
          }
          // If playerTwo is disconnected, playerOne wins
          else if (disconnectedId === game.playerTwoId) {
            winnerId = game.playerOneId;
            fastify.log.info(
              `Using player one as winner since player two disconnected`
            );
          }
        }
      }

      // If we still couldn't determine a winner, update without one
      if (!winnerId) {
        await fastify.prisma.game.update({
          where: { id: gameId },
          data: {
            status: "FINISHED",
            endedAt: new Date(),
            playerOneScore: gameRoom.gameState.score.left,
            playerTwoScore: gameRoom.gameState.score.right,
            // Omit winnerId field
          },
        });

        return true;
      }
    }

    // Update with winner
    await fastify.prisma.game.update({
      where: { id: gameId },
      data: {
        status: "FINISHED",
        endedAt: gameRoom.endedAt || new Date(),
        playerOneScore: gameRoom.gameState.score.left,
        playerTwoScore: gameRoom.gameState.score.right,
        winnerId: winnerId,
      },
    });

    fastify.log.info(
      `Game ${gameId} updated in database with winner ID: ${winnerId}`
    );
    return true;
  } catch (error) {
    fastify.log.error(
      `Failed to update game ${gameId} in database: ${error.message}`
    );
    return false;
  }
}
