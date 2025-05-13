import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import auth from "../middleware/middleware.js";
import wsAuth from "../middleware/ws-auth-middleware.js";
import { handleGetHistory } from "../utils/handleGetHistory.js";
import { handleSendMessage } from "../utils/handleSendMessage.js";
import { checkFriendship } from "../middleware/check-friendship.js";
const userSocketMap = new Map(); // userId vs socket
const messageBatches = new Map(); // conversation id  vs messages

export async function buildApp() {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  });

  app.addHook("onRequest", async (request, reply) => {
    app.log.info("-------------------- New Request --------------------");
  });
  // Register plugins
  await app.register(fastifyWebsocket, {
    maxPayload: 1048576,
    clientTracking: false,
  });

  app.register(fastifyCors, {
    credentials: true,
    origin: ["http://localhost:8000", "http://localhost:5500"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  });

  //, preValidation:wsAuth

  // WebSocket endpoint
  app.register(async (fastify) => {
    fastify.get(
      "/ws",
      { websocket: true, preValidation: wsAuth },
      (connection, request) => {
        const userId = parseInt(request.user.id, 10);
        console.log("*******************   Authenticated user:", userId);
        if (userId === undefined || userId === null) {
          connection.close(1008, "Unauthorized: Missing user identification"); // Changed from connection.socket.close()
          console.log("Closed connection - no user ID provided");
          return;
        }


      connection.on("message", async (message) => {
        try {
          const data = JSON.parse(message);
          console.log(message, checkFriendship(message.receiverId,request.query.token));
          switch (data.type) {
            case "sendMessage":
              await handleSendMessage(
                data,
                userId,
                connection,
                app,
                messageBatches
              );
              break;

            case "getHistory":
              await handleGetHistory(data, userId, connection, app);
              break;

            default:
              console.warn("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });


        connection.on("close", async () => {
          console.log("User disconnected:", userId);
          userSocketMap.delete(userId);
        });
      }
    );
  });

  return app;
}

export const getReceiverSocket = (receiverId) => userSocketMap.get(receiverId);
