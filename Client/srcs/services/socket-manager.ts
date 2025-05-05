export enum GameStates {
  START = 0,
  JOINED = 1,
  IN_PLAY = 2,
  PAUSED = 3,
  RECONNECT = 4,
  CANCELED = 5,
  ERROR = 6,
  FINISHED = 7
}

export interface PaddlePositions {
  left: number;
  right: number;
}

export interface Score {
  left: number;
  right: number;
}

export interface BallState {
  x: number;
  y: number;
}

export interface GameState {
  state: GameStates;
  paddles: PaddlePositions;
  ball: BallState;
  score: Score;
  winner?: string;
}

export interface GameConfig {
  paddleWidth: number;
  paddleHeight: number;
  ballSize: number;
  leftPaddleX: number;
  rightPaddleX: number;
  ratio: number;
}

export interface Player {
  id: string;
  name?: string;
}

export interface Players {
  [position: string]: Player;
}

export interface ConnectData {
  message: string;
}

export interface DisconnectData {
  code: number;
  reason: string;
}

export interface ErrorData {
  message: string;
  error?: any;
}

export interface GameStateData {
  state: string;
  gameState: GameState;
  message?: string;
}

export interface PlayerJoinedData {
  position?: string;
  gameState?: GameState;
  players: Players;
}

export interface GameStartData {
  gameState: GameState;
}

export interface GamePauseResumeData {
  message: string;
  reason?: string;
}

export interface ReconnectData {
  position?: string;
  gameState?: GameState;
  players?: Players;
  reconnectionTime?: number;
}

export interface GameFinishData {
  gameState: GameState;
  winner: string;
  message: string;
}

interface EventCallbacks {
  onConnect: ((data: ConnectData) => void)[];
  onDisconnect: ((data: DisconnectData) => void)[];
  onGameState: ((data: GameStateData) => void)[];
  onPlayerJoined: ((data: PlayerJoinedData) => void)[];
  onGameStart: ((data: GameStartData) => void)[];
  onGamePause: ((data: GamePauseResumeData) => void)[];
  onGameResume: ((data: GamePauseResumeData) => void)[];
  onGameFinish: ((data: GameFinishData) => void)[];
  onError: ((data: ErrorData) => void)[];
  onReconnect: ((data: ReconnectData) => void)[];
}

export class SocketManager {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private gameId: string  = "";
  private userId: string  = "";;
  private playerPosition: string  = "";;
  private gameState: GameState | any = null;
  private gameConfig: GameConfig | any = null;
  private listeners: EventCallbacks = {
    onConnect: [],
    onDisconnect: [],
    onGameState: [],
    onPlayerJoined: [],
    onGameStart: [],
    onGamePause: [],
    onGameResume: [],
    onGameFinish: [],
    onError: [],
    onReconnect: []
  };

  init(gameId: string, userId: string): SocketManager {
    this.gameId = gameId;
    this.userId = userId;
    return this;
  }

  connect(): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      if (!this.gameId || !this.userId) {
        return reject(new Error("Missing gameId or userId"));
      }

      // const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // const host =
      //   window.location.hostname.split(":")[0] === "127.0.0.1"
      //     ? "localhost:3000"
      //     : window.location.host;
      const wsUrl = `ws://10.32.137.74:3000/ws/game/${this.gameId}/${this.userId}`;

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
          message: "Connected to game server"
        });
        resolve({ message: "Connected to game server" });
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        clearTimeout(connectionTimeout);
        this._notifyListeners("onDisconnect", {
          code: event.code,
          reason: event.reason || "Connection closed"
        });
        this.socket = null;
      };

      this.socket.onerror = (error) => {
        console.log("WebSocket error:", error);
        this._notifyListeners("onError", {
          message: "WebSocket connection error",
          error
        });
      };

      this.socket.onmessage = (event) => this._handleMessage(event);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000);
    }
  }

  sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Doesn't appear to be used in the provided code
  joinGame(): boolean {
    return this.sendMessage({ type: "joinGame" });
  }

  sendPaddleMove(position: number): boolean {
    if (this.gameState && this.playerPosition) {
      if (this.playerPosition === "left") {
        this.gameState.paddles.left = position;
      } else if (this.playerPosition === "right") {
        this.gameState.paddles.right = position;
      }
    }
    
    return this.sendMessage({
      type: "paddleMove",
      position: position
    });
  }

  pauseGame(): boolean {
    return this.sendMessage({ type: "pauseGame" });
  }

  resumeGame(): boolean {
    return this.sendMessage({ type: "resumeGame" });
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  getPlayerPosition(): string | null {
    return this.playerPosition;
  }

  getGameConfig(): GameConfig | null {
    return this.gameConfig;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  addEventListener<K extends keyof EventCallbacks>(event: K, callback: EventCallbacks[K][number]): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Function[]).push(callback);
    }
  }

  removeEventListener<K extends keyof EventCallbacks>(event: K, callback: EventCallbacks[K][number]): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Function[]) = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private _handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data.toString());
      console.log("Received message:", message.type, message);

      switch (message.type) {
        case "connected":
          console.log("Connected to game server");
          break;

        case "initGame":
          this.gameConfig = message.data.gameConfig;
          this.gameState = message.data.gameState;
          console.log("Game initialized with config:", this.gameConfig);
          console.log("join game automatically after initGame event");
          this.joinGame();
          break;

        case "joinedGame":
          this.playerPosition = message.data.position;
          this.gameState = message.data.gameState;
          this._notifyListeners("onPlayerJoined", {
            position: this.playerPosition,
            gameState: this.gameState,
            players: message.data.players
          });
          console.log(`Joined as ${this.playerPosition} player`);
          break;

        case "playerJoined":
          this._notifyListeners("onPlayerJoined", {
            players: message.data.players
          });
          console.log("Other player joined the game");
          break;

        case "readyToStart":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameState", {
            state: "readyToStart",
            gameState: this.gameState
          });
          console.log("Game ready to start - countdown should begin");
          break;

        case "gameStarted":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameStart", {
            gameState: this.gameState
          });
          console.log("Game started");
          break;

        case "gameStateUpdate":
          this.gameState = message.data;
          this._notifyListeners("onGameState", {
            state: "update",
            gameState: this.gameState
          });
          break;

        case "gamePaused":
          if (this.gameState) this.gameState.state = GameStates.PAUSED;
          this._notifyListeners("onGamePause", {
            message: message.data.message,
            reason: message.data.reason
          });
          console.log(`Game paused: ${message.data.message}`);
          break;

        case "gameResumed":
          if (this.gameState) this.gameState.state = GameStates.IN_PLAY;
          this._notifyListeners("onGameResume", {
            message: message.data.message
          });
          console.log(`Game resumed: ${message.data.message}`);
          break;

        case "playerReconnected":
          this._notifyListeners("onReconnect", {
            position: message.data.position
          });
          console.log(`Player reconnected (position: ${message.data.position})`);
          break;

        case "reconnectedToGame":
          this.gameState = message.data.gameState;
          this.playerPosition = message.data.position;
          this._notifyListeners("onReconnect", {
            gameState: this.gameState,
            position: this.playerPosition,
            players: message.data.players,
            reconnectionTime: message.data.reconnectionTime
          });
          console.log(`Reconnected to game as ${this.playerPosition} player`);
          break;

        case "gameFinished":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameFinish", {
            gameState: this.gameState,
            winner: this.gameState.winner,
            message: message.data.message
          });
          console.log(`Game finished. Winner: ${this.gameState.winner}`);
          break;

        case "gameCanceled":
          if (this.gameState) this.gameState.state = GameStates.CANCELED;
          this._notifyListeners("onGameState", {
            state: "canceled",
            gameState: this.gameState,
            message: message.data.message
          });
          console.log(`Game canceled: ${message.data.message}`);
          break;

        case "error":
          this._notifyListeners("onError", {
            message: message.data.message
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
        error: error
      });
    }
  }

  private _notifyListeners<K extends keyof EventCallbacks>(event: K, data: Parameters<EventCallbacks[K][number]>[0]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          (callback as Function)(data);
        } catch (e) {
          console.error(`Error in ${event} listener:`, e);
        }
      });
    }
  }
}
