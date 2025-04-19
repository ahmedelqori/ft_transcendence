import { fastify } from "../server.js";
import {connections} from '../gameLogic/gameConfig.js';

export const Message = (messageType, messagePayload) => JSON.stringify({type:messageType, data:messagePayload})

export function hasTwoConnectedPlayers(gameId) {
  if (!connections.has(gameId)) {
    return false;
  }
  const gameConnections = connections.get(gameId);  
  return [...gameConnections.keys()].length >= 2;
}

export function sendErrorAndClose(socket, message, code) {
  socket.send(Message('error', {message: message}));
  socket.close(code);
}


export async function checkUserGamePermission(gameId, userId) {
      const game = await fastify.prisma.game.findUnique({
        where: { id: gameId },
      });      
      if (!game) {
        fastify.log.warn(`Game ${gameId} not found in database`);
        return false;
      }
      // if (["FINISHED", "CANCELED"].includes(game.status)) {
      //   fastify.log.warn(`Cannot start a ${game.status} game`);
      //   return false;
      // }
      if (game.playerOneId === userId || game.playerTwoId === userId) {
        return true;
      }      
      fastify.log.warn(`User ${userId} attempted to join game ${gameId} without permission`);
      return false;
  }


export function runHeartBeatMechanism(socket, gameId, userId) {
  socket.isAlive = true;
  const pingInterval = setInterval(() => {
    if (socket.isAlive === false) {
      if (connections.has(gameId)) {
        const gameConnections = connections.get(gameId);
        if (gameConnections.get(userId) === socket) {
          gameConnections.delete(userId);
          fastify.log.info(`Removed dead connection for user ${userId} in game ${gameId}`);
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
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    socket.pongActive = true;
  }
  return pingInterval;
  }