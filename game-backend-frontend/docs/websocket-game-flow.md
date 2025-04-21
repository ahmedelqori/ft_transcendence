# WebSocket Game Flow

## Connection Process

1. **WebSocket Setup**

   - `setupWebSocketHandlers()` registers the WebSocket endpoint
   - Route: `/ws/game/:gameId/:userId`
   - Frontend should connect to: `ws://[server-address]/ws/game/:gameId/:userId`

2. **Connection Handling**

   - `handleWebSocketConnection()` processes new connections
   - Validates user authentication
   - Checks game permissions via `checkUserGamePermission()`
   - Handles existing connections with `handleOldConnection()`
   - Sets up new connections with `setupNewConnection()`

3. **Connection Setup**
   - Sends initial game data with `sendInitialGameData()`
   - Sets up heartbeat mechanism with `runHeartBeatMechanism()`
   - Registers message and close event handlers

## Game Flow

1. **Joining Game**

   - Client sends `joinGame` message
   - `handleJoinGame()` processes the request
   - Handles reconnection if player was disconnected
   - Assigns player position (left/right)
   - When both players join, game enters `JOINED` state
   - Auto-starts game after timeout

2. **Game Progression**

   - **Starting Game**:

     - `handleStartGame()` initiates gameplay
     - Game state changes to `IN_PLAY`
     - `startGameLoop()` begins physics updates

   - **During Gameplay**:

     - Players send `paddleMove` messages
     - `handlePaddleMove()` updates paddle positions
     - Game loop continuously updates ball position
     - `broadcastAll()` sends updates to all players

   - **Pausing/Resuming**:
     - Players can send `pauseGame`/`resumeGame` messages
     - Game state changes to `PAUSED`/`IN_PLAY`

3. **Disconnections**

   - `handleDisconnect()` processes player disconnection
   - Game pauses and waits for reconnection
   - Sets reconnection timeout
   - If timeout expires, opponent wins by forfeit

4. **Reconnections**

   - `handleReconnection()` restores player state
   - Removes from disconnected players
   - Resumes game if all players reconnected

5. **Game Completion**
   - Game ends when score reaches `scoreToWin`
   - `handleGameOver()` processes the end of game
   - Updates game state to `FINISHED`
   - Updates database with results
   - Cleans up resources after delay

## Frontend Implementation Guide

### WebSocket Connection

```javascript
const connectToGame = (gameId, userId) => {
  const socket = new WebSocket(
    `ws://${SERVER_URL}/ws/game/${gameId}/${userId}`
  );

  socket.onopen = () => {
    console.log("Connected to game server");
    // After connection is established, join the game
    socket.send(JSON.stringify({ type: "joinGame" }));
  };

  socket.onclose = (event) => {
    console.log("Connection closed:", event.code, event.reason);
    // Handle reconnection logic if needed
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleServerMessage(message, socket);
  };

  return socket;
};
```

### Message Handling

```javascript
const handleServerMessage = (message, socket) => {
  const { type, data } = message;

  switch (type) {
    case "connected":
      console.log("Successfully connected to game server");
      break;

    case "initGame":
      // Initialize game with config
      initializeGameBoard(data.gameConfig, data.gameState);
      break;

    case "joinedGame":
      // Player successfully joined the game
      updatePlayerStatus(data.position, data.players);
      break;

    case "playerJoined":
      // Another player joined
      addOpponent(data.userId, data.position);
      break;

    case "readyToStart":
      // Both players joined, countdown to start
      showCountdown();
      break;

    case "gameStarted":
      // Game has started, begin animation loop
      startGameAnimation(data.gameState);
      break;

    case "gameStateUpdate":
      // Update game state (ball position, scores, etc.)
      updateGameState(data);
      break;

    case "gamePaused":
      // Game was paused
      pauseGameAnimation(data.reason);
      break;

    case "gameResumed":
      // Game was resumed
      resumeGameAnimation();
      break;

    case "gameFinished":
      // Game has ended
      endGame(data.gameState.winner, data.message);
      break;

    case "error":
      // Handle errors
      showError(data.message);
      break;

    default:
      console.log("Unknown message type:", type, data);
  }
};
```

### Sending Game Commands

```javascript
// Move paddle (continuously called from animation frame or input handler)
const movePaddle = (socket, position) => {
  socket.send(
    JSON.stringify({
      type: "paddleMove",
      position: position,
    })
  );
};

// Pause the game
const pauseGame = (socket) => {
  socket.send(
    JSON.stringify({
      type: "pauseGame",
    })
  );
};

// Resume the game
const resumeGame = (socket) => {
  socket.send(
    JSON.stringify({
      type: "resumeGame",
    })
  );
};
```

## Game State and Rendering

### Game State Structure

```javascript
// Example game state structure received from server
const gameState = {
  state: 2, // Enum value (Game.IN_PLAY)
  ball: {
    x: 50, // X position (0-100 range)
    y: 50, // Y position (0-100 range)
    xDir: 0.5, // X direction and speed
    yDir: 0.5, // Y direction and speed
  },
  paddles: {
    left: 50, // Left paddle Y position
    right: 50, // Right paddle Y position
  },
  score: {
    left: 0, // Left player score
    right: 0, // Right player score
  },
  winner: null, // 'left', 'right', or null
};
```

### Game Configuration

```javascript
// Default game configuration from server
const gameConfig = {
  playersNumber: 2,
  ballSpeed: 0.1,
  maxBallSpeed: 2,
  ballSize: 2, // Ball diameter as percentage of board width
  paddleWidth: 1.5, // Paddle width as percentage of board width
  paddleHeight: 15, // Paddle height as percentage of board height
  paddleSpeed: 2,
  leftPaddleX: 5, // Position of left paddle (percentage from left)
  rightPaddleX: 95, // Position of right paddle (percentage from left)
  scoreToWin: 10,
  FPS: 60,
  ratio: 4 / 3,
};
```

## Game States Reference

Values for `gameState.state`:

- **START (0)**: Initial state before players join
- **JOINED (1)**: Both players joined, ready to start
- **IN_PLAY (2)**: Game is actively running
- **PAUSED (3)**: Game is paused
- **CANCELED (4)**: Game was canceled
- **FINISHED (5)**: Game has completed

## Message Types

### Client to Server Messages

1. **joinGame**: Request to join the game

   ```javascript
   {
     type: "joinGame";
   }
   ```

2. **paddleMove**: Update paddle position

   ```javascript
   { type: "paddleMove", position: 75.5 }
   ```

3. **pauseGame**: Request to pause the game

   ```javascript
   {
     type: "pauseGame";
   }
   ```

4. **resumeGame**: Request to resume the game
   ```javascript
   {
     type: "resumeGame";
   }
   ```

### Server to Client Messages

1. **connected**: Initial connection confirmation

   ```javascript
   { type: "connected", data: { message: "You are connected" } }
   ```

2. **error**: Error notification

   ```javascript
   { type: "error", data: { message: "Error message" } }
   ```

3. **initGame**: Initial game configuration and state

   ```javascript
   {
     type: "initGame",
     data: {
       gameConfig: {...},  // See gameConfig structure above
       gameState: {...}    // See gameState structure above
     }
   }
   ```

4. **joinedGame**: Confirmation player joined the game

   ```javascript
   {
     type: "joinedGame",
     data: {
       gameId: 123,
       position: "left", // or "right"
       players: [       // Array of players in the game
         { id: 1, position: "left" },
         { id: 2, position: "right" }
       ],
       gameState: {...} // Current game state
     }
   }
   ```

5. **playerJoined**: Notification another player joined

   ```javascript
   {
     type: "playerJoined",
     data: {
       gameId: 123,
       userId: 2,
       position: "right",
       players: [
         { id: 1, position: "left" },
         { id: 2, position: "right" }
       ]
     }
   }
   ```

6. **readyToStart**: Game ready to start (both players joined)

   ```javascript
   {
     type: "readyToStart",
     data: {
       gameRoom: {...}, // Game room information
       gameState: {...} // Current game state
     }
   }
   ```

7. **gameStarted**: Game has started

   ```javascript
   {
     type: "gameStarted",
     data: {
       startedBy: 1,   // User ID who started the game
       gameState: {...},
       players: [...]
     }
   }
   ```

8. **gameStateUpdate**: Updated game state (sent frequently)

   ```javascript
   { type: "gameStateUpdate", data: {...} } // gameState object
   ```

9. **gamePaused**: Game was paused

   ```javascript
   {
     type: "gamePaused",
     data: {
       pausedBy: 1, // User ID who paused (if applicable)
       reason: "userRequested", // or "playerDisconnected"
       message: "Game paused by player 1"
     }
   }
   ```

10. **gameResumed**: Game was resumed

    ```javascript
    {
      type: "gameResumed",
      data: {
        resumedBy: 1,
        reason: "userRequested", // or "reconnection"
        message: "Game resumed by player 1"
      }
    }
    ```

11. **playerReconnected**: Player reconnected after disconnect

    ```javascript
    {
      type: "playerReconnected",
      data: {
        position: "left",
        userId: 1
      }
    }
    ```

12. **reconnectionExpired**: Player's reconnection window expired

    ```javascript
    {
      type: "reconnectionExpired",
      data: {
        gameId: 123,
        message: "Your reconnection window expired",
        gameState: {...}
      }
    }
    ```

13. **playerAbandoned**: Player abandoned the game

    ```javascript
    {
      type: "playerAbandoned",
      data: {
        position: "right",
        userId: 2
      }
    }
    ```

14. **gameFinished**: Game has ended
    ```javascript
    {
      type: "gameFinished",
      data: {
        gameState: {...},
        endTime: 1624782345678,
        message: "Game finished. Winner: left",
        reason: "score", // or "playerLeft" or "connectionTimeout"
        forfeit: false   // true if game ended due to forfeit
      }
    }
    ```
