import {gameConnections} from "../server.js"
import { fastify } from "../server.js";
export const validateGameId = async function(req, reply) {
    const gameId = parseInt(req.params.gameId);
    if (isNaN(gameId)) {
        return reply.code(400).send({ error: "Invalid game ID" });
    }
  
    const game = await req.server.prisma.game.findUnique({ where: { id: gameId } });
  
    if (!game) {
        return reply.code(404).send({ error: "Game not found" });
    }
    req.game = game;
    // we should add the check of the user 
  }


export const liveGame = function (socket, req) {
    try {
        const gameId = req.game.id;
        if (!gameConnections.has(gameId)) {
            gameConnections.set(gameId, new Set());
        }
        if (gameConnections.get(gameId).size >= 2) {
            console.error(`Game ${gameId} is full.`);
            socket.close(1008, "Game is full (2 players max)");
            return;
        }
        gameConnections.get(gameId).add(socket);
        socket.on('message', async (message) => {
            console.log(`Received in game ${gameId}:`, message.toString());
            socket.send(`Hello from the game ${gameId}`);
        });
        socket.on('close', () => {
            console.log(`Client disconnected from game ${gameId}`);
            gameConnections.get(gameId).delete(socket);
            if (gameConnections.get(gameId).size === 0) {
                gameConnections.delete(gameId);
            }
        });
        socket.on('error', (err) => {
            console.error(`WebSocket error in game ${gameId}:`, err);
        });

    } catch (error) {
        console.error("Error in liveGame:", error);
    }
};
export const startSocket =  function() {
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
})};