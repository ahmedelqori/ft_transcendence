import Fastify from "fastify";
import { gameRoutes } from "./routes/game.routes.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import fastifyWebsocket from "@fastify/websocket";
import { setupWebSocketHandlers } from "./controllers/game.socket.js";
import { setupLocalWebSocketHandlers } from "./controllers/localGame.socket.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";


export const gameConnections = new Map();

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
  credentials: true,
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userid'],
  exposedHeaders: ['Authorization']
});

fastify.register(fastifyWebsocket, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
  routePrefix: 'docs',
  uiConfig: {
    docExpansion: 'list',
  }
});
fastify.register(prismaPlugin);
fastify.register(gameRoutes, {
   prefix: "/api/games",
  });


fastify.register(setupWebSocketHandlers, {
  prefix: "/ws/game/"
});

fastify.register(setupLocalWebSocketHandlers, {
  prefix: "/ws/local/"
});

const start = async function() {
  const port = process.env.PORT || 3000;
  try {
    fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Documentation available at http://localhost:${port}/docs`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();