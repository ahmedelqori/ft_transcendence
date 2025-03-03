import Fastify from "fastify";
import { gameRoutes} from "./routes/routegame.js";
import prismaPlugin from "./models/prisma.plugin.js";
import websocketPlugin from "fastify-socket.io";


// import getAllGames from "./controllers/controller.game"
export const gameConnections = new Map();
const fastify = Fastify(({
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
  }));
  fastify.register(prismaPlugin);
  fastify.register(websocketPlugin)
  fastify.register(gameRoutes, {prefix : "/api/games"})

  fastify.ready().then(() => {
  fastify.io.on("connection", (socket) => {
    console.log("A user connected");
  
    // Send a message when a new client connects
    socket.emit("hello", "Welcome to the WebSocket server!");
  
    socket.on("message", (msg) => {
      console.log("Received:", msg);
      fastify.io.emit("broadcast", msg); // Broadcast to all clients
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  })});
  // fastify.addHook('preValidation', async (req, reply) => {
  //   const token = req.headers.authorization;
  //   if (!token) {
  //     reply.status(401).send({ error: "Unauthorized" });
  //     return;
  //   }
  
  //   try {
  //     const decoded = verifyToken(token); // Replace with your actual JWT verification logic
  //     req.user = decoded; // Attach the user to the request
  //   } catch (error) {
  //     reply.status(401).send({ error: "Invalid token" });
  //   }
  // });
  

  
  



const start = async function(){
  const port = process.env.PORT || 3000;
  try {
      await fastify.listen({port:port, host: "0.0.0.0"})
  } catch (error) {
      fastify.log.error(error);
      process.exit(1)
  }
}

start()