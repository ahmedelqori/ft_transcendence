import axios from 'axios';
import {fastify} from "../server.js";
import { getUserById } from './user.data.js';

// export async function verifyUserFromToken(token) {
//   const userId = parseInt(token, 10);
//   return userId || null;
// }

// export async function authenticate(req, reply) {
//   // Get user ID directly from request
//   const userId = req.headers?.userid || req.query?.userId;
  
//   if (!userId) {
//     return reply.code(401).send({ message: 'User ID required' });
//   }
  
//   const user = getUserById(userId);
//   if (!user) {
//     return reply.code(404).send({ message: 'User not found' });
//   }
//   req.user = user;
//   return;
// }



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