import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import {wsAuth} from "../middleware/ws-auth-middleware.js";
import { handleGetHistory } from "../controllers/handleGetHistory.js";
import { handleSendMessage } from "../controllers/handleSendMessage.js";
import { checkFriendship } from "../middleware/friendship.js";
import { saveMessageBatches } from "../utils/saveMessageBatches.js";
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

  // app.addHook("onRequest", async (request, reply) => {
  //   app.log.info("-------------------- New Request --------------------");
  // });
  // Register plugins


  app.addHook("preHandler", wsAuth);
  await app.register(fastifyWebsocket, {
    maxPayload: 1048576,
    clientTracking: false,
  });

  app.register(fastifyCors, {
    credentials: true,
    origin: ["http://localhost:8000", "http://10.12.8.2:5500"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  });

  app.register(async (fastify) => {
    fastify.get(
      "/ws",
      { websocket: true },
      (connection, request) => {
        const userId = parseInt(request.user.id, 10);
        if (userId === undefined || userId === null) {
          connection.close(1008, "Unauthorized: Missing user identification"); // Changed from connection.socket.close()
          console.log("Closed connection - no user ID provided");
          return;
        }
        userSocketMap.set(userId, connection);
        connection.on("message", async (message) => {
          try {
            const data = JSON.parse(message);
            const friendship = await checkFriendship(
              data.receiverId,
              request.query.token
            );
            if (data.type === "sendMessage" && friendship)
            {
                  await handleSendMessage(
                    data,
                    userId,
                    connection,
                    app,
                    messageBatches
                  );
            }
            else if (data.type === "getHistory")
            {
                await handleGetHistory(data, userId, connection, app);
            }
            else
                console.warn("Unknown message type:", data.type);
          } catch (error) {
            console.error("Error processing message:", error);
          }
        });

        connection.on("close", async () => {
          userSocketMap.delete(userId);
          if (messageBatches.size > 0)
            await saveMessageBatches(messageBatches, app.prisma);
        });
      }
    );
  });

  return app;
}

export const getReceiverSocket = (receiverId) => userSocketMap.get(receiverId);
