import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles 
} from '../gameLogic/gameplay.js';
import { validateSocketConnection } from "../middlewares/auth.middleware.js";
import {defaultGameConfig, gameState} from '../gameLogic/gameConfig.js'
const gameRooms = new Map();
const defaultGameRoom = { 
  gameId: -1, 
  players: {},
  disconnectedPlayers: {},
  gameStarted: false,
  properlyEnded: false,
  gamePaused: false,
  maxReconnectTime: 10000,
  disconnectTimer: null
}

export const setupSocketHandlers = () => {
  const io = fastify.io.of("socket/game");

  io.use(validateSocketConnection);

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    const gameId = socket.game?.id;
    
    fastify.log.info(`User ${userId} connected to game ${gameId}`);    
    socket.join(`user_${userId}`);

    socket.emit('initGame', {
      gameConfig: defaultGameConfig,
      gameState: gameState
    })

// ******************* JOINGAME EVENT HANDLER *******************
    
    socket.on('joinGame', () => {
      let gameRoom = gameRooms.get(gameId);      
      if (!gameRoom) {
        gameRoom = {...defaultGameRoom, gameId:gameId};
        gameRooms.set(gameId, gameRoom);
        fastify.log.info(`Created new game room for game ${gameId}`);
      }      
      if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId]){
        const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
        const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;
        if (reconnectTime <= gameRoom.maxReconnectTime){
          fastify.log.info(`Player ${userId} reconnected to game ${gameId} after ${reconnectTime}ms`);      
          socket.join(`game_${gameId}`);
          gameRoom.players[userId] = socket.user;
          delete gameRoom.disconnectedPlayers[userId];
          if (gameRoom.disconnectTimer) {
            clearTimeout(gameRoom.disconnectTimer);
            gameRoom.disconnectTimer = null;
          }
          socket.emit('reconnectedToGame', {
            gameId: gameId,
            playerType: socket.user.playerType,
            gameState: gameState,
            players: Object.values(gameRoom.players)
          });          
          socket.to(`game_${gameId}`).emit('playerReconnected', {
            playerType: socket.user.playerType
          });
          if (gameRoom.gamePaused && Object.keys(gameRoom.players).length === 2) {
            gameState.inProgress = true;
            gameRoom.gamePaused = false;
            
            io.to(`game_${gameId}`).emit('gameResumed', {
              message: 'All players reconnected, game resumed'
            });
          }
          return
        } else {
          delete gameRoom.disconnectedPlayers[userId]
        }
      }
      if (Object.keys(gameRoom.players).length < 2) {
        if (!gameRoom.players[userId]){
          socket.join(`game_${gameId}`);        
          gameRoom.players[userId] = socket.user
          fastify.log.info(`Player ${userId} joined game ${gameId}`);        
          socket.to(`game_${gameId}`).emit('playerJoined', {
            playerType: socket.user.playerType,
            players: Object.values(gameRoom.players)
          });
        }
        socket.emit('joinedGame', { 
          gameId: gameId,
          playerType: socket.user.playerType,
          players: Object.values(gameRoom.players),
          gameStarted: gameRoom.gameStarted
        });        
        if (Object.keys(gameRoom.players).length === 2) {
          fastify.log.info(`Game ${gameId} has two players, ready to start`);
          io.to(`game_${gameId}`).emit('readyToStart', {
            gameRoom:gameRoom
          });
        }
      } else {
        fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
        socket.emit('gameError', { message: 'Game room is full' });
      }
    });

// ******************* STARTGAME EVENT HANDLER *******************

    socket.on('startGame', () => {
      const gameRoom = gameRooms.get(gameId);
      
      if (!gameRoom || gameRoom.gameStarted || Object.keys(gameRoom.players).length < 2) {
        return;
      }
      
      gameRoom.gameStarted = true;
      
      resetBallAndPaddles();
      gameState.score = { mainPlayer: 0, secondPlayer: 0 };
      gameState.ended = false;
      gameState.winner = null;
      
      startGameLoop(60, (updatedGameState) => {
        io.to(`game_${gameId}`).emit('gameStateUpdate', updatedGameState);
        
        if (updatedGameState.ended) {
          handleGameOver(gameId, updatedGameState);
        }
      });
      
      io.to(`game_${gameId}`).emit('gameStarted');
      fastify.log.info(`Game ${gameId} started`);
    });

// ******************* PADDLEMOVE EVENT HANDLER *******************

    socket.on('paddleMove', (position) => {
      const pos = Number(position);
      
      if (isNaN(pos)) {
        fastify.log.warn(`Invalid paddle position from user ${userId}: ${position}`);
        return;
      }
      
      fastify.log.debug(`Paddle move from ${userId}: ${pos}`);
      
      updatePaddlePosition(socket.user.playerType, pos);
    });

// ******************* PAUSEGAME EVENT HANDLER *******************

    socket.on('pauseGame', () => {
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom || !gameRoom.gameStarted)
        return;      
      io.to(`game_${gameId}`).emit('gamePaused', { pausedBy: userId });
    });    

// ******************* DISCONNECT EVENT HANDLER *******************

    socket.on('disconnect', () => {
      fastify.log.info(`User ${userId} disconnected from game ${gameId}`);
      
      const gameRoom = gameRooms.get(gameId);
      if (!gameRoom) return;
      
      if (gameState.ended) {
        fastify.log.info(`Game ${gameId} already ended normally, ignoring disconnect`);
        return;
      }
      
      if (gameRoom.players[userId]) {
        delete gameRoom.players[userId];
        fastify.log.info(`Removed player ${userId} from game ${gameId}`);
        
        if (gameRoom.gameStarted && !gameRoom.properlyEnded) {
          gameRoom.disconnectTimer = setTimeout(() => {
            if (Object.keys(gameRoom.players).length < 2) {
              stopGameLoop();
              
              io.to(`game_${gameId}`).emit('playerDisconnected', {
                message: "Opponent disconnected, game canceled"
              });
              
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
          }, 10000);
        }
      }
    });
  });
};

async function handleGameOver(gameId, finalGameState) {
  try {
    const gameRoom = gameRooms.get(gameId);
    if (gameRoom) {
      gameRoom.properlyEnded = true;
      
      if (gameRoom.disconnectTimer) {
        clearTimeout(gameRoom.disconnectTimer);
      }
    }
    
    const game = await fastify.prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) return;
    
    const winnerId = finalGameState.winner === 'mainPlayer' 
      ? game.playerOneId 
      : game.playerTwoId;
    
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
    
    fastify.io.to(`game_${gameId}`).emit('gameOver', {
      winner: finalGameState.winner,
      score: finalGameState.score
    });
    
    stopGameLoop();
    
  } catch (error) {
    fastify.log.error(`Failed to handle game over for ${gameId}: ${error.message}`);
  }
}