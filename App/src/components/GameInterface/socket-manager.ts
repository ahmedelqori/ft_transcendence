export enum GameStates {
  START = 0,
  JOINED = 1,
  IN_PLAY = 2,
  PAUSED = 3,
  CANCELED = 4,
  FINISHED = 5,
  RECONNECT = 6,
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
  xDir?: number;
  yDir?: number;
}

export interface GameState {
  state: GameStates;
  paddles: PaddlePositions;
  ball: BallState;
  score: Score;
  winner?: string;
  gameId?: number;
  tournamentId?: number;
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
  gameRoom?: any;
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
  onPlayerLeft: ((data: { message: string; userId: string }) => void)[];
  onPlayerAbandoned: ((data: { position: string; userId: string }) => void)[];
  onReconnectionExpired: ((data: {gameId: string;message: string;gameState: GameState}) => void)[];
  onJoinedOfflineGame: ((data: {gameId: string;userId: string;gameState: GameState;}) => void)[];
  onInitGame: ((data: {gameConfig: GameConfig;gameState: GameState;player?: any;}) => void)[];
}

export class SocketManager {
  private socket: WebSocket | null;
  private isConnected: boolean;
  private gameId: string;
  private user: any;
  private playerPosition: string
  private gameState: GameState
  private gameConfig: GameConfig | null;
  private isLocal: boolean;
  private listeners: EventCallbacks 

  constructor() {
    this.gameConfig = null;
    this.socket = null;
    this.isConnected = false;
    this.gameId = ""
    this.user = null;
    this.playerPosition = "";
    this.gameState = {state: GameStates.START, paddles: { left: 50, right: 50 }, ball: { x: 50, y: 50 }, score: { left: 0, right: 0 }, tournamentId: 0,};
    this.gameConfig = null;
    this.isLocal = false;
    this.listeners = {
      onConnect: [], onDisconnect: [], onGameState: [], onPlayerJoined: [],onGameStart: [],
      onGamePause: [], onGameResume: [], onGameFinish: [], onError: [], onReconnect: [],
      onPlayerLeft: [], onPlayerAbandoned: [], onReconnectionExpired: [], onJoinedOfflineGame: [], onInitGame: [],};
  }  

  init(gameId: string, user: any): SocketManager {
    this.gameId = gameId;
    this.user = user;
    return this;
  }

  connect(): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      if (!this.gameId || !this.user?.id) return reject(new Error("Missing gameId or userId"));
      let wsUrl;
      const token = `Bearer ${localStorage.getItem("access_token")}`;
      if (this.isLocal) {
        console.log(import.meta.env.VITE_DOMAIN_DEV)
        wsUrl = `wss://${import.meta.env.VITE_DOMAIN_DEV}/api/games/local/${this.gameId}`;
        // wsUrl = `ws://localhost:3000/local/${this.gameId}?token=${token}`;
      } else {
        wsUrl = `wss://${import.meta.env.VITE_DOMAIN_DEV}/api/games/online/${this.gameId}?token=${token}`;
        // wsUrl = `ws://localhost:3000/online/${this.gameId}?token=${token}`;
      }
      this.socket = new WebSocket(wsUrl);
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.log("[SocketManager] Connection timeout");
          reject(new Error("Connection timeout"));
          this.socket.close();
          this.socket = null;
        }
      }, 5000);
      this.socket.onopen = () => {
        this.isConnected = true;
        clearTimeout(connectionTimeout);
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
        console.log("[SocketManager] WebSocket error:", error);
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
      this.socket.close(1000);
      this.socket = null;
    }
  }
  sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  joinGame(): boolean {
    return this.sendMessage({ type: "joinGame" });
  }

  startOfflineGame(): boolean {
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
    return this.sendMessage({ type: "pauseGame" });
  }

  resumeGame(): boolean {
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

  addEventListener<K extends keyof EventCallbacks>(event: K,callback: EventCallbacks[K][number]): void {
    if (this.listeners[event]) (this.listeners[event] as Function[]).push(callback);
  }
  removeEventListener<K extends keyof EventCallbacks>(event: K,callback: EventCallbacks[K][number]): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Function[]) = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }
  private _handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data.toString());
      switch (message.type) {
        case "connected":
          break;
        case "initGame":
          this.gameConfig = message.data.gameConfig;
          this.gameState = message.data.gameState;
          this._notifyListeners("onInitGame", {
            gameConfig: message.data.gameConfig,
            gameState: message.data.gameState,
            player: message.data.player,
          });
          this.joinGame();
          break;
        case "joinedGame":
          this.playerPosition = message.data.position;
          this.gameState = message.data.gameState;
          this._notifyListeners("onPlayerJoined", {
            position: this.playerPosition,
            gameState: this.gameState,
            players: message.data.players,
          });
          break;

        case "playerJoined":
          this._notifyListeners("onPlayerJoined", {
            players: message.data.players,
          });
          break;

        case "readyToStart":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameState", {
            state: "readyToStart",
            gameState: this.gameState,
            gameRoom: message.data.gameRoom,
          });
          break;

        case "gameStarted":
          this.gameState = message.data.gameState;
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
          this._notifyListeners("onGamePause", {
            message: message.data.message,
            reason: message.data.reason,
          });
          break;

        case "gameResumed":
          this.gameState.state = GameStates.IN_PLAY;
          this._notifyListeners("onGameResume", {
            message: message.data.message,
          });
          break;

        case "playerReconnected":
          this._notifyListeners("onReconnect", {
            position: message.data.position,
          });
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
          break;

        case "gameFinished":
          this.gameState = message.data.gameState;
          this._notifyListeners("onGameFinish", {
            gameState: this.gameState,
            winner: this.gameState.winner || "",
            message: message.data.message,
          });
          break;

        case "gameCanceled":
          this.gameState.state = GameStates.CANCELED;
          this._notifyListeners("onGameState", {
            state: "canceled",
            gameState: this.gameState,
            message: message.data.message,
          });
          break;

        case "playerLeft":
          this._notifyListeners("onPlayerLeft", {
            message: message.data.message,
            userId: message.data.userId,
          });
          break;

        case "playerAbandoned":
          this._notifyListeners("onPlayerAbandoned", {
            position: message.data.position,
            userId: message.data.userId,
          });
          break;

        case "reconnectionExpired":
          this.gameState = message.data.gameState;
          this._notifyListeners("onReconnectionExpired", {
            gameId: message.data.gameId,
            message: message.data.message,
            gameState: message.data.gameState,
          });
          break;

        case "joinedOfflineGame":
          this.gameState = message.data.gameState;
          this._notifyListeners("onJoinedOfflineGame", {
            gameId: message.data.gameId,
            userId: message.data.userId,
            gameState: message.data.gameState,
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

  private _notifyListeners<K extends keyof EventCallbacks>(event: K,data: Parameters<EventCallbacks[K][number]>[0]): void {
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
    this.isLocal = local;
  }

  cleanup(): void {
    if (this.socket) {
      try {
        this.pauseGame()
        this.socket.close(3001, "Client cleanup");
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
      tournamentId: 0,
    };
    this.gameConfig = null;
  }
}
