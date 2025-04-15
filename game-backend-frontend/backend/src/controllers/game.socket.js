import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles 
} from '../gameLogic/gameplay.js';
import {defaultGameConfig, gameState, defaultGameRoom, gameRooms, connections, WS_CLOSE} from '../gameLogic/gameConfig.js';
import {websocketRouteSchema} from '../routes/game.routes.js'
import { checkUserGamePermission, sendErrorAndClose, hasTwoConnectedPlayers, Message, runHeartBeatMechanism } from "./game.socket.utils.js";




export async function setupWebSocketHandlers() {
  fastify.register(async function (fastify) {
    fastify.log.info("Registering WebSocket handlers");
    fastify.get('/ws/game/:gameId/:userId', { websocket: true, schema: websocketRouteSchema }, async (socket, req) => {
      socket.send(Message('connected', {message: 'You are connected'}))
      const gameId = parseInt(req.params.gameId);
      const userId = parseInt(req.params.userId);
      fastify.log.info(`WebSocket connection attempt: gameId=${gameId}, userId=${userId}`);
      if (isNaN(gameId) || isNaN(userId)) {
        sendErrorAndClose(socket, "Invalid gameId or userId", WS_CLOSE.POLICY_VIOLATION);
        return;
      }

      try {
        const hasPermission = await checkUserGamePermission(gameId, userId);
        if (!hasPermission) {
          fastify.log.warn(`User ${userId} attempted to join game ${gameId} without permission`);
          sendErrorAndClose(socket, "You don't have permission to join this game", WS_CLOSE.POLICY_VIOLATION);
          return;
        }
      } catch (error) {
          fastify.log.error(`Error checking permissions: ${error.message}`);
          sendErrorAndClose(socket, "Error verifying permissions", WS_CLOSE.INTERNAL_ERROR);
          return;
      }

      if (!connections.has(gameId)) {
        connections.set(gameId, new Map([[userId, socket]]));
      }
      else if(hasTwoConnectedPlayers(gameId)){
        sendErrorAndClose(socket, "Game room is full", WS_CLOSE.POLICY_VIOLATION);
        return;
      }
      else{
        connections.get(gameId).set(userId, socket);
      }
      fastify.log.info(`User ${userId} connected to game ${gameId}`);
      


      // *************************** PING PONG MECHANISM TO CHECK FOR CLIENT DISCONNECTION *************************** 

      const pingInterval = runHeartBeatMechanism(socket);
      
      // *************************** SEND INITIAL DATA *************************** 
      socket.send(Message('initGame', {
        gameConfig: defaultGameConfig,
        gameState: gameState
      }))
      
      // *************************** HANDLE INCOMMING MESSAGES *************************** 
      socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          handleMessage(gameId, userId, data, socket);
        } catch (err) {
          fastify.log.error(`Error parsing message: ${err}`);
          socket.send(Message('error', {message:'Invalid message format'}));
        }
      });
      
      // *************************** HANDLE CLOSING SOCKET FROM CLIENT *************************** 
      socket.on('close', (event) => {
        fastify.log.warn(`socket close event triggred with code ${event}`)
        clearInterval(pingInterval);
        handleDisconnect(gameId, userId);
      });
    });
  });
}

// *************************** HANDLE INCOMMING MESSAGES TYPES *************************** 

function handleMessage(gameId, userId, data, socket) {
  switch (data.type) {
    case 'joinGame':
      handleJoinGame(gameId, userId, socket);
      break;
    case 'startGame':
      handleStartGame(gameId, userId);
      break;
    case 'paddleMove':
      handlePaddleMove(gameId, userId, data.position);
      break;
    case 'pauseGame':
      handlePauseGame(gameId, userId);
      break;
    case 'ping':
      socket.send(JSON.stringify({
        type: 'pong',
        timestamp: Date.now(),
        received: data.timestamp
      }));
      break;
    default:
      fastify.log.warn(`Unknown message type: ${data.type}`);
      socket.send(Message('error', {message:'Unknown message type'}));
  }
}

// *************************** HANDLE RECONNECTION AFTER DISCONNECT *************************** 

const handleReconnection = (gameId, userId, gameRoom) => {
  // fastify.log.info(`Player ${userId} reconnected to game ${gameId} after ${reconnectTime}ms`);      
  gameRoom.players[userId] = {
    id: userId,
    playerType: disconnectedPlayer.playerType
  };
  delete gameRoom.disconnectedPlayers[userId];      
  if (gameRoom.disconnectTimer) {
    clearTimeout(gameRoom.disconnectTimer);
    gameRoom.disconnectTimer = null;
  }
  sendToUser(gameId, userId, {
    type: 'reconnectedToGame',
    data: {
      gameId: gameId,
      playerType: gameRoom.players[userId].playerType,
      gameState: gameState,
      players: Object.values(gameRoom.players)
    }
  });  
  broadcast(gameId, userId, {
    type: 'playerReconnected',
    data: {
      playerType: gameRoom.players[userId].playerType
    }
  });
  
  if (gameRoom.gamePaused && Object.keys(gameRoom.players).length === 2) {
    gameState.inProgress = true;
    gameRoom.gamePaused = false;    
    broadcastAll(gameId, {
      type: 'gameResumed',
      data: {
        message: 'All players reconnected, game resumed'
      }
    });
  }
}

// *************************** HANDLE JOINGINIG A GAME *************************** 

function handleJoinGame(gameId, userId) {
  let gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    gameRoom = {...defaultGameRoom, gameId: gameId};
    gameRooms.set(gameId, gameRoom);
    fastify.log.info(`Created new game room for game ${gameId}`);
  }
  if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId]) {
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
    const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;
    if (reconnectTime <= gameRoom.maxReconnectTime) {
      return handleReconnection(gameId, userId, gameRoom);
    } else {
      delete gameRoom.disconnectedPlayers[userId];
    }
  }
  
  if (Object.keys(gameRoom.players).length < 2) {
    if (!gameRoom.players[userId]) {
      const playerType = Object.keys(gameRoom.players).length === 0 ? 'mainPlayer' : 'secondPlayer';
      gameRoom.players[userId] = {
        id: userId,
        playerType: playerType

        
      };
      fastify.log.info(`Player ${userId} joined game ${gameId}`);      
      broadcast(gameId, userId, {
        type: 'playerJoined',
        data: {
          playerType: playerType,
          players: Object.values(gameRoom.players)
        }
      });
    }    
      sendToUser(gameId, userId, {
        type: 'joinedGame',
        data: {
          gameId: gameId,
          playerType: gameRoom.players[userId].playerType,
          players: Object.values(gameRoom.players),
          gameStarted: gameRoom.gameStarted
        }
    });    
    if (Object.keys(gameRoom.players).length === 2) {
      fastify.log.info(`Game ${gameId} has two players, ready to start`);
      broadcastAll(gameId, {
        type: 'readyToStart',
        data: {
          gameRoom: gameRoom
        }
      });
    }
  } else {
    fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
    sendToUser(gameId, userId, {
      type: 'gameError',
      data: {
        message: 'Game room is full'
      }
    });
  }
}

// *************************** HANDLE GAME START *************************** 

function handleStartGame(gameId) {
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom || gameRoom.gameStarted || gameRoom.gamePaused || 
      Object.keys(gameRoom.players).length < 2) {
    return;
  }
  gameRoom.gameStarted = true;
  resetBallAndPaddles();
  startGameLoop((updatedGameState) => {
    broadcastAll(gameId, {
      type: 'gameStateUpdate',
      data: updatedGameState
    });
    if (updatedGameState.ended) {
      handleGameOver(gameId, updatedGameState);
    }
  });
  broadcastAll(gameId, {
    type: 'gameStarted'
  });
  fastify.log.info(`Game ${gameId} started`);
}

// *************************** HANDLE PADDLE MOVEMENT *************************** 

function handlePaddleMove(gameId, userId, position) {
  const gameRoom = gameRooms.get(gameId);
  const pos = Number(position);
  if (!gameRoom || isNaN(pos)) {
    return;
  }
  const playerType = gameRoom.players[userId]?.playerType;
  if (playerType) {
    updatePaddlePosition(playerType, pos);
  }
}

// *************************** HANDLE GAME PAUSE *************************** 

function handlePauseGame(gameId, userId) {
  const gameRoom = gameRooms.get(gameId);
  
  if (!gameRoom || !gameRoom.gameStarted) {
    return;
  }
  broadcastAll(gameId, {
    type: 'gamePaused',
    data: {
      pausedBy: userId
    }
  });
}

// *************************** HANDLE DISCONNECTION *************************** 

function handleDisconnect(gameId, userId) {
  fastify.log.info(`User ${userId} disconnected from game ${gameId}`);
  
  // Remove from connections map
  if (connections.has(gameId)) {
    connections.get(gameId).delete(userId);
    if (connections.get(gameId).size === 0) {
      connections.delete(gameId);
    }
  }
  
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) return;
  
  if (gameState.ended) {
    fastify.log.info(`Game ${gameId} already ended normally, ignoring disconnect`);
    return;
  }
  
  if (gameRoom.players[userId]) {
    // Store disconnected player info
    gameRoom.disconnectedPlayers[userId] = {
      playerType: gameRoom.players[userId].playerType,
      disconnectedAt: Date.now()
    };
    
    delete gameRoom.players[userId];
    fastify.log.info(`Removed player ${userId} from game ${gameId}`);
    
    if (gameRoom.gameStarted && !gameRoom.properlyEnded) {
      // Pause game and notify players
      gameState.inProgress = false;
      gameRoom.gamePaused = true;
      
      broadcastAll(gameId, {
        type: 'gamePaused',
        data: {
          reason: 'playerDisconnected',
          message: 'Player disconnected. Waiting for reconnection...'
        }
      });
      
      // Set timeout for game cancelation
      gameRoom.disconnectTimer = setTimeout(() => {
        if (Object.keys(gameRoom.players).length < 2) {
          stopGameLoop();
          
          broadcastAll(gameId, {
            type: 'playerDisconnected',
            data: {
              message: "Opponent disconnected, game canceled"
            }
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
            fastify.log.error(`Failed to update game ${gameId}: ${error.message}`);
          }
        }
      }, gameRoom.maxReconnectTime);
    }
  }
}

// *************************** HANDLE GAME OVER *************************** 

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
    
    broadcastAll(gameId, {
      type: 'gameOver',
      data: {
        winner: finalGameState.winner,
        score: finalGameState.score
      }
    });
    
    stopGameLoop();
    
  } catch (error) {
    fastify.log.error(`Failed to handle game over for ${gameId}: ${error.message}`);
  }
}









// *************************** SEND A MESSAGE TO A USER *************************** 

function sendToUser(gameId, userId, data) {
  const socket = connections.get(gameId)?.get(userId);
  if (!socket) 
    return false;
  try {
    socket.send(JSON.stringify(data));
    return true;
  } catch (err) {
    fastify.log.error(`Error sending to user ${userId}: ${err.message}`);
    return false;
  }
}

// *************************** BROADCAST TO ALL USERS EXECPT THE SENDER *************************** 

function broadcast(gameId, excludeUserId, data) {
  if (!connections.has(gameId))
    return;
  for (const [userId, socket] of connections.get(gameId).entries()) {
    if (userId !== excludeUserId) {
      try {
        socket.send(JSON.stringify(data));
      } catch (err) {
        fastify.log.error(`Error broadcasting to user ${userId}: ${err.message}`);
      }
    }
  }
}

// *************************** BROADCAST TO ALL PLAYERS *************************** 

function broadcastAll(gameId, data) {
  if (!connections.has(gameId))
    return;
  for (const socket of connections.get(gameId).values()) {
    try {
      socket.send(JSON.stringify(data));
    } catch (err) {
      fastify.log.error(`Error broadcasting: ${err.message}`);
    }
  }
}