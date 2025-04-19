import { fastify } from "../server.js";
import { websocketRouteSchema } from "../routes/game.routes.js";
import {
  startGameLoop,
  stopGameLoop,
  updatePaddlePosition,
  resetBallAndPaddles,
  pauseGame,
  resumeGame,
} from "../gameLogic/gameplay.js";
import {
  defaultGameConfig,
  gameRooms,
  connections,
  WS_CLOSE,
  Game,
  createGameState,
  createGameRoom,
} from "../gameLogic/gameConfig.js";
import {
  checkUserGamePermission,
  sendErrorAndClose,
  Message,
  runHeartBeatMechanism,
  sendToUser,
  broadcast,
  broadcastAll,
  handleOldConnection,
  setupNewConnection,
  sendInitialGameData,
  updateGameInDatabase,
} from "./game.socket.utils.js";

// *************************** WEBSOCKET SETUP ***************************

export async function setupWebSocketHandlers() {
  fastify.register(async function (fastify) {
    fastify.log.info("Registering WebSocket handlers");

    fastify.get(
      "/ws/game/:gameId/:userId",
      {
        websocket: true,
        schema: websocketRouteSchema,
      },
      handleWebSocketConnection
    );
  });
}

// *************************** CONNECTION HANDLER ***************************

async function handleWebSocketConnection(socket, req) {
  const gameId = parseInt(req.params.gameId);
  const userId = parseInt(req.params.userId);

  fastify.log.info(
    `WebSocket connection attempt: gameId=${gameId}, userId=${userId}`
  );

  try {
    const permissionCheck = await checkUserGamePermission(gameId, userId, gameRooms);
    if (!permissionCheck.hasPermission) {
      sendErrorAndClose(
        socket,
        permissionCheck.reason,
        WS_CLOSE.POLICY_VIOLATION
      );
      return;
    }
  } catch (error) {
    fastify.log.error(`Error checking permissions: ${error.message}`);
    sendErrorAndClose(
      socket,
      "Error verifying permissions",
      WS_CLOSE.INTERNAL_ERROR
    );
    return;
  }

  // Handle existing connections for this user in this game
  if (connections.has(gameId) && connections.get(gameId).has(userId)) {
    handleOldConnection(
      gameId,
      userId,
      socket,
      gameRooms,
      defaultGameConfig
    );
  } else {
    if (!setupNewConnection(gameId, userId, socket)) {
      return;
    }
  }

  socket.send(Message("connected", { message: "You are connected" }));
  fastify.log.info(`User ${userId} connected to game ${gameId}`);

  socket.pingInterval = runHeartBeatMechanism(socket, gameId, userId);

  sendInitialGameData(
    gameId,
    socket,
    gameRooms,
    defaultGameConfig,
    createGameState
  );

  setupSocketEventHandlers(socket, gameId, userId);
}

function setupSocketEventHandlers(socket, gameId, userId) {
  socket.on("message", (message) => {
    try {
      const currentSocket = connections.get(gameId)?.get(userId);
      if (currentSocket !== socket) {
        fastify.log.warn(
          `Ignoring message from outdated socket for user ${userId}`
        );
        return;
      }

      const data = JSON.parse(message.toString());
      let gameRoom = gameRooms.get(gameId);

      if (!gameRoom && ["joinGame"].includes(data.type)) {
        gameRoom = createGameRoom(gameId);
        gameRooms.set(gameId, gameRoom);
      }

      handleMessage(gameId, userId, data, socket);
    } catch (err) {
      fastify.log.error(`Error parsing message: ${err}`);
      sendErrorAndClose(
        socket,
        "Invalid message format",
        WS_CLOSE.INTERNAL_ERROR
      );
    }
  });

  // Close handler
  socket.on("close", (event) => {
    fastify.log.warn(`socket close event triggred with code ${event}`);
    clearInterval(socket.pingInterval);

    if (socket.changed) {
      fastify.log.info(
        `Ignoring close event for replaced socket of user ${userId} in game ${gameId}`
      );
      return;
    }

    handleDisconnect(gameId, userId, event);
  });
}

// *************************** MESSAGE HANDLERS ***************************
function handleMessage(gameId, userId, data, socket) {
  // Route message to appropriate handler based on type
  const messageHandlers = {
    joinGame: () => handleJoinGame(gameId, userId),
    paddleMove: () => handlePaddleMove(gameId, userId, data.position),
    pauseGame: () => handlePauseGame(gameId, userId),
    resumeGame: () => handleResumeGame(gameId, userId),
  };

  const handler = messageHandlers[data.type];

  if (handler) {
    handler();
  } else {
    fastify.log.warn(`Unknown message type: ${data.type}`);
    socket.send(Message("error", { message: "Unknown message type" }));
  }
}

// *************************** JOIN GAME HANDLING ***************************
function handleJoinGame(gameId, userId) {
  fastify.log.warn(`handle join entered by ${userId}`);
  const socket = connections.get(gameId)?.get(userId);

  if (!socket) {
    fastify.log.warn(
      `Socket not found for user ${userId} in game ${gameId}, may be a race condition`
    );
    return;
  }

  try {
    let gameRoom = gameRooms.get(gameId);

    if (!gameRoom) {
      gameRoom = createGameRoom(gameId);
      gameRooms.set(gameId, gameRoom);
      fastify.log.info(`Created new game room for game ${gameId}`);
    }

    // Handle existing disconnected player reconnecting
    if (gameRoom.disconnectedPlayers && gameRoom.disconnectedPlayers[userId]) {
      return handlePossibleReconnection(gameId, userId, gameRoom);
    }

    // Handle player already joined case
    if (gameRoom.players[userId]) {
      return handleAlreadyJoinedPlayer(gameId, userId, gameRoom);
    }

    // Check if game is full
    const otherPlayersCount = Object.keys(gameRoom.players).filter(
      (id) => id != userId
    ).length;
    if (otherPlayersCount >= 2) {
      fastify.log.warn(`Player ${userId} tried to join full game ${gameId}`);
      sendToUser(
        gameId,
        userId,
        Message("error", { message: "Game room is full" })
      );
      return;
    }

    // Normal join process
    handleNewPlayerJoin(gameId, userId, gameRoom);
  } catch (error) {
    fastify.log.error(
      `Error in handleJoinGame for game ${gameId}, user ${userId}: ${error.message}`
    );
    sendToUser(
      gameId,
      userId,
      Message("error", {
        message: "Failed to join game due to an internal error",
      })
    );
  }
}

function handlePossibleReconnection(gameId, userId, gameRoom) {
  const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
  const reconnectTime = Date.now() - disconnectedPlayer.disconnectedAt;

  if (reconnectTime <= gameRoom.maxReconnectTime) {
    return handleReconnection(gameId, userId, gameRoom);
  } else {
    fastify.log.warn(
      `Player ${userId} reconnection window expired (${reconnectTime}ms > ${gameRoom.maxReconnectTime}ms)`
    );
    handleTimeOutReconnection(gameId, userId, gameRoom);
    return false;
  }
}

function handleAlreadyJoinedPlayer(gameId, userId, gameRoom) {
  fastify.log.info(
    `Player ${userId} already joined game ${gameId}, sending current state`
  );
  const playerType = gameRoom.players[userId].playerType;

  sendToUser(
    gameId,
    userId,
    Message("joinedGame", {
      gameId: gameId,
      playerType: playerType,
      players: Object.values(gameRoom.players),
      gameState: gameRoom.gameState,
    })
  );

  return true;
}

function handleNewPlayerJoin(gameId, userId, gameRoom) {
  const playersNum = Object.keys(gameRoom.players).length;
  const player = playersNum === 0 ? "mainPlayer" : "secondPlayer";

  gameRoom.players[userId] = {
    id: userId,
    playerType: player,
  };

  fastify.log.info(`Player ${userId} joined game ${gameId}`);

  // Notify other players
  broadcast(
    gameId,
    userId,
    Message("playerJoined", {
      gameId: gameId,
      playerType: player,
      players: Object.values(gameRoom.players),
    })
  );

  // Notify the joining player
  sendToUser(
    gameId,
    userId,
    Message("joinedGame", {
      gameId: gameId,
      playerType: player,
      players: Object.values(gameRoom.players),
      gameState: gameRoom.gameState,
    })
  );

  // If both players joined, start countdown to game start
  if (Object.keys(gameRoom.players).length === 2) {
    gameRoom.gameState.state = Game.JOINED;
    fastify.log.info(`Game ${gameId} has two players, ready to start`);

    broadcastAll(
      gameId,
      Message("readyToStart", {
        gameRoom: gameRoom,
        gameState: gameRoom.gameState,
      })
    );

    // Auto-start game after delay
    setTimeout(() => {
      if (gameRoom.gameState.state === Game.JOINED) {
        handleStartGame(gameId, Object.keys(gameRoom.players)[0]);
        fastify.log.info(`Game ${gameId} auto-started`);
      }
    }, 2000);
  }
}

// *************************** RECONNECTION HANDLING ***************************
function handleReconnection(gameId, userId, gameRoom) {
  try {
    const disconnectedPlayer = gameRoom.disconnectedPlayers[userId];
    const playerType = disconnectedPlayer.playerType;

    // Restore player to active players
    gameRoom.players[userId] = {
      id: userId,
      playerType: playerType,
    };

    // Remove from disconnected players
    delete gameRoom.disconnectedPlayers[userId];

    // Clear disconnect timer if it exists
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
      fastify.log.info(`Reconnection timer cleared for game ${gameId}`);
    }

    // Send current game state to reconnected player
    sendToUser(gameId, userId, Message("gameStateUpdate", gameRoom.gameState));
    sendToUser(
      gameId,
      userId,
      Message("reconnectedToGame", {
        gameId: gameId,
        playerType: playerType,
        gameState: gameRoom.gameState,
        players: Object.values(gameRoom.players),
        reconnectionTime: Date.now() - disconnectedPlayer.disconnectedAt,
      })
    );

    // Notify other players about reconnection
    broadcast(
      gameId,
      userId,
      Message("playerReconnected", {
        playerType: playerType,
        userId: userId,
      })
    );

    fastify.log.info(
      `Player ${userId} successfully reconnected to game ${gameId} as ${playerType}`
    );

    // If game was paused due to disconnection and now all players are back, resume
    if (
      gameRoom.gameState.state === Game.PAUSED &&
      Object.keys(gameRoom.players).length === 2 &&
      Object.keys(gameRoom.disconnectedPlayers).length === 0
    ) {
      gameRoom.gameState.state = Game.IN_PLAY;
      resumeGame(gameId);

      broadcastAll(
        gameId,
        Message("gameResumed", {
          message: "All players reconnected, game resumed",
          resumedAt: Date.now(),
        })
      );
    }

    // Update all clients with current game state
    broadcastAll(gameId, Message("gameStateUpdate", gameRoom.gameState));
    return true;
  } catch (error) {
    fastify.log.error(
      `Error in handleReconnection for game ${gameId}, user ${userId}: ${error.message}`
    );
    return false;
  }
}

function handleTimeOutReconnection(gameId, userId, gameRoom) {
  try {
    fastify.log.info(
      `Handling reconnection timeout for user ${userId} in game ${gameId}`
    );

    if (!gameRoom.disconnectedPlayers[userId]) {
      fastify.log.warn(
        `No disconnected player data for ${userId} in game ${gameId}`
      );
      return false;
    }

    const playerType = gameRoom.disconnectedPlayers[userId].playerType;
    delete gameRoom.disconnectedPlayers[userId];

    sendToUser(
      gameId,
      userId,
      Message("reconnectionExpired", {
        gameId: gameId,
        message: `Your reconnection window expired. Game status: ${gameRoom.gameState.state}`,
        gameState: gameRoom.gameState,
      })
    );

    // If game is in early state, allow joining as new player
    if (
      gameRoom.gameState.state === Game.START ||
      gameRoom.gameState.state === Game.JOINED
    ) {
      const playersNum = Object.keys(gameRoom.players).length;
      if (playersNum < 2) {
        const newPlayerType = playersNum === 0 ? "mainPlayer" : "secondPlayer";
        gameRoom.players[userId] = {
          id: userId,
          playerType: newPlayerType,
        };

        sendToUser(
          gameId,
          userId,
          Message("joinedGame", {
            gameId: gameId,
            playerType: newPlayerType,
            players: Object.values(gameRoom.players),
            gameState: gameRoom.gameState,
          })
        );

        return true;
      }
    }

    // Otherwise notify about abandonment
    if (
      gameRoom.gameState.state === Game.PAUSED ||
      gameRoom.gameState.state === Game.IN_PLAY
    ) {
      broadcastAll(
        gameId,
        Message("playerAbandoned", {
          playerType: playerType,
          userId: userId,
        })
      );
    }

    return false;
  } catch (error) {
    fastify.log.error(`Error in handleTimeOutReconnection: ${error.message}`);
    return false;
  }
}

// *************************** GAME STATE MANAGEMENT ***************************
function handleStartGame(gameId, userId) {
  const socket = connections.get(gameId)?.get(userId);

  try {
    const gameRoom = gameRooms.get(gameId);

    // Validate game exists
    if (!gameRoom) {
      fastify.log.warn(
        `Attempt to start non-existent game ${gameId} by user ${userId}`
      );
      sendErrorAndClose(socket, "Game not found", WS_CLOSE.POLICY_VIOLATION);
      return false;
    }

    // Validate user is part of this game
    if (!gameRoom.players[userId]) {
      fastify.log.warn(
        `Unauthorized attempt to start game ${gameId} by user ${userId}`
      );
      sendErrorAndClose(
        socket,
        "You are not authorized to start this game",
        WS_CLOSE.POLICY_VIOLATION
      );
      return false;
    }

    // Handle game start based on current state
    switch (gameRoom.gameState.state) {
      case Game.START:
        if (Object.keys(gameRoom.players).length < 2) {
          fastify.log.warn(
            `Not enough players to start game ${gameId}, requested by ${userId}`
          );
          sendToUser(
            gameId,
            userId,
            Message("error", {
              message: "Cannot start game: waiting for opponent",
            })
          );
          return false;
        }
        break;

      case Game.JOINED:
        return initiateGameStart(gameId, userId, gameRoom);

      case Game.PAUSED:
        return resumeGameFromPause(gameId, userId, gameRoom);

      case Game.IN_PLAY:
        fastify.log.info(
          `Game ${gameId} already started, ignoring start request from ${userId}`
        );
        sendToUser(
          gameId,
          userId,
          Message("info", {
            message: "Game is already in progress",
          })
        );
        return false;

      case Game.FINISHED:
      case Game.CANCELED:
        fastify.log.warn(
          `Cannot restart completed game ${gameId}, requested by ${userId}`
        );
        sendToUser(
          gameId,
          userId,
          Message("error", {
            message: "Cannot restart a completed game",
          })
        );
        return false;

      default:
        fastify.log.warn(
          `Attempt to start game ${gameId} in invalid state: ${gameRoom.gameState.state}`
        );
        return false;
    }
  } catch (error) {
    fastify.log.error(
      `Error starting game ${gameId} by user ${userId}: ${error.message}`
    );
    sendToUser(
      gameId,
      userId,
      Message("error", {
        message: "Failed to start game due to an internal error",
      })
    );
    return false;
  }
}

function initiateGameStart(gameId, userId, gameRoom) {
  gameRoom.gameState.state = Game.IN_PLAY;
  resetBallAndPaddles(gameRoom.gameState);

  broadcastAll(
    gameId,
    Message("gameStarted", {
      startedBy: userId,
      gameState: gameRoom.gameState,
      players: Object.values(gameRoom.players),
    })
  );

  fastify.log.info(`Game ${gameId} started by user ${userId}`);

  startGameLoop(gameId, gameRoom.gameState, (updatedGameState) => {
    try {
      if (updatedGameState.state == Game.FINISHED) {
        handleGameOver(gameId, updatedGameState);
      }

      broadcastAll(gameId, Message("gameStateUpdate", updatedGameState));
    } catch (loopError) {
      fastify.log.error(
        `Error in game loop for game ${gameId}: ${loopError.message}`
      );
    }
  });

  return true;
}

function resumeGameFromPause(gameId, userId, gameRoom) {
  gameRoom.gameState.state = Game.IN_PLAY;

  broadcastAll(
    gameId,
    Message("gameResumed", {
      resumedBy: userId,
      message: "Game resumed",
    })
  );

  fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
  return true;
}

// *************************** PADDLE MOVEMENT ***************************
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
    fastify.log.info(
      `Paddle move ignored - game ${gameId} not in play (state: ${gameRoom.gameState.state})`
    );
    return false;
  }

  const playerType = gameRoom.players[userId]?.playerType;
  if (!playerType) {
    fastify.log.info(`Paddle move from non-player ${userId} in game ${gameId}`);
    return false;
  }

  updatePaddlePosition(gameRoom.gameState, playerType, pos);
  return true;
}

// *************************** GAME PAUSE/RESUME ***************************
function handlePauseGame(gameId, userId) {
  try {
    const gameRoom = gameRooms.get(gameId);
    const socket = connections.get(gameId)?.get(userId);

    // Validate game room exists
    if (!gameRoom) {
      fastify.log.warn(
        `Attempt to pause non-existent game ${gameId} by user ${userId}`
      );
      sendErrorAndClose(
        socket,
        "Game does not exist",
        WS_CLOSE.POLICY_VIOLATION
      );
      return false;
    }

    // Validate user is part of this game
    if (!gameRoom.players[userId]) {
      fastify.log.warn(
        `Unauthorized attempt to pause game ${gameId} by user ${userId}`
      );
      sendErrorAndClose(
        socket,
        "You are not authorized to pause this game",
        WS_CLOSE.POLICY_VIOLATION
      );
      return false;
    }

    // Can only pause a game in progress
    if (gameRoom.gameState.state !== Game.IN_PLAY) {
      fastify.log.warn(
        `Cannot pause game ${gameId} in state ${gameRoom.gameState.state}`
      );
      sendErrorAndClose(
        socket,
        "Game cannot be paused in current state",
        WS_CLOSE.POLICY_VIOLATION
      );
      return false;
    }

    // Pause the game
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);

    broadcastAll(
      gameId,
      Message("gamePaused", {
        pausedBy: userId,
        reason: "userRequested",
        message: `Game paused by player ${gameRoom.players[userId].playerType}`,
      })
    );

    fastify.log.info(`Game ${gameId} paused by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error pausing game ${gameId}: ${error.message}`);
    return false;
  }
}

function handleResumeGame(gameId, userId) {
  try {
    const gameRoom = gameRooms.get(gameId);

    // Validate game exists
    if (!gameRoom) {
      fastify.log.warn(
        `Attempt to resume non-existent game ${gameId} by user ${userId}`
      );
      sendToUser(
        gameId,
        userId,
        Message("error", { message: "Game does not exist" })
      );
      return false;
    }

    // Validate user is part of this game
    if (!gameRoom.players[userId]) {
      fastify.log.warn(
        `Unauthorized attempt to resume game ${gameId} by user ${userId}`
      );
      sendToUser(
        gameId,
        userId,
        Message("error", {
          message: "You are not authorized to resume this game",
        })
      );
      return false;
    }

    // Can only resume a paused game
    if (gameRoom.gameState.state !== Game.PAUSED) {
      fastify.log.warn(
        `Cannot resume game ${gameId} in state ${gameRoom.gameState.state}`
      );
      sendToUser(
        gameId,
        userId,
        Message("error", { message: "Game cannot be resumed in current state" })
      );
      return false;
    }

    // Resume the game
    gameRoom.gameState.state = Game.IN_PLAY;
    resumeGame(gameId);

    broadcastAll(
      gameId,
      Message("gameResumed", {
        resumedBy: userId,
        reason: "userRequested",
        message: `Game resumed by player ${gameRoom.players[userId].playerType}`,
      })
    );

    fastify.log.info(`Game ${gameId} resumed by user ${userId}`);
    return true;
  } catch (error) {
    fastify.log.error(`Error resuming game ${gameId}: ${error.message}`);
    return false;
  }
}

// *************************** DISCONNECT HANDLING ***************************
function handleDisconnect(gameId, userId, closeCode) {
  fastify.log.info(
    `User ${userId} disconnected from game ${gameId} ${
      closeCode ? ` with code ${closeCode}` : ""
    }`
  );

  // Clean up connections
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

  // Handle disconnection based on game state
  switch (gameRoom.gameState.state) {
    case Game.FINISHED:
    case Game.CANCELED:
      fastify.log.info(
        `Game ${gameId} is (${gameRoom.gameState.state}), ignoring disconnect`
      );
      return;
    case Game.START:
    case Game.JOINED:
      if (gameRoom.players[userId]) {
        delete gameRoom.players[userId];
        fastify.log.info(
          `Removed player ${userId} from the game ${gameId}`
        );

        broadcast(
          gameId,
          userId,
          Message("playerLeft", {
            message: "Opponent left the game",
            userId: userId,
          })
        );
      }
      return;

    case Game.IN_PLAY:
    case Game.PAUSED:
      disconnectTimeout(gameRoom, gameId, userId, closeCode);
      return;

    default:
      fastify.log.warn(
        `Unhandled game state ${gameRoom.gameState.state} in handleDisconnect for game ${gameId}`
      );
      return;
  }
}

function disconnectTimeout(gameRoom, gameId, userId, closeCode) {
  if (!gameRoom.players[userId]) {
    fastify.log.warn(
      `Player ${userId} not found in game ${gameId}, cannot handle disconnect`
    );
    return;
  }

  const isIntentionalDisconnect =
    closeCode === WS_CLOSE.NORMAL || closeCode === WS_CLOSE.GOING_AWAY;

  gameRoom.disconnectedPlayers[userId] = {
    ...gameRoom.players[userId],
    disconnectedAt: Date.now(),
    intentionalDisconnect: isIntentionalDisconnect,
  };

  const disconnectedPlayerType = gameRoom.players[userId].playerType;

  const remainingPlayers = { ...gameRoom.players };
  delete remainingPlayers[userId];
  delete gameRoom.players[userId];

  fastify.log.info(
    `Removed player ${userId} from active players in game ${gameId}`
  );

  const remainingPlayerId = Object.keys(remainingPlayers)[0];
  const remainingPlayerType = remainingPlayers[remainingPlayerId]?.playerType;

  if (gameRoom.gameState.state === Game.IN_PLAY) {
    gameRoom.gameState.state = Game.PAUSED;
    pauseGame(gameId);
  }
  broadcastAll(
    gameId,
    Message("gamePaused", {
      reason: "playerDisconnected",
      message: "Player disconnected. Waiting for reconnection...",
      intentional: isIntentionalDisconnect,
      userId: userId,
      playerType: disconnectedPlayerType,
    })
  );

  const timeout = isIntentionalDisconnect
    ? gameRoom.intentionalDisconnectTime
    : gameRoom.maxReconnectTime;

  fastify.log.info(
    `Set reconnection timer for game ${gameId}, player ${userId}: ${timeout}ms`
  );

  gameRoom.disconnectTimer = setTimeout(async () => {
    await handleReconnectionTimeout(
      gameId,
      userId,
      gameRoom,
      disconnectedPlayerType,
      remainingPlayerType
    );
  }, timeout);
}

async function handleReconnectionTimeout(
  gameId,
  userId,
  gameRoom,
  disconnectedPlayerType,
  remainingPlayerType
) {
  if (gameRoom.disconnectedPlayers[userId]) {
    stopGameLoop(gameId);
    gameRoom.gameState.state = Game.CANCELED;

    // Determine winner and loser
    let winnerType, loserType;

    if (remainingPlayerType) {
      winnerType = remainingPlayerType;
      loserType = disconnectedPlayerType;
    } else {
      winnerType =
        disconnectedPlayerType === "mainPlayer" ? "secondPlayer" : "mainPlayer";
      loserType = disconnectedPlayerType;
    }

    // Update scores
    if (winnerType === "mainPlayer") {
      gameRoom.gameState.score.mainPlayer = defaultGameConfig.scoreToWin;
      gameRoom.gameState.score.secondPlayer = 0;
    } else {
      gameRoom.gameState.score.mainPlayer = 0;
      gameRoom.gameState.score.secondPlayer = defaultGameConfig.scoreToWin;
    }

    // Set winner in game state
    gameRoom.gameState.winner = winnerType;

    fastify.log.info(
      `Game ${gameId} finished due to player disconnect. Winner: ${winnerType} (10-0)`
    );

    // Notify all players about game end
    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: gameRoom.gameState,
        message: `Game won by ${winnerType} due to opponent disconnection`,
        reason: gameRoom.disconnectedPlayers[userId].intentionalDisconnect
          ? "playerLeft"
          : "connectionTimeout",
        disconnectedPlayerType: disconnectedPlayerType,
        forfeit: true,
      })
    );

    // Update game in database
    try {
      await updateGameInDatabase(gameId, gameRoom, winnerType);
    } catch (error) {
      fastify.log.error(
        `Failed to update game ${gameId} in database: ${error.message}`
      );
    }
  }
}

// *************************** GAME OVER HANDLING ***************************
async function handleGameOver(gameId, finalGameState) {
  try {
    fastify.log.info(
      `Game ${gameId} has ended. Winner: ${finalGameState.winner}`
    );

    const gameRoom = gameRooms.get(gameId);
    if (!gameRoom) {
      fastify.log.warn(
        `Cannot handle game over for non-existent game ${gameId}`
      );
      return;
    }

    // Update game state
    gameRoom.gameState.state = Game.FINISHED;
    gameRoom.endedAt = Date.now();

    // Clear any pending timers
    if (gameRoom.disconnectTimer) {
      clearTimeout(gameRoom.disconnectTimer);
      gameRoom.disconnectTimer = null;
    }

    // Stop game loop
    stopGameLoop(gameId);

    // Notify all players
    broadcastAll(
      gameId,
      Message("gameFinished", {
        gameState: finalGameState,
        endTime: gameRoom.endedAt,
        message: `Game finished. Winner: ${finalGameState.winner}`,
      })
    );

    // Update game in database
    try {
      await updateGameInDatabase(gameId, gameRoom, finalGameState.winner);
    } catch (dbError) {
      fastify.log.error(
        `Database error in handleGameOver for game ${gameId}: ${dbError.message}`
      );
    }

    // Schedule cleanup of game resources
    setTimeout(() => {
      try {
        gameRooms.delete(gameId);
        connections.delete(gameId);
        fastify.log.debug(`Game ${gameId} resources cleaned up`);
      } catch (cleanupError) {
        fastify.log.error(`Error during game cleanup: ${cleanupError.message}`);
      }
    }, 60000);
  } catch (error) {
    fastify.log.error(
      `Error in handleGameOver for game ${gameId}: ${error.message}`
    );
    stopGameLoop(gameId);
    broadcastAll(
      gameId,
      Message("gameError", {
        message: "Game ended with errors",
        gameId: gameId,
      })
    );
  }
}
