/**
 * Socket Manager
 *
 * Handles all WebSocket communication between frontend and backend
 * with no UI dependencies. This module can be imported into any project
 * that needs to communicate with the game backend.
 */
const GAME_STATES = {
  START: 0,
  JOINED: 1,
  IN_PLAY: 2,
  PAUSED: 3,
  RECONNECT: 4,
  CANCELED: 5,
  ERROR: 6,
  FINISHED: 7,
};

export class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.gameId = null;
    this.userId = null;
    this.playerPosition = null;
    this.gameState = null;
    this.gameConfig = null;
    this.listeners = {
      onConnect: [],
      onDisconnect: [],
      onGameState: [],
      onPlayerJoined: [],
      onGameStart: [],
      onGamePause: [],
      onGameResume: [],
      onGameFinish: [],
      onError: [],
      onReconnect: [],
    };
  }

  init(gameId, userId) {
    this.gameId = gameId;
    this.userId = userId;
    return this;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (!this.gameId || !this.userId) {
        return reject(new Error("Missing gameId or userId"));
      }
      const wsUrl = `ws://localhost:3000/ws/game/${this.gameId}/${this.userId}`;
      console.log("Connecting to WebSocket:", wsUrl);
      this.socket = new WebSocket(wsUrl);
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          reject(new Error("Connection timeout"));
          this.socket.close();
          this.socket = null;
        }
      }, 5000);

      this.socket.onopen = () => {
        this.isConnected = true;
        clearTimeout(connectionTimeout);
        console.log("WebSocket connection established");
        this._notifyListeners("onConnect", {
          message: "Connected to game server",
        });
        resolve({ message: "Connected to game server" });
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        clearTimeout(connectionTimeout);
        this._notifyListeners("onDisconnect", {
          code: event.code,
          reason: event.reason || "Connection closed",
        });
        this.socket = null;
      };

      this.socket.onerror = (error) => {
        console.log("WebSocket error:", error);
        this._notifyListeners("onError", {
          message: "WebSocket connection error",
          error,
        });
      };

      this.socket.onmessage = (event) => this._handleMessage(event);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000);
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  joinGame() {
    return this.sendMessage({ type: "joinGame" });
  }

  sendPaddleMove(position) {
    if (this.gameState && this.playerPosition) {
      if (this.playerPosition === "left") {
        this.gameState.paddles.left = position;
      } else if (this.playerPosition === "right") {
        this.gameState.paddles.right = position;
      }
    }
    return this.sendMessage({
      type: "paddleMove",
      position: position,
    });
  }

  pauseGame() {
    return this.sendMessage({ type: "pauseGame" });
  }

  resumeGame() {
    return this.sendMessage({ type: "resumeGame" });
  }

  getGameState() {
    return this.gameState;
  }

  getPlayerPosition() {
    return this.playerPosition;
  }

  getGameConfig() {
    return this.gameConfig;
  }

  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  _handleMessage(event) {
    try {
      const message = JSON.parse(event.data.toString());
      console.log("Received message:", message.type);

      switch (message.type) {
        case "connected":
          console.log("Connected to game server");
          break;

        case "initGame":
          this.gameConfig = message.data.gameConfig;
          this.gameState = message.data.gameState;
          console.log("Game initialized with config:", this.gameConfig);
          console.log("join game automatically after initGame event");
          this.joinGame()
          break;

        case "joinedGame":
          this.playerPosition = message.data.position;
          this.gameState = message.data.gameState;
          this._notifyListeners("onPlayerJoined", {
            position: this.playerPosition,
            gameState: this.gameState,
            players: message.data.players,
          });
          console.log(`Joined as ${this.playerPosition} player`);
          break;

        case "playerJoined":
          this._notifyListeners("onPlayerJoined", {
            players: message.data.players,
          });
          console.log("Other player joined the game");
          break;

        case "readyToStart":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameState", {
            state: "readyToStart",
            gameState: this.gameState,
          });
          console.log("Game ready to start");
          break;

        case "gameStarted":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameStart", {
            gameState: this.gameState,
          });
          console.log("Game started");
          break;

        case "gameStateUpdate":
          this.gameState = message.data;
          this._notifyListeners("onGameState", {
            state: "update",
            gameState: this.gameState,
          });
          break;

        case "gamePaused":
          if (this.gameState) this.gameState.state = GAME_STATES.PAUSED;
          this._notifyListeners("onGamePause", {
            message: message.data.message,
            reason: message.data.reason,
          });
          console.log(`Game paused: ${message.data.message}`);
          break;

        case "gameResumed":
          if (this.gameState) this.gameState.state = GAME_STATES.IN_PLAY;
          this._notifyListeners("onGameResume", {
            message: message.data.message,
          });
          console.log(`Game resumed: ${message.data.message}`);
          break;

        case "playerReconnected":
          this._notifyListeners("onReconnect", {
            position: message.data.position,
          });
          console.log(
            `Player reconnected (position: ${message.data.position})`
          );
          break;

        case "reconnectedToGame":
          this.gameState = message.data.gameState;
          this.playerPosition = message.data.position;
          this._notifyListeners("onReconnect", {
            gameState: this.gameState,
            position: this.playerPosition,
            players: message.data.players,
            reconnectionTime: message.data.reconnectionTime,
          });
          console.log(`Reconnected to game as ${this.playerPosition} player`);
          break;

        case "gameFinished":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameFinish", {
            gameState: this.gameState,
            winner: this.gameState.winner,
            message: message.data.message,
          });
          console.log(`Game finished. Winner: ${this.gameState.winner}`);
          break;

        case "gameCanceled":
          if (this.gameState) this.gameState.state = GAME_STATES.CANCELED;
          this._notifyListeners("onGameState", {
            state: "canceled",
            message: message.data.message,
          });
          console.log(`Game canceled: ${message.data.message}`);
          break;

        case "error":
          this._notifyListeners("onError", {
            message: message.data.message,
          });
          console.error(`Server error: ${message.data.message}`);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      this._notifyListeners("onError", {
        message: "Error processing server message",
        error: error,
      });
    }
  }

  _notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in ${event} listener:`, e);
        }
      });
    }
  }
}

// Example usage:
/*
const socketManager = new SocketManager();
socketManager.init(gameId, userId);

// Add event listeners
socketManager.addEventListener('onConnect', (data) => {
  console.log("Connected:", data);
  socketManager.joinGame();
});

socketManager.addEventListener('onGameState', (data) => {
  console.log("Game state updated:", data.gameState);
  // Update your game rendering here
});

// Connect to the game server
socketManager.connect()
  .then(() => {
    console.log("Connection successful");
  })
  .catch(error => {
    console.error("Connection failed:", error);
  });

// Send paddle movement
const handleMouseMove = (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  const paddlePos = Math.max(0, Math.min(100, y));
  socketManager.sendPaddleMove(paddlePos);
};

// Clean up
window.addEventListener('beforeunload', () => {
  socketManager.disconnect();
});
*/
