import { fastify } from "../server.js";
import { 
  startGameLoop, 
  stopGameLoop, 
  updatePaddlePosition, 
  resetBallAndPaddles, 
  pauseGame, resumeGame
} from '../gameLogic/gameplay.js';
import {defaultGameConfig, gameRooms, connections, WS_CLOSE, Game, createGameState, createGameRoom} from '../gameLogic/gameConfig.js';
import {websocketRouteSchema} from '../routes/game.routes.js'
import { checkUserGamePermission, sendErrorAndClose, hasTwoConnectedPlayers, Message, runHeartBeatMechanism } from "./game.socket.utils.js";


export async function setupWebSocketHandlers() {
  fastify.register(async function (fastify) {
    fastify.log.info("Registering WebSocket handlers");
    fastify.get('/ws/game/:gameId/:userId', { websocket: true, schema: websocketRouteSchema }, async (socket, req) => {
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

      if (connections.has(gameId) && connections.get(gameId).has(userId)) {
        const existingSocket = connections.get(gameId).get(userId);
        
        if (existingSocket && existingSocket !== socket) {
          try {
            existingSocket.isBeingReplaced = true;
            existingSocket.send(Message('error', {
              message: 'Your game session was opened in another device and will be terminated here.'
            }));  
            connections.get(gameId).set(userId, socket);          
            existingSocket.close(WS_CLOSE.POLICY_VIOLATION);
            fastify.log.warn(`User ${userId} connected from a new location, terminating previous session`);            
            socket.send(Message('info', {
              message: 'You were already connected from another location. That session has been terminated.'
            }));
            const gameRoom = gameRooms.get(gameId);
            if (gameRoom && gameRoom.gameState) {
              socket.send(Message('initGame', {
                gameConfig: defaultGameConfig,
                gameState: gameRoom.gameState
              }));
            }
            if (gameRoom.players && gameRoom.players[userId]) {
              const playerType = gameRoom.players[userId].playerType;
              socket.send(Message('joinedGame', {
                gameId: gameId,
                playerType: playerType,
                players: Object.values(gameRoom.players),
                gameState: gameRoom.gameState
              }));
            }
            fastify.log.info(`Sent current game state to reconnected player ${userId} from new location`);
          } catch (err) {
            fastify.log.error(`Error closing existing socket for user ${userId}: ${err.message}`);
          }          
        }
      } 
      else if (!connections.has(gameId)) {
        connections.set(gameId, new Map([[userId, socket]]));
      }
      else if(hasTwoConnectedPlayers(gameId)){
        sendErrorAndClose(socket, "Game room is full", WS_CLOSE.POLICY_VIOLATION);
        return;
      }
      else {
        connections.get(gameId).set(userId, socket);
      }
      socket.send(Message('connected', {message: 'You are connected'}))
      fastify.log.info(`User ${userId} connected to game ${gameId}`);
      
      // *************************** PING PONG MECHANISM TO CHECK FOR CLIENT DISCONNECTION *************************** 

      socket.pingInterval = runHeartBeatMechanism(socket, gameId, userId);
      
      // *************************** SEND INITIAL DATA AUTOMATICALLY AFTER CONNECTION *************************** 
      
      let gameRoom = gameRooms.get(gameId);
      if (gameRoom){
        socket.send(Message('initGame', {
          gameConfig: defaultGameConfig,
          gameState: gameRoom.gameState
        }));
      } else{
        socket.send(Message('initGame', {
          gameConfig: defaultGameConfig,
          gameState: createGameState()
        }))
      }
      
      // *************************** HANDLE INCOMMING MESSAGES *************************** 
      socket.on('message', (message) => {
        try {
          const currentSocket = connections.get(gameId)?.get(userId);
          if (currentSocket !== socket) {
            fastify.log.warn(`Ignoring message from outdated socket for user ${userId}`);
            return;
          }
          const data = JSON.parse(message.toString());          
          let gameRoom = gameRooms.get(gameId);
          if (!gameRoom && ['joinGame'].includes(data.type)) {
            gameRoom = createGameRoom(gameId);
            gameRooms.set(gameId, gameRoom);
          }
          handleMessage(gameId, userId, data, socket);
        } catch (err) {
          fastify.log.error(`Error parsing message: ${err}`);
          sendErrorAndClose(socket, "Invalid message format", WS_CLOSE.INTERNAL_ERROR);
        }
      });
      
      // *************************** HANDLE CLOSING SOCKET FROM CLIENT *************************** 
      socket.on('close', (event) => {
        fastify.log.warn(`socket close event triggred with code ${event}`)
        clearInterval(socket.pingInterval);
        if (socket.isBeingReplaced) {
          fastify.log.info(`Ignoring close event for replaced socket of user ${userId} in game ${gameId}`);
          return;
        }
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
    case 'paddleMove':
      handlePaddleMove(gameId, userId, data.position);
      break;
    case 'pauseGame':
      handlePauseGame(gameId, userId);
      break;
    case 'resumeGame':
      handleResumeGame(gameId, userId);
      break;
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
    sendToUser(gameId, userId, Message('gameStateUpdate', gameRoom.gameState));
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
    
    if (gameRoom.gameState.state === Game.PAUSED && Object.keys(gameRoom.players).length === 2 &&
    Object.keys(gameRoom.disconnectedPlayers).length === 0) {
      gameRoom.gameState.state = Game.IN_PLAY;
      resumeGame(gameId);      
      broadcastAll(gameId, Message('gameResumed', {
        message: 'All players reconnected, game resumed',
        resumedAt: Date.now()
      }));
    }
    broadcastAll(gameId, Message('gameStateUpdate', gameRoom.gameState));
    return true;
  } catch (error) {
    fastify.log.error(`Error in handleReconnection for game ${gameId}, user ${userId}: ${error.message}`);
    return false;
  }
};

// *************************** HANDLE JOINGINIG A GAME *************************** 

function handleJoinGame(gameId, userId) {
  fastify.log.warn(`handle join entered by ${userId}`)
  const socket = connections.get(gameId)?.get(userId);
  if (!socket) {
    fastify.log.warn(`Socket not found for user ${userId} in game ${gameId}, may be a race condition`);
    return;
  }
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
      return;
    }
  }
  // ******** PLAYER ALREADY JOINED ********

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

    // ******** CHECK IF GAME IS FULL ********

  const otherPlayersCount = Object.keys(gameRoom.players).filter(id => id != userId).length;
  if(otherPlayersCount >= 2) {
    fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
    sendToUser(gameId, userId, Message('error', {message: 'Game room is full'}));
    return;
  }

  // ******** NORMAL JOIN TO A GAME ********

  const playersNum = Object.keys(gameRoom.players).length;
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
    fastify.log.info(`Game ${gameId} has two players, ready to start`);
    broadcastAll(gameId, Message('readyToStart', {
      gameRoom: gameRoom,
      gameState: gameRoom.gameState
    }));
    setTimeout(() => {
      if (gameRoom.gameState.state === Game.JOINED) {
        handleStartGame(gameId, Object.keys(gameRoom.players)[0]);
        fastify.log.info(`Game ${gameId} auto-started`);
      }
    }, 2000);
  }
}catch (error) {
  fastify.log.error(`Error in handleJoinGame for game ${gameId}, user ${userId}: ${error.message}`);
    sendToUser(gameId, userId, Message('error', {message: 'Failed to join game due to an internal error'}));
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
            const gameConnections = connections.get(gameId);
            if (gameConnections) {
              fastify.log.debug(`Broadcasting game state to ${gameConnections.size} players in game ${gameId}`);
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
    pauseGame(gameId);
    
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
    ...gameRoom.players[userId],
    disconnectedAt: Date.now(),
    intentionalDisconnect: isIntentionalDisconnect
  };
  const disconnectedPlayerType = gameRoom.players[userId].playerType;
  const remainingPlayers = {...gameRoom.players};
  delete remainingPlayers[userId];
  delete gameRoom.players[userId];
  fastify.log.info(`Removed player ${userId} from active players in game ${gameId}`);  
  const remainingPlayerId = Object.keys(remainingPlayers)[0];
  const remainingPlayerType = remainingPlayers[remainingPlayerId]?.playerType;    
  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }
  broadcastAll(gameId, Message('gamePaused', {
    reason: 'playerDisconnected',
    message: 'Player disconnected. Waiting for reconnection...',
    intentional: isIntentionalDisconnect,
    userId: userId,
    playerType: disconnectedPlayerType
  }));
  
  const timeout = isIntentionalDisconnect ? gameRoom.intentionalDisconnectTime : gameRoom.maxReconnectTime;
  
  fastify.log.info(`Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`);
  
  gameRoom.disconnectTimer = setTimeout(async () => {
    if (gameRoom.disconnectedPlayers[userId]) {
      stopGameLoop(gameId);          
      gameRoom.gameState.state = Game.CANCELED;      
      let winnerType, loserType;
      if (remainingPlayerType) {
        winnerType = remainingPlayerType;
        loserType = disconnectedPlayerType;
      } else {
        winnerType = disconnectedPlayerType === 'mainPlayer' ? 'secondPlayer' : 'mainPlayer';
        loserType = disconnectedPlayerType;
      }
      if (winnerType === 'mainPlayer') {
        gameRoom.gameState.score.mainPlayer = defaultGameConfig.scoreToWin;
        gameRoom.gameState.score.secondPlayer = 0;
      } else {
        gameRoom.gameState.score.mainPlayer = 0;
        gameRoom.gameState.score.secondPlayer = defaultGameConfig.scoreToWin;
      }
      
      // Set winner in game state
      gameRoom.gameState.winner = winnerType;
      
      fastify.log.info(`Game ${gameId} finished due to player disconnect. Winner: ${winnerType} (10-0)`);

      broadcastAll(gameId, Message('gameFinished', {
        gameState: gameRoom.gameState,
        message: `Game won by ${winnerType} due to opponent disconnection`,
        reason: isIntentionalDisconnect ? "playerLeft" : "connectionTimeout",
        disconnectedPlayerType: disconnectedPlayerType,
        forfeit: true
      }));         
      try {
        const game = await fastify.prisma.game.findUnique({
          where: { id: gameId },
        });
        
        let winnerId = null;
        if (winnerType === 'mainPlayer') {
          winnerId = game.playerOneId;
        } else if (winnerType === 'secondPlayer') {
          winnerId = game.playerTwoId;
        }        
        await fastify.prisma.game.update({
          where: { id: gameId },
          data: { 
            status: 'FINISHED',
            endedAt: new Date(),
            playerOneScore: gameRoom.gameState.score.mainPlayer,
            playerTwoScore: gameRoom.gameState.score.secondPlayer,
            winnerId: winnerId,
          }
        });
      } catch (error) {
        fastify.log.error(`Failed to update game ${gameId} in database: ${error.message}`);
      }
    }
  }, timeout);
}

// *************************** HANDLE GAME RESUME *************************** 

function handleResumeGame(gameId, userId) {
  try {
    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(`Attempt to resume non-existent game ${gameId} by user ${userId}`);
      sendToUser(gameId, userId, Message('error', { message: 'Game does not exist' }));
      return false;
    }
    
    if (!gameRoom.players[userId]) {
      fastify.log.warn(`Unauthorized attempt to resume game ${gameId} by user ${userId}`);
      sendToUser(gameId, userId, Message('error', { message: 'You are not authorized to resume this game' }));
      return false;
    }
    
    if (gameRoom.gameState.state !== Game.PAUSED) {
      fastify.log.warn(`Cannot resume game ${gameId} in state ${gameRoom.gameState.state}`);
      sendToUser(gameId, userId, Message('error', { message: 'Game cannot be resumed in current state' }));
      return false;
    }
    
    gameRoom.gameState.state = Game.IN_PLAY;
    resumeGame(gameId);
    
    broadcastAll(gameId, Message('gameResumed', {
      resumedBy: userId,
      reason: 'userRequested',
      message: `Game resumed by player ${gameRoom.players[userId].playerType}`
    }));
    
    fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error resuming game ${gameId}: ${error.message}`);
    return false;
  }
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



function handleTimeOutReconnection(gameId, userId, gameRoom) {
  try {
    fastify.log.info(`Handling reconnection timeout for user ${userId} in game ${gameId}`);
    if (!gameRoom.disconnectedPlayers[userId]) {
      fastify.log.warn(`No disconnected player data for ${userId} in game ${gameId}`);
      return false;
    }
    const playerType = gameRoom.disconnectedPlayers[userId].playerType;    
    delete gameRoom.disconnectedPlayers[userId];    
    sendToUser(gameId, userId, Message('reconnectionExpired', {
      gameId: gameId,
      message: `Your reconnection window expired. Game status: ${gameRoom.gameState.state}`,
      gameState: gameRoom.gameState
    }));
    
    if (gameRoom.gameState.state === Game.START || gameRoom.gameState.state === Game.JOINED) {
      const playersNum = Object.keys(gameRoom.players).length;
      if (playersNum < 2) {
        const newPlayerType = playersNum === 0 ? 'mainPlayer' : 'secondPlayer';
        gameRoom.players[userId] = {
          id: userId,
          playerType: newPlayerType
        };
        
        sendToUser(gameId, userId, Message('joinedGame', {
          gameId: gameId,
          playerType: newPlayerType,
          players: Object.values(gameRoom.players),
          gameState: gameRoom.gameState
        }));
        
        return true;
      }
    }    
    if (gameRoom.gameState.state === Game.PAUSED || gameRoom.gameState.state === Game.IN_PLAY) {
      broadcastAll(gameId, Message('playerAbandoned', {
        playerType: playerType,
        userId: userId
      }));
    }
    
    return false;
  } catch (error) {
    fastify.log.error(`Error in handleTimeOutReconnection: ${error.message}`);
    return false;
  }
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




