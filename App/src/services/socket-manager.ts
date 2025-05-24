export enum GameStates {
  START = 0,
  JOINED = 1,
  IN_PLAY = 2,
  PAUSED = 3,
  RECONNECT = 4,
  CANCELED = 5,
  ERROR = 6,
  FINISHED = 7,
}

// Game data interfaces
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

// Event data interfaces
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
  private gameId: string = "";
  private user: any = null;
  private playerPosition: string = "";
  private gameState: GameState = {
    state: GameStates.START,
    paddles: { left: 50, right: 50 },
    ball: { x: 50, y: 50 },
    score: { left: 0, right: 0 },
  };
  private gameConfig: GameConfig | null = null;
  private isLocal: boolean = false;
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
    onReconnect: [],
  };

  init(gameId: string, user: any): SocketManager {
    console.log(
      `[SocketManager] Initializing for game ${gameId}, user ${user.id}`
    );
    this.gameId = gameId;
    this.user = user;
    return this;
  }

  connect(): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      if (!this.gameId || !this.user?.id) {
        console.error(
          "[SocketManager] Cannot connect: Missing gameId or userId"
        );
        return reject(new Error("Missing gameId or userId"));
      }

      let wsUrl;
      if (this.isLocal) {
        wsUrl = `ws://127.0.0.1:3000/ws/local/${this.gameId}`;
        console.log("[SocketManager] Connecting to local game:", wsUrl);
      } else {
        const token = `Bearer ${localStorage.getItem("access_token")}`;
        wsUrl = `ws://127.0.0.1:3000/ws/game/${this.gameId}?token=${token}`;
        console.log("[SocketManager] Connecting to online game:", wsUrl);
      }

      this.socket = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.error("[SocketManager] Connection timeout");
          reject(new Error("Connection timeout"));
          this.socket.close();
          this.socket = null;
        }
      }, 5000);

      this.socket.onopen = () => {
        this.isConnected = true;
        clearTimeout(connectionTimeout);
        console.log("[SocketManager] WebSocket connection established");
        this._notifyListeners("onConnect", {
          message: "Connected to game server",
        });
        resolve({ message: "Connected to game server" });
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        clearTimeout(connectionTimeout);
        console.log(`[SocketManager] Connection closed, code: ${event.code}`);
        this._notifyListeners("onDisconnect", {
          code: event.code,
          reason: event.reason || "Connection closed",
        });
        this.socket = null;
      };

      this.socket.onerror = (error) => {
        console.error("[SocketManager] WebSocket error:", error);
        this._notifyListeners("onError", {
          message: "WebSocket connection error",
          error,
        });
      };

      this.socket.onmessage = (event) => this._handleMessage(event);
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("[SocketManager] Disconnecting from server");
      this.socket.close(1000);
      this.socket = null;
    }
  }

  sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("[SocketManager] Sending message:", message.type);
      this.socket.send(JSON.stringify(message));
      return true;
    }
    console.warn("[SocketManager] Failed to send message: Socket not open");
    return false;
  }


  joinGame(): boolean {
    console.log("[SocketManager] Joining game");
    return this.sendMessage({ type: "joinGame" });
  }

  startOfflineGame(): boolean {
    console.log("[SocketManager] Starting offline game");
    return this.sendMessage({ type: "startOfflineGame" });
  }

  sendOfflinePaddleMove(position: number, side: "left" | "right"): boolean {
    if (this.isLocal) {
      if (side === "left") {
        this.gameState.paddles.left = position;
      } else if (side === "right") {
        this.gameState.paddles.right = position;
      }
    }
    return this.sendMessage({
      type: "offlinePaddleMove",
      position: position,
      side: side,
    });
  }

  sendPaddleMove(position: number): boolean {
    if (this.playerPosition) {
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

  pauseGame(): boolean {
    console.log("[SocketManager] Requesting game pause");
    return this.sendMessage({ type: "pauseGame" });
  }


  resumeGame(): boolean {
    console.log("[SocketManager] Requesting game resume");
    return this.sendMessage({ type: "resumeGame" });
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getPlayerPosition(): string {
    return this.playerPosition;
  }

  getGameConfig(): GameConfig | null {
    return this.gameConfig;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  isLocalGame(): boolean {
    return this.isLocal;
  }
  getGameId(): string {
    return this.gameId;
  }

  addEventListener<K extends keyof EventCallbacks>(
    event: K,
    callback: EventCallbacks[K][number]
  ): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Function[]).push(callback);
    }
  }

  removeEventListener<K extends keyof EventCallbacks>(
    event: K,
    callback: EventCallbacks[K][number]
  ): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Function[]) = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }


  private _handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data.toString());
      console.log("[SocketManager] Received message:", message.type);

      switch (message.type) {
        case "connected":
          console.log("[SocketManager] Connected to game server");
          break;

        case "initGame":
          this.gameConfig = message.data.gameConfig;
          this.gameState = message.data.gameState;
          console.log(
            "[SocketManager] Game initialized with config",
            this.gameConfig
          );
          this.joinGame();
          break;

        case "joinedGame":
          this.playerPosition = message.data.position;
          this.gameState = message.data.gameState;
          console.log(
            `[SocketManager] Joined as ${this.playerPosition} player`
          );
          this._notifyListeners("onPlayerJoined", {
            position: this.playerPosition,
            gameState: this.gameState,
            players: message.data.players,
          });
          break;

        case "playerJoined":
          console.log("[SocketManager] Another player joined the game");
          this._notifyListeners("onPlayerJoined", {
            players: message.data.players,
          });
          break;

        case "readyToStart":
          this.gameState = message.data.gameState;
          console.log(
            "[SocketManager] Game ready to start - countdown should begin"
          );
          this._notifyListeners("onGameState", {
            state: "readyToStart",
            gameState: this.gameState,
          });
          break;

        case "gameStarted":
          this.gameState = message.data.gameState;
          console.log("[SocketManager] Game started");
          this._notifyListeners("onGameStart", {
            gameState: this.gameState,
          });
          break;

        case "gameStateUpdate":
          this.gameState = message.data;
          this._notifyListeners("onGameState", {
            state: "update",
            gameState: this.gameState,
          });
          break;

        case "gamePaused":
          this.gameState.state = GameStates.PAUSED;
          console.log(`[SocketManager] Game paused: ${message.data.message}`);
          this._notifyListeners("onGamePause", {
            message: message.data.message,
            reason: message.data.reason,
          });
          break;

        case "gameResumed":
          this.gameState.state = GameStates.IN_PLAY;
          console.log(`[SocketManager] Game resumed: ${message.data.message}`);
          this._notifyListeners("onGameResume", {
            message: message.data.message,
          });
          break;

        case "playerReconnected":
          console.log(
            `[SocketManager] Player reconnected (position: ${message.data.position})`
          );
          this._notifyListeners("onReconnect", {
            position: message.data.position,
          });
          break;

        case "reconnectedToGame":
          this.gameState = message.data.gameState;
          this.playerPosition = message.data.position;
          console.log(
            `[SocketManager] Reconnected to game as ${this.playerPosition} player`
          );
          this._notifyListeners("onReconnect", {
            gameState: this.gameState,
            position: this.playerPosition,
            players: message.data.players,
            reconnectionTime: message.data.reconnectionTime,
          });
          break;

                case "gameFinished":
          this.gameState = message.data.gameState;
          console.log(
            `[SocketManager] Game finished. Winner: ${this.gameState.winner}`
          );
          this._notifyListeners("onGameFinish", {
            gameState: this.gameState,
            winner: this.gameState.winner || "",
            message: message.data.message,
          });
          break;

        case "gameCanceled":
          this.gameState.state = GameStates.CANCELED;
          console.log(`[SocketManager] Game canceled: ${message.data.message}`);
          this._notifyListeners("onGameState", {
            state: "canceled",
            gameState: this.gameState,
            message: message.data.message,
          });
          break;

        case "error":
          console.error(
            `[SocketManager] Server error: ${message.data.message}`
          );
          this._notifyListeners("onError", {
            message: message.data.message,
          });
          break;

        default:
          console.warn("[SocketManager] Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("[SocketManager] Error handling message:", error);
      this._notifyListeners("onError", {
        message: "Error processing server message",
        error: error,
      });
    }
  }

  private _notifyListeners<K extends keyof EventCallbacks>(
    event: K,
    data: Parameters<EventCallbacks[K][number]>[0]
  ): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          (callback as Function)(data);
        } catch (e) {
          console.error(`[SocketManager] Error in ${event} listener:`, e);
        }
      });
    }
  }

  setLocalGameMode(local: boolean) {
    console.log(`[SocketManager] Setting local game mode to: ${local}`);
    this.isLocal = local;
  }

  cleanup(): void {
    console.log("[SocketManager] Cleaning up resources");    
    if (this.socket) {
      try {
        this.socket.close(1000, "Client cleanup");
        this.socket = null;
      } catch (err) {
        console.warn("[SocketManager] Error during socket close:", err);
      }
    }
    for (const eventType in this.listeners) {
      this.listeners[eventType as keyof EventCallbacks] = [];
    }
    this.isConnected = false;    
    this.playerPosition = "";
    this.gameState = {
      state: GameStates.START,
      paddles: { left: 50, right: 50 },
      ball: { x: 50, y: 50 },
      score: { left: 0, right: 0 },
    };
    this.gameConfig = null;
    
    console.log("[SocketManager] Resources cleaned up");
  }
}
