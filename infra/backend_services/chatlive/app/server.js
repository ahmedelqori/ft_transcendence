import { buildApp } from "./socket/socket.js";
import sensible from "@fastify/sensible";
import dbPlugin from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = await buildApp();
app.register(sensible);
app.register(dbPlugin);


app.get("/getlast", async (req, reply) => {
    const receiveId = parseInt(req.query.receiveId, 10);
    const userId = parseInt(req.user.id, 10);

    if (!receiveId || !userId) {
      throw app.httpErrors.badRequest("Missing parameters");
    }

    try {
      const conversation = await app.prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: [userId, receiveId] },
            },
          },
        },
        select: { id: true },
      });

      if (!conversation) {
        return reply.send({
          status: "success",
          message: "No conversation found between these users",
        });
      }

      const lastMessage = await app.prisma.message.findFirst({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          createdAt: true,
        },
      });

      if (!lastMessage) {
        return reply.send({
          status: "success",
          message: "No messages found",
        });
      }

      return reply.send({
        status: "success",
        data: lastMessage, // Only contains content and createdAt
      });
    } catch {
      app.log.error("Error:", error);
      throw app.httpErrors.internalServerError("Message retrieval failed");
    }
  });


const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    app.log.info(`WebSocket server available at ws://0.0.0.0:3000/ws`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
