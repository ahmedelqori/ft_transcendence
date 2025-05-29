import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { GameControls } from "./GameControls/GameControls.js";
import { GameCanvas } from "./GameCanvas/GameCanvas.js";
import enhancedFetch from "@/Hooks/fetch.js";
import {
  SocketManager,
  GameState,
  GameConfig,
  GameStates,
  DisconnectData,
  ErrorData,
  GameStateData,
  PlayerJoinedData,
  GameStartData,
  GamePauseResumeData,
  GameFinishData,
  ReconnectData,
} from "@/services/socket-manager.js";
import { GamePausedOverlay } from "./GameOverlays/GamePausedOverlay.js";
import { VictoryOverlay } from "./GameOverlays/VictoryOverlay.js";
import { DisconnectedOverlay } from "./GameOverlays/DisconnectedOverlay.js";
import { GameOverLossOverlay } from "./GameOverlays/GameOverLossOverlay.js";
import { WaitingConfigurationOverlay } from "./GameOverlays/WaitingConfigurationOverlay.js";
import { WaitingOpponentOverlay } from "./GameOverlays/WaitingOpponentOverlay.js";
import { CountdownOverlay } from "./GameOverlays/CountdownOverlay.js";
import { LocalGameCompleteOverlay } from "./GameOverlays/LocalGameCompleteOverlay.js";

export enum OverlayType {
  NONE = 'none',
  WAITING_CONFIG = 'waitingConfig',
  WAITING_OPPONENT = 'waitingOpponent',
  COUNTDOWN = 'countdown',
  DISCONNECTED = 'disconnected',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  PAUSED = 'paused',
  LOCAL_GAME_COMPLETE = 'localGameComplete'
}

interface GameInterfaceProps {
  isLocal?: boolean;
}

interface GameInterfaceState {
  socketManager: SocketManager | null;
  gameState: GameState | null;
  gameConfig: GameConfig | null;
  playerPosition: string | null;
  isConnected: boolean;
  socketEventHandlers: Record<string, Function>;  
  currentOverlay: OverlayType;
  opponentDisconnected: boolean;
  readyToStart: boolean;
  countdownValue: number;
  countdownTimerId: number | null;
  players: any; // Store player data from readyToStart event
}

interface GameInterfaceMethods {
  setupSocketListeners(): void;
  removeSocketListeners(): void;
  connectToGame(): void;
  disconnectFromGame(): void;
  togglePauseResume(): void;
  cancelGame(): void;
  handleGoToDashboard(): void;
  handleReplayLocalGame(): void;
  startCountdown(seconds: number): void;
  setupOnlineGame(): Promise<void>;
  setupLocalGame(): Promise<void>;
  setupGame(gameId: string, isLocal: boolean): Promise<void>;
}


function extractNumericId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const matches = value.match(/\d+/);
  return matches ? matches[0] : undefined;
}

const GameInterface = defineComponent<GameInterfaceState, GameInterfaceProps>({
  state(): GameInterfaceState {
    return {
      socketManager: null,
      gameState: null,
      gameConfig: null,
      playerPosition: null,
      isConnected: false,
      socketEventHandlers: {},
      currentOverlay: OverlayType.NONE,
      opponentDisconnected: false,
      readyToStart: false,
      countdownValue: 5,
      countdownTimerId: null,
      players: null, // Initialize players state
    };
  },

  async onMounted(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Component mounted");
    if (this.props.isLocal)
      await this.setupLocalGame();
    else
      await this.setupOnlineGame();
  },

  async setupLocalGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Setting up local game");
    try {
      await this.setupGame(`local_${Date.now()}`, true);
    } catch (error) {
      console.error(`[GameInterface] Local game connection failed: ${error}`);
    }
  },

  async setupOnlineGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Setting up online game");
    const router = this.getAppContext?.router;
    const gameId = extractNumericId(router?.getParams?.gameId);
    if (!gameId) {
      console.error("[GameInterface] Missing game ID in URL");
      return;
    }
    try {
      await this.setupGame(gameId, false);
    } catch (err) {
      console.error("[GameInterface] Failed to get user info:", err);
    }
  },
  async setupGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    gameId: string,
    isLocal: boolean
  ): Promise<void> {
    try {
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`
      );
      const user = await response.json();      
      const socketManager = new SocketManager();
      socketManager.init(gameId, user);
      socketManager.setLocalGameMode(isLocal);
      if (this.getIsMounted)
        this.updateState({
          socketManager,
          currentOverlay: OverlayType.WAITING_CONFIG
        });
      this.setupSocketListeners();
      await socketManager.connect();
      // console.log(`[GameInterface] ${isLocal ? "Local" : "Online"} connection established`);      
      if (isLocal) {
        socketManager.startOfflineGame();
      }
    } catch (error) {
      console.error(`[GameInterface] ${isLocal ? "Local" : "Online"} connection failed: ${error}`);
      throw error;
    }
  },


  setupSocketListeners(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (!socketManager) {
      console.warn("[GameInterface] Cannot setup listeners: No socket manager");
      return;
    }

    // console.log("[GameInterface] Setting up socket listeners");
    const handlers: Record<string, Function> = {};
    
    handlers.onConnect = () => {
      // console.log("[GameInterface] Connected to server");
      if (this.getIsMounted)
        this.updateState({
          isConnected: true,
        });
    };

    handlers.onDisconnect = (data: DisconnectData) => {
      // console.log(
      //   `[GameInterface] Disconnected from server, code: ${data.code}, reason: ${data.reason}`
      // );
      if (this.getIsMounted)
        this.updateState({
          isConnected: false,
          // currentOverlay: OverlayType.NONE,
        });
    };

    handlers.onError = (data: ErrorData) => {
      console.error(`[GameInterface] Error: ${data.message}`, data.error);
    };

    handlers.onGameState = (data: GameStateData) => {
      // console.log(
      //   `[GameInterface] Game state update: ${data.state}`,
      //   data.gameState
      // );

      const isPaused = data.gameState?.state === GameStates.PAUSED;
      if (this.getIsMounted)
        this.updateState({
          gameState: data.gameState,
          currentOverlay: isPaused ? OverlayType.PAUSED : OverlayType.NONE,
        });

      if (data.state === "readyToStart") {
        // console.log(
        //   "[GameInterface] Game ready to start, initiating countdown"
        // );
        // Store the player data from gameRoom
        if ((data as any).gameRoom?.players) {
          if (this.getIsMounted)
            this.updateState({ players: (data as any).gameRoom.players });
        }
        this.startCountdown(5);
      }
    };

    handlers.onPlayerJoined = (data: PlayerJoinedData) => {
      const playersCount = Object.keys(data.players).length;

      if (data.position) {
        // console.log(
        //   `[GameInterface] Joined as ${data.position} player (${playersCount}/2 players)`
        // );
        if (this.getIsMounted)
          this.updateState({
            playerPosition: data.position,
            currentOverlay: playersCount < 2 ? OverlayType.WAITING_OPPONENT : OverlayType.NONE,
          });
      } else {
        // console.log(
        //   `[GameInterface] Another player joined (${playersCount}/2 players)`
        // );

        if (playersCount >= 2) {
          if (this.getIsMounted)
            this.updateState({
              currentOverlay: OverlayType.NONE,
              readyToStart: true,
              players: data.players, // Update players state
            });
        }
      }
    };

    handlers.onPlayerLeft = (data: { message: string; userId: string }) => {
      // console.log(`[GameInterface] Player left: ${data.message}`);
      if (this.getIsMounted)
        this.updateState({
          currentOverlay: OverlayType.WAITING_OPPONENT,
        });
    };

    handlers.onPlayerAbandoned = (data: { position: string; userId: string }) => {
      // console.log(`[GameInterface] Player abandoned game (position: ${data.position})`);
      if (this.getIsMounted)
        this.updateState({
          currentOverlay: OverlayType.VICTORY,
        });
    };

    handlers.onReconnectionExpired = (data: { gameId: string; message: string; gameState: GameState }) => {
      // console.log(`[GameInterface] Reconnection expired: ${data.message}`);
      if (this.getIsMounted)
        this.updateState({
          currentOverlay: OverlayType.DISCONNECTED,
        });
    };

    handlers.onJoinedOfflineGame = (data: { gameId: string; userId: string; gameState: GameState }) => {
      // console.log(`[GameInterface] Joined offline game: ${data.gameId}`);
      if (this.getIsMounted)
        this.updateState({
          gameState: data.gameState,
          currentOverlay: OverlayType.NONE,
        });
    };

    handlers.onInitGame = (data: { gameConfig: any; gameState: GameState; player?: any }) => {
      if (socketManager.isLocalGame() && data.player) {
        const localPlayers = {
          [data.player.id]: {
            id: data.player.id,
            position: "left",
            player: data.player
          },
          "friend": {
            position: "right",
            player: {
              id: "0",
              username: "Friend",
              avatar_url: "/assets/default.webp",
            }
          }
        };
        
        if (this.getIsMounted)
          this.updateState({
            gameState: data.gameState,
            players: localPlayers,
            playerPosition: "left",
            currentOverlay: OverlayType.NONE,
          });
      }
    };

    handlers.onGameStart = (data: GameStartData) => {
      // console.log("[GameInterface] Game started", data.gameState);

      if (this.state.countdownTimerId !== null) {
        clearInterval(this.state.countdownTimerId);
      }
      if (this.getIsMounted)
        this.updateState({
          gameState: data.gameState,
          currentOverlay: OverlayType.NONE,
          opponentDisconnected: false,
          countdownTimerId: null,
        });
    };

    handlers.onGamePause = (data: GamePauseResumeData) => {
      // console.log(`[GameInterface] Game paused: ${data.reason || "No reason"}`);
      
      if (data.reason === "playerDisconnected") {
        // console.log("[GameInterface] Opponent disconnected, showing disconnect overlay");
        if (this.getIsMounted)
          this.updateState({ 
            currentOverlay: OverlayType.DISCONNECTED,
            opponentDisconnected: true 
          });
      } else {
        if (this.getIsMounted)
          this.updateState({ currentOverlay: OverlayType.PAUSED });
      }
    };

    handlers.onGameResume = (data: GamePauseResumeData) => {
      // console.log(`[GameInterface] Game resumed: ${data.message}`);
      if (this.getIsMounted)
        this.updateState({ 
          currentOverlay: OverlayType.NONE,
          opponentDisconnected: false 
        });
    };

    handlers.onGameFinish = async (data: GameFinishData) => {
      const playerPosition = socketManager.getPlayerPosition();
      const userWon = data.gameState?.winner === playerPosition;      
      if (socketManager.isLocalGame()) {
        console.log("[GameInterface] Local game finished, showing completion overlay");
        
        if (this.getIsMounted)
          this.updateState({
            gameState: data.gameState,
            currentOverlay: OverlayType.LOCAL_GAME_COMPLETE,
          });
        return;
      }
      
      // For online games, show the victory/defeat overlay
      if (this.getIsMounted)
        this.updateState({
          gameState: data.gameState,
          currentOverlay: userWon ? OverlayType.VICTORY : OverlayType.DEFEAT,
        });
    };

    handlers.onReconnect = (data: ReconnectData) => {
      if (data.gameState) {
        const playerPosition = socketManager.getPlayerPosition();
        const isPaused = data.gameState.state === GameStates.PAUSED;
        if (this.getIsMounted)
          this.updateState({
            gameState: data.gameState,
            playerPosition: playerPosition,
            opponentDisconnected: false,
            currentOverlay: isPaused ? OverlayType.PAUSED : OverlayType.NONE,
          });
      } else {
        const isOpponentReconnect =
          data.position !== socketManager.getPlayerPosition();
        if (this.state.opponentDisconnected && isOpponentReconnect) {
          const isPaused = this.state.gameState?.state === GameStates.PAUSED;
          if (this.getIsMounted)
            this.updateState({
              opponentDisconnected: false,
              currentOverlay: isPaused ? OverlayType.PAUSED : OverlayType.NONE,
            });
        }
      }
    };
    handlers.onOpponentDisconnect = () => {
      if (this.getIsMounted)
        this.updateState({
          opponentDisconnected: true,
          currentOverlay: OverlayType.DISCONNECTED,
        });
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socketManager.addEventListener(
        event as keyof SocketManager["listeners"],
        handler as any
      );
    });
    if (this.getIsMounted)
      this.updateState({ socketEventHandlers: handlers });

    setTimeout(() => {
      const { gameState } = this.state;
      if (gameState?.state === GameStates.PAUSED) {
        console.log("[GameInterface] Initial state: Game is paused");
        if (this.getIsMounted)
          this.updateState({ currentOverlay: OverlayType.PAUSED });
      }
      if (socketManager.getGameConfig()) {
        if (this.state.currentOverlay === OverlayType.WAITING_CONFIG) {
          if (this.getIsMounted)
            this.updateState({ 
              currentOverlay: gameState?.state === GameStates.START 
                ? OverlayType.WAITING_OPPONENT 
                : OverlayType.NONE 
            });
        }
      }
    }, 500);
  },

  removeSocketListeners(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager, socketEventHandlers } = this.state;
    if (!socketManager) return;

    console.log("[GameInterface] Removing socket listeners");

    Object.entries(socketEventHandlers).forEach(([event, handler]) => {
      socketManager.removeEventListener(
        event as keyof SocketManager["listeners"],
        handler as any
      );
    });
  },

  async connectToGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (!socketManager) {
      console.error("[GameInterface] Cannot connect: No socket manager");
      return;
    }

    if (socketManager.getIsConnected()) {
      console.log("[GameInterface] Already connected");
      return;
    }

    console.log("[GameInterface] Connecting to game server");
    try {
      await socketManager.connect();
      console.log("[GameInterface] Connection successful");
    } catch (error) {
      console.error(`[GameInterface] Connection failed: ${error}`);
    }
  },

  disconnectFromGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (!socketManager || !socketManager.getIsConnected()) {
      return;
    }

    console.log("[GameInterface] Disconnecting from game server");
    socketManager.disconnect();
  },

  togglePauseResume(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager, gameState } = this.state;

    if (!socketManager || !socketManager.getIsConnected() || !gameState) {
      // console.warn(
      //   "[GameInterface] Cannot toggle pause/resume: Not connected or no game in progress"
      // );
      return;
    }

    if (gameState.state === GameStates.IN_PLAY) 
      socketManager.pauseGame();
    else if (gameState.state === GameStates.PAUSED)
      socketManager.resumeGame();
  },

  cancelGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;    
    
    // For local games, go directly to dashboard
    if (socketManager?.isLocalGame()) {
      console.log("[GameInterface] Local game canceled, redirecting to dashboard");
      this.handleGoToDashboard();
      return;
    }
    
    // For online games, show defeat overlay
    const cancelGameState: any = {
      ...socketManager?.getGameState(),
      score: { left: 0, right: 10 },
      winner: this.state.playerPosition === "left" ? "right" : "left",
      state: GameStates.FINISHED
    };
    
    if (this.getIsMounted)    
      this.updateState({
        currentOverlay: OverlayType.DEFEAT,
        gameState: cancelGameState,
      });
  
    if (socketManager && socketManager.getIsConnected()) {
      console.log("[GameInterface] Canceling game (intentional disconnect)");
      socketManager.disconnect();
    }
    
  },

  async handleGoToDashboard(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Go to dashboard requested");
    if (this.getIsMounted)    
      this.updateState({
        currentOverlay: OverlayType.NONE,
      });

    const router = this.getAppContext?.router;
    if (router) {
      await router.navigateTo("/dashboard");
    }
  },

  startCountdown(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    seconds: number
  ) {
    console.log(`[GameInterface] Starting countdown: ${seconds} seconds`);

    if (this.state.countdownTimerId !== null) {
      clearInterval(this.state.countdownTimerId);
    }
    if (this.getIsMounted)
      this.updateState({
        countdownValue: seconds,
        currentOverlay: OverlayType.COUNTDOWN,
      });

    const timerId = window.setInterval(() => {
      const { countdownValue } = this.state;

      if (countdownValue <= 1) {
        clearInterval(timerId);
        console.log("[GameInterface] Countdown finished");
        if (this.getIsMounted)
          this.updateState({
            countdownTimerId: null,
            currentOverlay: OverlayType.NONE,
          });
      } else {
        if (this.getIsMounted)
          this.updateState({ countdownValue: countdownValue - 1 });
      }
    }, 1000);
    if (this.getIsMounted)
      this.updateState({ countdownTimerId: timerId });
  },

  async handleReplayLocalGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Replaying local game");
    
    // Reset the game state and start a new local game
    if (this.getIsMounted) {
      this.updateState({
        currentOverlay: OverlayType.WAITING_CONFIG,
        gameState: null,
        countdownValue: 5,
        readyToStart: false,
      });
    }

    // Clean up current socket manager
    const { socketManager } = this.state;
    if (socketManager) {
      this.removeSocketListeners();
      socketManager.cleanup();
    }

    // Start a new local game
    await this.setupLocalGame();
  },

  render(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const {
      socketManager,
      gameState,
      isConnected,
      currentOverlay,
      countdownValue,
      playerPosition,
    } = this.state;

    const gameConfig = socketManager?.getGameConfig();

    const score = {
          player: gameState?.score[playerPosition === "left" ? "left" : "right"] || 0,
          opponent: gameState?.score[playerPosition === "left" ? "right" : "left"] || 0,
        }
    const overlays = [
      {
        component: WaitingConfigurationOverlay,
        visible: currentOverlay === OverlayType.WAITING_CONFIG,
        props: {}
      },
      {
        component: WaitingOpponentOverlay,
        visible: currentOverlay === OverlayType.WAITING_OPPONENT,
        props: { position: playerPosition || undefined }
      },
      {
        component: CountdownOverlay,
        visible: currentOverlay === OverlayType.COUNTDOWN,
        props: { countdown: countdownValue }
      },
      {
        component: DisconnectedOverlay,
        visible: currentOverlay === OverlayType.DISCONNECTED,
        props: {}
      },
      {
        component: VictoryOverlay,
        visible: currentOverlay === OverlayType.VICTORY,
        props: { 
          score: score,
          gameState: gameState,
          onGoToDashboard: this.handleGoToDashboard.bind(this)
        }
      },
      {
        component: GameOverLossOverlay,
        visible: currentOverlay === OverlayType.DEFEAT,
        props: { 
          score: score,
          gameState: gameState,
          onGoToDashboard: this.handleGoToDashboard.bind(this)
        }
      },
      {
        component: GamePausedOverlay,
        visible: currentOverlay === OverlayType.PAUSED,
        props: { onResume: () => this.togglePauseResume() }
      },
      {
        component: LocalGameCompleteOverlay,
        visible: currentOverlay === OverlayType.LOCAL_GAME_COMPLETE,
        props: { 
          score: score,
          winner: gameState?.winner === "left" ? "player" : "friend",
          playerName: this.state.players?.[Object.keys(this.state.players)[0]]?.player?.username,
          onReplay: this.handleReplayLocalGame.bind(this),
          onGoToDashboard: this.handleGoToDashboard.bind(this)
        }
      }
    ];

    const gameCanvasWithOverlays = createElement(
      "div",
      {
        style: {
          position: "relative",
          width: "100%",
          flexGrow: "1",
        },
      },
      [
        ...overlays.map(overlay => 
          createElement(overlay.component, {
            visible: overlay.visible,
            ...overlay.props
          })
        ),
        
        createElement(GameCanvas, {
          gameState,
          gameConfig: gameConfig,
          socketManager: socketManager,
          players: this.state.players,
          playerPosition: playerPosition,
        }),
      ]
    );

    return createElement(
      "section",
      {
        class: [
          "flex",
          "flex-col",
          "gap-2",
          "w-full",
          "border-2",
          "py-3",
          "px-4",
          "max-lg:py-2",
          "h-[85vh]",
          "max-lg:h-full",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "overflow-hidden",
        ],
        style: {
          position: "relative",
        },
      },
      [
        createElement(GameControls, {
          isConnected,
          gameState: gameState || ({} as GameState),
          onPause: () => this.togglePauseResume(),
          onCancel: () => this.cancelGame(),
        }),
        gameCanvasWithOverlays,        
      ]
    );
  },
  onUnmounted(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Component unmounting");
    const { socketManager, countdownTimerId } = this.state;
    if (socketManager) {
      console.log("[GameInterface] Cleaning up socket manager");
      socketManager.cleanup();
    } else {
      this.removeSocketListeners();
    }

    if (countdownTimerId !== null) {
      console.log("[GameInterface] Clearing countdown timer");
      clearInterval(countdownTimerId);
    }
  },
});

export default GameInterface;
