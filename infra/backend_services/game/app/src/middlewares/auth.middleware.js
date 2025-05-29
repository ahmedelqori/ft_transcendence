import axios from 'axios';
import {fastify} from "../server.js";
import {Agent} from 'https';
export let TOKEN = 0
const vaultAgent = new Agent({
  rejectUnauthorized: false
});
const WHOAMI_URL_DEV='https://www.meedivo.me/api/account/whoami/'

export async function authenticate(req, reply) {
  fastify.log.info(`Authenticating request: ${req.url}`);
  
  let token;
  
  if (req.query && req.query.token) {
    token = req.query.token;
    fastify.log.info(`Token extracted from query parameter`);
  } 
  else if (req.headers && req.headers.authorization) {
    token = req.headers.authorization;
    fastify.log.info("Token extracted from Authorization header");
  } 
  else {
    fastify.log.warn("No token provided in request");
    return reply.code(401).send({ message: 'Authentication required' });
  }

  try {
    fastify.log.info(`Validating token with auth service`);
    const response = await axios.get(WHOAMI_URL_DEV, {
      headers: { Authorization: `${token}` },
      httpsAgent: vaultAgent
    });
    
    if (response.status !== 200) {
      fastify.log.warn("Invalid authentication");
      return reply.code(401).send({ message: 'Invalid authentication' });
    }
    
    req.user = response.data;
    req.token = token
    TOKEN = token
    fastify.log.info(`Successfully authenticated user with ID: ${req.user.id}`);
    
  } catch (err) {
    fastify.log.error(`Authentication failed: ${err.message}`);
    return reply.code(401).send({ message: 'Authentication failed' });
  }
}