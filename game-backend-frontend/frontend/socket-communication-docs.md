# WebSocket Communication Documentation

This document explains the WebSocket communication between the frontend and backend in the Pong game application.

## Connection Setup

The game establishes a WebSocket connection when the user clicks the "Connect" button. The connection URL is constructed dynamically:

```javascript
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host =
  window.location.hostname.split(":")[0] == "127.0.0.1"
    ? "localhost:3000"
    : window.location.host;
const wsUrl = `${protocol}//${host}/ws/game/${gameId}/${userId}`;
```

This creates a WebSocket URL that works both in local development and production environments.

## Connection Lifecycle

### Establishing Connection

- The `connectToGame()` function initializes the WebSocket connection.
- Connection parameters (gameId and userId) are read from the URL query parameters.
- The UI is updated to show the connection status.

### Connection Events

- **onopen**: Triggered when connection is established

  - Sets `isConnected` to true
  - Updates UI to reflect connected state

- **onclose**: Triggered when connection is closed

  - Sets `isConnected` to false
  - Updates UI to reflect disconnected state
  - Stops any ongoing animation loops

- **onerror**: Handles connection errors

  - Displays error message to user

- **onmessage**: Processes incoming messages from the server

### Disconnecting

The `disconnectFromGame()` function closes the connection with a normal closure code (1000).

## Message Protocol

The frontend and backend communicate through JSON messages with a specific structure:

```javascript
{
  type: "messageType",
  data: { /* message payload */ }
}
```

### Outgoing Messages (Frontend to Backend)

The frontend sends these message types to the server:

1. **joinGame**

   - Sent automatically after receiving the "initGame" message
   - No additional data

2. **paddleMove**

   - Sent when the player moves their paddle (mouse or keyboard)
   - Contains the new paddle position (0-100)

   ```javascript
   {
     type: "paddleMove",
     position: paddlePos
   }
   ```

3. **pauseGame**

   - Sent when the player clicks the pause button
   - No additional data

4. **resumeGame**
   - Sent when the player clicks the resume button
   - No additional data

### Incoming Messages (Backend to Frontend)

The backend sends these message types to the frontend:

1. **connected**

   - Confirms initial WebSocket connection

2. **initGame**

   - Contains initial game configuration and state
   - Data includes:
     - `gameConfig`: Game configuration parameters
     - `gameState`: Current game state

3. **joinedGame**

   - Confirms player has joined the game
   - Data includes:
     - `position`: Player position (left/right)
     - `gameState`: Updated game state
     - `players`: Information about connected players

4. **playerJoined**

   - Notifies when another player joins
   - Data includes:
     - `players`: Updated player information

5. **readyToStart**

   - Indicates both players are connected and game will start soon
   - Data includes:
     - `gameState`: Updated game state

6. **gameStarted**

   - Indicates the game has started
   - Data includes:
     - `gameState`: Updated game state with IN_PLAY status

7. **gameStateUpdate**

   - Regular updates with game state (ball position, paddles, etc.)
   - Data is the complete game state

8. **gamePaused**

   - Indicates game is paused
   - Data includes:
     - `message`: Reason for pause

9. **gameResumed**

   - Indicates game has resumed
   - Data includes:
     - `message`: Confirmation message

10. **playerReconnected**

    - Indicates a player has reconnected
    - Data includes:
      - `position`: Position of reconnected player (left/right)

11. **reconnectedToGame**

    - Sent to a player who has reconnected
    - Data includes:
      - `gameState`: Current game state
      - `position`: Player's position
      - `players`: Current players information

12. **gameFinished**

    - Indicates game is over
    - Data includes:
      - `gameState`: Final game state with winner information

13. **gameCanceled**

    - Indicates game was canceled
    - Data includes:
      - `message`: Reason for cancelation

14. **error**
    - Indicates an error occurred
    - Data includes:
      - `message`: Error description

## Message Handling

The `handleMessage()` function processes incoming messages from the server:

```javascript
function handleMessage(event) {
  try {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "connected":
        // Handle connected message
        break;
      case "initGame":
        // Handle game initialization
        break;
      // ... other message types
    }
  } catch (error) {
    console.error("Error handling message:", error);
    updateStatus("Error processing server message", "error");
  }
}
```

Each message type has specific handling logic that updates the game state and UI accordingly.

## Sending Messages

Messages are sent to the server using the `sendMessage()` function:

```javascript
function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    updateStatus("Cannot send message: Not connected");
  }
}
```

This function checks if the connection is open before attempting to send data.

## Game State Synchronization

The frontend maintains a local copy of the game state (`gameState`) which is updated with each message from the server. This allows the game to render the current state while waiting for updates.

For paddle movement, the frontend immediately updates the local state for responsive UI:

```javascript
// Update local state for smoother rendering while waiting for server response
if (playerPosition === "left") {
  gameState.paddles.left = newPos;
} else if (playerPosition === "right") {
  gameState.paddles.right = newPos;
}
```

This creates a smooth user experience while maintaining server authority over the game state.
