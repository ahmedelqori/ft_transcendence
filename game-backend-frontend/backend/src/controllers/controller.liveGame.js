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


// In server.js or socket-handler.js
import { startGameLoop, stopGameLoop, updatePaddlePosition, resetBallPaddles } from './gameLogique/gameplay.js';
import { gameState } from './gameLogique/gameConfig.js';

// Game rooms mapping
const gameRooms = {};

io.on('connection', (socket) => {
  socket.on('joinGame', (gameId) => {
    // Join socket to game room
    socket.join(gameId);
    
    // Initialize game if needed
    if (!gameRooms[gameId]) {
      gameRooms[gameId] = {
        players: {},
        gameState: { ...gameState }  // Clone the default state
      };
    }
    
    // Add player to game
    const playerType = Object.keys(gameRooms[gameId].players).length === 0 ? 'mainPlayer' : 'secondPlayer';
    gameRooms[gameId].players[socket.id] = playerType;
    
    // Start game if both players joined
    if (Object.keys(gameRooms[gameId].players).length === 2) {
      resetBallPaddles();
      
      // Start game loop with broadcast callback
      startGameLoop(60, (updatedState) => {
        io.to(gameId).emit('gameStateUpdate', updatedState);
      });
    }
  });
  
  // Handle paddle movements
  socket.on('paddleMove', (data) => {
    const { gameId, position } = data;
    const playerType = gameRooms[gameId]?.players[socket.id];
    
    if (playerType) {
      updatePaddlePosition(playerType, position);
    }
  });
  
  // Handle disconnects
  socket.on('disconnect', () => {
    // Find and clean up any games this player was in
    // ...
  });
});