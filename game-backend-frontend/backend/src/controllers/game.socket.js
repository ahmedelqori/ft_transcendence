import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles, 
  pauseGame
} from '../gameLogic/gameplay.js';
import {defaultGameConfig, gameRooms, connections, WS_CLOSE, Game, createGameState, createGameRoom} from '../gameLogic/gameConfig.js';
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
      
      // *************************** SEND INITIAL DATA AUTOMATICALLY AFTER CONNECTION *************************** 

      socket.send(Message('initGame', {
        gameConfig: defaultGameConfig,
        gameState: createGameState()
      }))
      
      // *************************** HANDLE INCOMMING MESSAGES *************************** 
      socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          handleMessage(gameId, userId, data, socket);
        } catch (err) {
          fastify.log.error(`Error parsing message: ${err}`);
          sendErrorAndClose(socket, "Invalid message format", WS_CLOSE.INTERNAL_ERROR);
        }
      });
      
      // *************************** HANDLE CLOSING SOCKET FROM CLIENT *************************** 
      socket.on('close', (event) => {
        fastify.log.warn(`socket close event triggred with code ${event}`)
        clearInterval(pingInterval); // clear Ping Pong mechanism interval
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
    case 'resumeGame':
      handleResumeGame(gameId, userId);
    default:
      fastify.log.warn(`Unknown message type: ${data.type}`);
      socket.send(Message('error', {message:'Unknown message type'}));
  }
}

// *************************** HANDLE RECONNECTION AFTER DISCONNECT *************************** 

const handleReconnection = (gameId, userId, gameRoom) => {
  try {
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
    const playerType = disconnectedPlayer.playerType;    
    gameRoom.players[userId] = {
      id: userId,
      playerType: playerType
    };    
    delete gameRoom.disconnectedPlayers[userId];    
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
      fastify.log.info(`Reconnection timer cleared for game ${gameId}`);
    }    
    sendToUser(gameId, userId, Message('reconnectedToGame', {
      gameId: gameId,
      playerType: playerType,
      gameState: gameRoom.gameState,
      players: Object.values(gameRoom.players),
      reconnectionTime: Date.now() - disconnectedPlayer.disconnectedAt
    }));    
    broadcast(gameId, userId, Message('playerReconnected', {
      playerType: playerType,
      userId: userId
    }));
    
    fastify.log.info(`Player ${userId} successfully reconnected to game ${gameId} as ${playerType}`);
    
    if (gameRoom.gameState.state === Game.PAUSED && Object.keys(gameRoom.players).length === 2) {
      gameRoom.gameState.state = Game.IN_PLAY;
      resumeGame(gameId);      
      broadcastAll(gameId, Message('gameResumed', {
        message: 'All players reconnected, game resumed',
        resumedAt: Date.now()
      }));
    }
    
    return true;
  } catch (error) {
    fastify.log.error(`Error in handleReconnection for game ${gameId}, user ${userId}: ${error.message}`);
    return false;
  }
};

// *************************** HANDLE JOINGINIG A GAME *************************** 

function handleJoinGame(gameId, userId) {
  const socket = connections.get(gameId)?.get(userId);
try {
  let gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    gameRoom =  createGameRoom(gameId);
    gameRooms.set(gameId, gameRoom);
    fastify.log.info(`Created new game room for game ${gameId}`);
  }

  // ******** HANDLE RECONNECTION TO A GAME ********

  if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId]) {
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
    const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;
    if (reconnectTime <= gameRoom.maxReconnectTime){
      return handleReconnection(gameId, userId, gameRoom);
    }else {
      fastify.log.warn(`Player ${userId} reconnection window expired (${reconnectTime}ms > ${gameRoom.maxReconnectTime}ms)`);
      handleTimeOutReconnection(gameId, userId, gameRoom);
      // delete gameRoom.disconnectedPlayers[userId];
    }
  }

  // ******** NORMAL JOIN TO A GAME ********
  const playersNum = Object.keys(gameRoom.players).length;
  if(playersNum >= 2) {
    fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
    sendErrorAndClose(socket, "Game room is full", WS_CLOSE.POLICY_VIOLATION);
    return sendToUser(gameId, userId, Message('error', {message: 'Game room is full'}))
  }

  if (gameRoom.players[userId]) {
    fastify.log.info(`Player ${userId} already joined game ${gameId}, sending current state`);
    const playerType = gameRoom.players[userId].playerType;
    sendToUser(gameId, userId, Message('joinedGame', {
      gameId: gameId,
      playerType: playerType,
      players: Object.values(gameRoom.players),
      gameState: gameRoom.gameState
    }));
    return;
  }

  const player = playersNum === 0 ? 'mainPlayer' : 'secondPlayer';
  gameRoom.players[userId] = {
    id: userId,
    playerType: player   
  };
  fastify.log.info(`Player ${userId} joined game ${gameId}`);

  broadcast(gameId, userId, Message('playerJoined', {
    gameId: gameId,
    playerType: player,
    players: Object.values(gameRoom.players),
  }))

  sendToUser(gameId, userId, Message('joinedGame', {
    gameId: gameId,
    playerType: player,
    players: Object.values(gameRoom.players),
    gameState: gameRoom.gameState
  })); 

  if (Object.keys(gameRoom.players).length === 2) {
    gameRoom.gameState.state = Game.JOINED;
    gameRoom.gameState.state = Game.JOINED;
    fastify.log.info(`Game ${gameId} has two players, ready to start`);
    broadcastAll(gameId, Message('readyToStart', {
      gameRoom: gameRoom,
      gameState: gameRoom.gameState
    }));
  }
}catch (error) {
  fastify.log.error(`Error in handleJoinGame for game ${gameId}, user ${userId}: ${error.message}`);
  sendErrorAndClose(socket, "Failed to join game due to an internal error", WS_CLOSE.INTERNAL_ERROR);
  // sendToUser(gameId, userId, Message('error', {message: 'Failed to join game due to an internal error'})) 
}
}

// *************************** HANDLE GAME START *************************** 

function handleStartGame(gameId, userId) {
  const socket = connections.get(gameId)?.get(userId);
  try {
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(`Attempt to start non-existent game ${gameId} by user ${userId}`);
      sendErrorAndClose(socket, "Game not found", WS_CLOSE.POLICY_VIOLATION);
      // sendToUser(gameId, userId, Message('error', { 
      //   message: 'Game not found'
      // }));
      return false;
    }
    
    if (!gameRoom.players[userId]) {
      fastify.log.warn(`Unauthorized attempt to start game ${gameId} by user ${userId}`);
      sendErrorAndClose(socket, "You are not authorized to start this game", WS_CLOSE.POLICY_VIOLATION);

      // sendToUser(gameId, userId, Message('error', { 
      //   message: 'You are not authorized to start this game'
      // }));
      return false;
    }
    
    switch(gameRoom.gameState.state) {
      case Game.START:
        if (Object.keys(gameRoom.players).length < 2) {
          fastify.log.warn(`Not enough players to start game ${gameId}, requested by ${userId}`);
          sendToUser(gameId, userId, Message('error', { 
            message: 'Cannot start game: waiting for opponent'
          }));
          return false;
        }
        break;
      case Game.JOINED:
        gameRoom.gameState.state = Game.IN_PLAY;
        resetBallAndPaddles(gameRoom.gameState);
        broadcastAll(gameId, Message('gameStarted', {
          startedBy: userId,
          gameState: gameRoom.gameState,
          players: Object.values(gameRoom.players)
        }));
        fastify.log.info(`Game ${gameId} started by user ${userId}`);
        startGameLoop(gameId, gameRoom.gameState, (updatedGameState) => {
          try {
            if (updatedGameState.state == Game.FINISHED) {
              handleGameOver(gameId, updatedGameState);
            }
            broadcastAll(gameId, Message('gameStateUpdate', updatedGameState));
          } catch (loopError) {
            fastify.log.error(`Error in game loop for game ${gameId}: ${loopError.message}`);
          }
        });
        return true;
      case Game.PAUSED:
        gameRoom.gameState.state = Game.IN_PLAY;
        broadcastAll(gameId, Message('gameResumed', {
          resumedBy: userId,
          message: 'Game resumed'
        }));
        fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
        return true;
        
      case Game.IN_PLAY:
        fastify.log.info(`Game ${gameId} already started, ignoring start request from ${userId}`);
        sendToUser(gameId, userId, Message('info', { 
          message: 'Game is already in progress'
        }));
        return false;
        
      case Game.FINISHED:
      case Game.CANCELED:
        fastify.log.warn(`Cannot restart completed game ${gameId}, requested by ${userId}`);
        sendToUser(gameId, userId, Message('error', { 
          message: 'Cannot restart a completed game'
        }));
        return false;
        
      default:
        fastify.log.warn(`Attempt to start game ${gameId} in invalid state: ${gameRoom.gameState.state}`);
        return false;
    }
  } catch (error) {
    fastify.log.error(`Error starting game ${gameId} by user ${userId}: ${error.message}`);
    sendToUser(gameId, userId, Message('error', { 
      message: 'Failed to start game due to an internal error'
    }));
    return false;
  }
}

// *************************** HANDLE PADDLE MOVEMENT *************************** 

function handlePaddleMove(gameId, userId, position) {
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    return false;
  }
  const pos = Number(position);
  if (isNaN(pos)) {
    fastify.log.warn(`Invalid position value from user ${userId}: ${position}`);
    return false;
  }
  if (gameRoom.gameState.state !== Game.IN_PLAY) {
    fastify.log.info(`Paddle move ignored - game ${gameId} not in play (state: ${gameRoom.gameState.state})`);
    return false;
  }
  const playerType = gameRoom.players[userId].playerType;
  if (!playerType) {
    fastify.log.info(`Paddle move from non-player ${userId} in game ${gameId}`);
    return false;
  }
  updatePaddlePosition(playerType, pos);
  return true;
}

// *************************** HANDLE GAME PAUSE *************************** 

function handlePauseGame(gameId, userId) {
  try {
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(`Attempt to pause non-existent game ${gameId} by user ${userId}`);
      sendErrorAndClose(socket, "Game does not exist", WS_CLOSE.POLICY_VIOLATION);
      return false;
    }
    
    if (!gameRoom.players[userId]) {
      fastify.log.warn(`Unauthorized attempt to pause game ${gameId} by user ${userId}`);
      sendErrorAndClose(socket, "You are not authorized to pause this game", WS_CLOSE.POLICY_VIOLATION);
      return false;
    }
    
    if (gameRoom.gameState.state !== Game.IN_PLAY) {
      fastify.log.warn(`Cannot pause game ${gameId} in state ${gameRoom.gameState.state}`);
      sendErrorAndClose(socket, "Game cannot be paused in current state", WS_CLOSE.POLICY_VIOLATION);
      return false;
    }
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame();
    
    broadcastAll(gameId, Message('gamePaused', {
      pausedBy: userId,
      reason: 'userRequested',
      message: `Game paused by player ${gameRoom.players[userId].playerType}`
    }));
    
    fastify.log.info(`Game ${gameId} paused by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error pausing game ${gameId}: ${error.message}`);
    return false;
  }
}

// *************************** HANDLE DISCONNECTION *************************** 

function handleDisconnect(gameId, userId, closeCode) {
  fastify.log.info(`User ${userId} disconnected from game ${gameId} ${closeCode ? ` with code ${closeCode}` : ''}`);
  
  if (connections.has(gameId)) {
    connections.get(gameId).delete(userId);
    if (connections.get(gameId).size === 0) {
      connections.delete(gameId);
    }
  }
  
  const gameRoom = gameRooms.get(gameId);
  if (!gameRoom) {
    fastify.log.warn(`No game room found for ${gameId}, nothing to clean up`);
    return;
  }
  
  switch (gameRoom.gameState.state) {
    case Game.FINISHED:
      fastify.log.info(`Game ${gameId} is (${gameRoom.gameState.state})`);
      return
    case Game.CANCELED:
      fastify.log.info(`Game ${gameId} is (${gameRoom.gameState.state}), ignoring disconnect`);
      return;
      
    case Game.START:
    case Game.JOINED:
      if (gameRoom.players[userId]) {
        delete gameRoom.players[userId];
        fastify.log.info(`Removed player ${userId} from non started yet game ${gameId}`);
        
        broadcast(gameId, userId, Message('playerLeft', {
          message: 'Opponent left the game',
          userId: userId
        }));
      }
      return;
      
    case Game.IN_PLAY:
    case Game.PAUSED:
      disconnectTimeout(gameRoom, gameId, userId, closeCode);
      return;
      
    default:
      fastify.log.warn(`Unhandled game state ${gameRoom.gameState.state} in handleDisconnect for game ${gameId}`);
      return;
  }
}


function disconnectTimeout(gameRoom, gameId, userId, closeCode){
  if (!gameRoom.players[userId]) {
    fastify.log.warn(`Player ${userId} not found in game ${gameId}, cannot handle disconnect`);
    return;
  }      
  const isIntentionalDisconnect = closeCode === WS_CLOSE.NORMAL || closeCode === WS_CLOSE.GOING_AWAY;      
  gameRoom.disconnectedPlayers[userId] = {
    playerType: gameRoom.players[userId].playerType,
    disconnectedAt: Date.now(),
    intentionalDisconnect: isIntentionalDisconnect
  };
  delete gameRoom.players[userId];
  fastify.log.info(`Removed player ${userId} from active players in game ${gameId}`);      
  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }
  broadcastAll(gameId, Message('gamePaused', {
    reason: 'playerDisconnected',
    message: 'Player disconnected. Waiting for reconnection...',
    intentional: isIntentionalDisconnect,
    userId: userId,
    playerType: gameRoom.disconnectedPlayers[userId].playerType
  }));
  
  const timeout = isIntentionalDisconnect ? 
                         30000 :
                         gameRoom.maxReconnectTime;
  
  fastify.log.info(`Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`);
  gameRoom.disconnectTimer = setTimeout(async () => {
    if (gameRoom.disconnectedPlayers[userId]) {
      stopGameLoop(gameId);          
      gameRoom.gameState.state = Game.CANCELED;      
      fastify.log.info(`game ${gameId} is canceled`)    
      broadcastAll(gameId, Message('gameCanceled', {
        message: "Game canceled due to player disconnection",
        reason: isIntentionalDisconnect ? "playerLeft" : "connectionTimeout",
        disconnectedPlayerType: gameRoom.disconnectedPlayers[userId].playerType
      }));          
      try {
          await fastify.prisma.game.update({
          where: { id: gameId },
          data: { 
            status: 'CANCELED',
            endedAt: new Date()
          }
        })
      } catch (error) {
        fastify.log.error(`Failed to update game ${gameId} in database: ${error.message}`);
      }
    }
  }, timeout);
}



// *************************** HANDLE GAME OVER *************************** 

async function handleGameOver(gameId, finalGameState) {
  try {
    fastify.log.info(`Game ${gameId} has ended. Winner: ${finalGameState.winner}`);
    
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(`Cannot handle game over for non-existent game ${gameId}`);
      return;
    }
    gameRoom.gameState.state = Game.FINISHED;
    gameRoom.endedAt = Date.now();    
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
    }    
    stopGameLoop(gameId);
    
    broadcastAll(gameId, Message('gameFinished', {
      gameState: finalGameState,
      endTime: gameRoom.endedAt,
      message: `Game finished. Winner: ${finalGameState.winner}`
    }));
    
    try {
      const game = await fastify.prisma.game.findUnique({
        where: { id: gameId },
      });
      let winnerId = null;
      if (finalGameState.winner === 'mainPlayer') {
        winnerId = game.playerOneId;
      } else if (finalGameState.winner === 'secondPlayer') {
        winnerId = game.playerTwoId;
      }      
      await fastify.prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'FINISHED',
          endedAt: new Date(gameRoom.endedAt),
          playerOneScore: finalGameState.score.mainPlayer,
          playerTwoScore: finalGameState.score.secondPlayer,
          winnerId: winnerId
        }
      });
      fastify.log.info(`Game ${gameId} updated in database. Winner ID: ${winnerId}`);
    } catch (dbError) {
      fastify.log.error(`Database error in handleGameOver for game ${gameId}: ${dbError.message}`);
    }
    setTimeout(() => {
      try {
        gameRooms.delete(gameId);
        connections.delete(gameId);
        fastify.log.debug(`Game ${gameId} resources are ready for cleanup`);
      } catch (cleanupError) {
        fastify.log.error(`Error during game cleanup: ${cleanupError.message}`);
      }
    }, 60000);
    
  } catch (error) {
    fastify.log.error(`Error in handleGameOver for game ${gameId}: ${error.message}`);
    stopGameLoop(gameId);
    broadcastAll(gameId, Message('gameError', {
      message: 'Game ended with errors',
      gameId: gameId
    }));
  }
}



function handleTimeOutReconnection(gameId, userId, gameRoom){
  fastify.log.warn("handle Time out reconnection function called");
}





// *************************** SEND A MESSAGE TO A USER *************************** 

function sendToUser(gameId, userId, data) {
  const socket = connections.get(gameId)?.get(userId);
  if (!socket) 
    return false;
  try {
    socket.send(data);
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
        socket.send(data);
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
      socket.send(data);
    } catch (err) {
      fastify.log.error(`Error broadcasting: ${err.message}`);
    }
  }
}




