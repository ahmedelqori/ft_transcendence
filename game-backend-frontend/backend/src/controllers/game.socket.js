import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles 
} from '../gameLogic/gameplay.js';
import { verifyUserFromToken } from "../middlewares/auth.middleware.js";

const gameRooms = new Map();

export const  validateSocketConnection = async (socket, next) => {
  try {
    const gameId = parseInt(socket.handshake.auth.gameId || socket.handshake.query.gameId);
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (isNaN(gameId)) {
      return next(new Error("Invalid game ID"));
    }
    
    if (!token) {
      return next(new Error("Authentication required"));
    }
    
    const userId = await verifyUserFromToken(token);
    if (!userId) {
      return next(new Error("Invalid authentication token"));
    }
    socket.gameId = gameId;
    socket.userId = userId;    
    fastify.prisma.game.findUnique({
      where: { id: gameId }
    }).then(game => {
      if (!game) {
        return next(new Error("Game not found"));
      }      
      if (userId !== game.playerOneId && userId !== game.playerTwoId) {
        return next(new Error("Not a player in this game"));
      }
      socket.playerType = userId === game.playerOneId ? 'mainPlayer' : 'secondPlayer';
      socket.gameData = game;
      next();
    }).catch(err => {
      console.error("Database error during socket validation:", err);
      next(new Error("Failed to validate game"));
    });
  } catch (error) {
    console.error("Socket validation error:", error);
    next(new Error('Authentication failed'));
  }
};


export const setupSocketHandlers = () => {
  const io = fastify.io;
  
  io.use(validateSocketConnection);
  
  io.of("socket/game").on('connection', (socket) => {
    const userId = socket.userId;
    const gameId = socket.gameId;
    fastify.log.info(`User ${userId} connected to game ${gameId}`);    
    socket.join(`user_${userId}`);
    // joinGame event handler
    socket.on('joinGame', () => {
      socket.join(`game_${gameId}`);
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, {
          players: {},
          gameStarted: false
        });
      }
      
      const gameRoom = gameRooms.get(gameId);
      gameRoom.players[userId] = {
        socketId: socket.id,
        playerType: socket.playerType
      };
      socket.emit('joinedGame', { 
        playerType: socket.playerType,
        gameId: gameId
      });
      socket.to(`game_${gameId}`).emit('playerJoined', {
        playerType: socket.playerType
      });
      if (Object.keys(gameRoom.players).length === 2) {
        io.to(`game_${gameId}`).emit('readyToStart');
      }
    });
    // startGame event handler
    socket.on('startGame', async () => {
      const gameRoom = gameRooms.get(gameId);
      fastify.log.warn(`hellooooo ${gameId}`)
      if (!gameRoom || gameRoom.gameStarted) return;
      if (Object.keys(gameRoom.players).length !== 2) return;
      try {
        await fastify.prisma.game.update({
          where: { id: gameId },
          data: { status: 'IN_PROGRESS' }
        });
        gameRoom.gameStarted = true;
        resetBallAndPaddles();
        io.to(`game_${gameId}`).emit('gameStarted');
        startGameLoop(60, (gameState) => {
          io.to(`game_${gameId}`).emit('gameStateUpdate', gameState);
          if (gameState.ended) {
            handleGameOver(gameId, gameState);
          }
        });
      } catch (error) {
        fastify.log.error(`Failed to start game ${gameId}: ${error.message}`);
        io.to(`game_${gameId}`).emit('gameError', { message: 'Failed to start game' });
      }
    });
    
    socket.on('paddleMove', (position) => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || !gameRoom.gameStarted) return;
      
      updatePaddlePosition(socket.playerType, position);
    });
    
    socket.on('pauseGame', () => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || !gameRoom.gameStarted) return;      
      io.to(`game_${gameId}`).emit('gamePaused', { pausedBy: userId });
    });    
    socket.on('disconnect', () => {
      fastify.log.info(`User ${userId} disconnected from game ${gameId}`);
      
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) 
        return;      
      if (gameRoom.players[userId]) {
        delete gameRoom.players[userId];
      }      
      if (gameRoom.gameStarted) {
        socket.to(`game_${gameId}`).emit('playerDisconnected', { 
          playerType: socket.playerType
        });        
        stopGameLoop();

        setTimeout(async () => {
          if (!gameRoom.players[userId]) {
            try {
              await fastify.prisma.game.update({
                where: { id: gameId },
                data: { 
                  status: 'CANCELED', 
                  endedAt: new Date(),
                  winnerId: -1
                }
              });
              
              if (Object.keys(gameRoom.players).length === 0) {
                gameRooms.delete(gameId);
              }
            } catch (error) {
              fastify.log.error(`Failed to update game ${gameId} after disconnection: ${error.message}`);
            }
          }
        }, 30000);
      }
    });
  });
};


async function handleGameOver(gameId, gameState) {
  try {
    const game = await fastify.prisma.game.findUnique({
      where: { id: gameId }
    });
    if (!game) 
      return;
    const winnerId = gameState.winner === 'mainPlayer' 
      ? game.playerOneId 
      : game.playerTwoId;
    
    await fastify.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        endedAt: new Date(),
        playerOneScore: gameState.score.mainPlayer,
        playerTwoScore: gameState.score.secondPlayer,
        winnerId
      }
    });
    
    fastify.io.to(`game_${gameId}`).emit('gameOver', {
      winner: gameState.winner,
      score: gameState.score
    });
    
    stopGameLoop();
    
  } catch (error) {
    fastify.log.error(`Failed to handle game over for ${gameId}: ${error.message}`);
  }
}