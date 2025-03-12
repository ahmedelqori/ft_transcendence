import Fastify from "fastify";
import { gameRoutes } from "./routes/game.routes.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import socketIoPlugin from "fastify-socket.io";
import { setupSocketHandlers } from "./controllers/game.socket.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import {socketDocsPlugin, docsPortalPlugin} from './plugins/sockets-docs.plugin.js';


export const gameConnections = new Map();

//register the Pino-pretty logger for ELK
export const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      }
    }
  }
});
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  exposedHeaders: ['Authorization']
});

fastify.register(socketIoPlugin, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
// Register Swagger for Api documentation
fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Pong Game API',
      description: 'API documentation for the multiplayer Pong game',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    tags: [
      { name: 'games', description: 'Game related endpoints' }
    ],
  }
});

fastify.register(swaggerUI, {
  routePrefix: '/api-docs',
  uiConfig: {
    docExpansion: 'list',
  }
});

fastify.register(socketDocsPlugin);
fastify.register(docsPortalPlugin);
fastify.register(prismaPlugin);
fastify.register(gameRoutes, { prefix: "/api/games" });

fastify.addHook('preHandler', async (req, reply) => {
  const path = req.raw.url;
  if (path.startsWith('/swagger') || path.startsWith('/api-docs') || path.startsWith('/socket-docs') || path.startsWith('/api/games'))
     return;
  await authenticate(req, reply);
}); // only for http requests
fastify.addHook('onReady', setupSocketHandlers); // for socket.io connections



const start = async function() {
  const port = process.env.PORT || 3000;
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Server running at http://localhost:${port}`);
    fastify.log.info(`Documentation available at http://localhost:${port}/swagger`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();