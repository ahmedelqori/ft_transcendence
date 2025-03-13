import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles 
} from '../gameLogic/gameplay.js';
import { verifyUserFromToken } from "../middlewares/auth.middleware.js";
import {defaultGameConfig, gameState} from '../gameLogic/gameConfig.js'
const gameRooms = new Map();

export const validateSocketConnection = async (socket, next) => {
  try {
    // add an auth object that contain gameId and token
    const gameId = parseInt(socket.handshake.auth.gameId);
    const userId = parseInt(socket.handshake.auth.userId);
    // const token = socket.handshake.auth.token;
    fastify.log.warn(`gameId = ${gameId}`)
    fastify.log.warn(`userId = ${userId}`)
    // if (isNaN(gameId))
    //   return next(new Error("Invalid game ID"));
    // if (!token)
    //   return next(new Error("Authentication required"));

    // const user = await verifyUserFromToken(token);
    const user = {id: userId}
    if (!user)
      return next(new Error("Invalid authentication token"));
    try {
      const game = await fastify.prisma.game.findUnique({
        where: { id: gameId }
      });
      if (!game)
        return next(new Error("Game not found"));
      if (user.id !== game.playerOneId && user.id !== game.playerTwoId) 
        return next(new Error("Not a player in this game"));
      user.playerType = (user.id === game.playerOneId) ? 'mainPlayer' : 'secondPlayer';
      socket.user = user
      socket.game = game;
      next();
    } catch (error) {
      fastify.log.error(`Database error during socket validation: ${error}`);
      return next(new Error("Failed to validate game"));
    }
  } catch (error) {
    fastify.log.error(`Socket validation error: ${error}`);
    return next(new Error('Authentication failed'));
  }
};

export const setupSocketHandlers = () => {
  const io = fastify.io;
  
  io.of("socket/game").use(validateSocketConnection);
  io.of("socket/game").on('connection', (socket) => {
    const userId = socket.user?.id;
    const gameId = socket.game?.id;
    
    fastify.log.info(`User ${userId} connected to game ${gameId}`);    
    socket.join(`user_${userId}`);
    socket.emit('initGame', {
      gameConfig:defaultGameConfig,
      gameState: gameState
    })
    // joinGame event handler
    socket.on('joinGame', () => {
      let gameRoom = gameRooms.get(gameId);      
      if (!gameRoom) {
        gameRoom = { 
          gameId: gameId, 
          players: {},
          gameStarted: false,
          properlyEnded: false
        };
        gameRooms.set(gameId, gameRoom);
        fastify.log.info(`Created new game room for game ${gameId}`);
      }      
      if (!gameRoom.players[userId] && Object.keys(gameRoom.players).length < 2) {
        socket.join(`game_${gameId}`);        
        gameRoom.players[userId] = socket.user
        fastify.log.info(`Player ${userId} joined game ${gameId}`);        
        socket.emit('joinedGame', { 
          gameId: gameId,
          playerType: socket.user.playerType,
          players: Object.values(gameRoom.players),
          gameStarted: gameRoom.gameStarted
        });        
        socket.to(`game_${gameId}`).emit('playerJoined', {
          playerType: socket.user.playerType,
          players: Object.values(gameRoom.players)
        });
        if (Object.keys(gameRoom.players).length === 2) {
          fastify.log.info(`Game ${gameId} has two players, ready to start`);
          io.of("socket/game").to(`game_${gameId}`).emit('readyToStart', {
            gameRoom:gameRoom
          });
        }
      } else if (gameRoom.players[userId]) {
        fastify.log.info(`Player ${userId} reconnected to game ${gameId}`);
        socket.emit('joinedGame', { 
          gameId: gameId,
          playerType: socket.user.playerType,
          players: Object.values(gameRoom.players),
          gameStarted: gameRoom.gameStarted
        });
        if (Object.keys(gameRoom.players).length === 2) {
          io.of("socket/game").to(`game_${gameId}`).emit('readyToStart', {
            gameRoom:gameRoom
          });
        }
      } else {
        fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
        socket.emit('gameError', { message: 'Game room is full' });
      }
    });

    socket.on('startGame', () => {
      const gameRoom = gameRooms.get(gameId);
      
      if (!gameRoom || gameRoom.gameStarted || Object.keys(gameRoom.players).length < 2) {
        return; // Don't start if already started or not enough players
      }
      
      gameRoom.gameStarted = true;
      
      // Reset game state for a fresh start
      resetBallAndPaddles();
      gameState.score = { mainPlayer: 0, secondPlayer: 0 };
      gameState.ended = false;
      gameState.winner = null;
      
      // Start the game loop with a callback that sends updates
      startGameLoop(60, (updatedGameState) => {
        // Send game state to all players in this game room
        io.of("socket/game").to(`game_${gameId}`).emit('gameStateUpdate', updatedGameState);
        
        // Check if game has ended
        if (updatedGameState.ended) {
          handleGameOver(gameId, updatedGameState);
        }
      });
      
      // Notify all players that game has started
      io.of("socket/game").to(`game_${gameId}`).emit('gameStarted');
      fastify.log.info(`Game ${gameId} started`);
    });
    // In game.socket.js
    socket.on('paddleMove', (position) => {
      // Convert to number if not already
      const pos = Number(position);
      
      // Validate input
      if (isNaN(pos)) {
        fastify.log.warn(`Invalid paddle position from user ${userId}: ${position}`);
        return;
      }
      
      fastify.log.debug(`Paddle move from ${userId}: ${pos}`);
      
      // Update game state
      updatePaddlePosition(socket.user.playerType, pos);
    });
    socket.on('pauseGame', () => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || !gameRoom.gameStarted)
        return;      
      io.of("socket/game").to(`game_${gameId}`).emit('gamePaused', { pausedBy: userId });
    });    
    socket.on('disconnect', () => {
      fastify.log.info(`User ${userId} disconnected from game ${gameId}`);
      
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) return;
      
      // Add this check to avoid handling disconnects during normal gameplay
      if (gameState.ended) {
        fastify.log.info(`Game ${gameId} already ended normally, ignoring disconnect`);
        return;
      }
      
      if (gameRoom.players[userId]) {
        delete gameRoom.players[userId];
        fastify.log.info(`Removed player ${userId} from game ${gameId}`);
        
        // Don't immediately stop the game, give a grace period for reconnection
        if (gameRoom.gameStarted && !gameRoom.properlyEnded) {
          gameRoom.disconnectTimer = setTimeout(() => {
            if (Object.keys(gameRoom.players).length < 2) {
              stopGameLoop();
              
              io.of("socket/game").to(`game_${gameId}`).emit('playerDisconnected', {
                message: "Opponent disconnected, game canceled"
              });
              
              // Update database
              try {
                fastify.prisma.game.update({
                  where: { id: gameId },
                  data: { 
                    status: 'CANCELED',
                    endedAt: new Date()
                  }
                }).then(() => {
                  fastify.log.info(`Game ${gameId} marked as CANCELED due to disconnect`);
                });
              } catch (error) {
                fastify.log.error(`Failed to update game ${gameId} after disconnection: ${error.message}`);
              }
            }
          }, 5000);  // 5 second grace period for reconnection
        }
      }
    });
  });
};

async function handleGameOver(gameId, finalGameState) {
  try {
    // Get game room and mark it as properly ended
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      gameRoom.properlyEnded = true;
      
      // Clear any disconnect timers
      if (gameRoom.disconnectTimer) {
        clearTimeout(gameRoom.disconnectTimer);
      }
    }
    
    // Get game from database
    const game = await fastify.prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) return;
    
    // Determine winner ID
    const winnerId = finalGameState.winner === 'mainPlayer' 
      ? game.playerOneId 
      : game.playerTwoId;
    
    // Update database
    await fastify.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        endedAt: new Date(),
        playerOneScore: finalGameState.score.mainPlayer,
        playerTwoScore: finalGameState.score.secondPlayer,
        winnerId
      }
    });
    
    // Notify players
    fastify.io.of("socket/game").to(`game_${gameId}`).emit('gameOver', {
      winner: finalGameState.winner,
      score: finalGameState.score
    });
    
    // Stop game loop
    stopGameLoop();
    
  } catch (error) {
    fastify.log.error(`Failed to handle game over for ${gameId}: ${error.message}`);
  }
}