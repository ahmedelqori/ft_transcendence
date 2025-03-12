import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles 
} from '../gameLogic/gameplay.js';
import { verifyUserFromToken } from "../middlewares/auth.middleware.js";
import {defaultGameConfig} from '../gameLogic/gameConfig.js'
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
      gameConfig:defaultGameConfig
    })
    // joinGame event handler
    socket.on('joinGame', () => {
      let gameRoom = gameRooms.get(gameId);      
      if (!gameRoom) {
        gameRoom = { 
          gameId: gameId, 
          players: {},
          gameStarted: false
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
    // startGame event handler
    socket.on('startGame', async () => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || gameRoom.gameStarted)
        return;
      if (Object.keys(gameRoom.players).length !== 2)
        return;
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
      if (!gameRoom || !gameRoom.gameStarted)
        return;
      updatePaddlePosition(socket.playerType, position);
    });
    
    socket.on('pauseGame', () => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || !gameRoom.gameStarted)
        return;      
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