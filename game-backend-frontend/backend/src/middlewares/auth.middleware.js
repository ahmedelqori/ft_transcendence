import axios from 'axios';
import {fastify} from "../server.js";
import { getUserById } from './user.data.js';

// export const validateSocketConnection = async (socket, next) => {
//   try {
//     // add an auth object that contain gameId and token
//     const gameId = parseInt(socket.handshake.auth.gameId);
//     const userId = parseInt(socket.handshake.auth.userId);
//     // const token = socket.handshake.auth.token;
//     fastify.log.warn(`gameId = ${gameId}`)
//     fastify.log.warn(`userId = ${userId}`)
//     // if (isNaN(gameId))
//     //   return next(new Error("Invalid game ID"));
//     // if (!token)
//     //   return next(new Error("Authentication required"));

//     // const user = await verifyUserFromToken(token);
//     const user = {id: userId}
//     if (!user)
//       return next(new Error("Invalid authentication token"));
//     try {
//       const game = await fastify.prisma.game.findUnique({
//         where: { id: gameId }
//       });
//       if (!game)
//         return next(new Error("Game not found"));
//       if (user.id !== game.playerOneId && user.id !== game.playerTwoId) 
//         return next(new Error("Not a player in this game"));
//       user.playerType = (user.id === game.playerOneId) ? 'mainPlayer' : 'secondPlayer';
//       socket.user = user
//       socket.game = game;
//       next();
//     } catch (error) {
//       fastify.log.error(`Database error during socket validation: ${error}`);
//       return next(new Error("Failed to validate game"));
//     }
//   } catch (error) {
//     fastify.log.error(`Socket validation error: ${error}`);
//     return next(new Error('Authentication failed'));
//   }
// };


export async function authenticate(req, reply) {
  fastify.log.info(`Authenticating http request ${req.headers.path}`);
  const authorization = req.headers?.authorization;
  if (!authorization) {
    fastify.log.warn("No authorization header provided for http request");
    return reply.code(401).send({ message: 'Authentication required' });
  }
  try {
    const response = await axios.get(process.env.WHOAMI_URL, {
      headers: { authorization: authorization }
    });
    
    if (response.status !== 200) {
      fastify.log.warn("Invalid authentication for http request");
      return reply.code(401).send({ message: 'Invalid authentication' });
    }   
    req.user = response.data;
    fastify.log.info(" Authenticated user:", req.user);
  } catch (err) {
    fastify.log.error("Authentication failed for http request:", err.message);
    return reply.code(401).send({ message: 'Authentication failed' });
  }
}

export async function verifyUserFromToken(token) {
  fastify.log.info("Verifying user from token in socket connection");
  if (!token) {
    fastify.log.warn("No token provided");
    return null;
  }
  try {
    const response = await axios.get(process.env.WHOAMI_URL, {
      headers: { authorization: authorization }
    });
    
    if (response.status !== 200) {
      fastify.log.warn("Invalid authentication for socket connection");
      return null;
    }
    return response.data;
  } catch (error) {
    fastify.log.error("Failed to verify user from token in socket connection:", error.message);
    return null;
  }
}