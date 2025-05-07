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

// Component Props and State interfaces
interface GameInterfaceProps {
  localSocketManager?: SocketManager;
}

interface GameInterfaceState {
  socketManager: SocketManager | null;
  gameState: GameState | null;
  gameConfig: GameConfig | null;
  playerPosition: string | null;
  isConnected: boolean;
  socketEventHandlers: Record<string, Function>;
  beforeUnloadHandler: ((ev: BeforeUnloadEvent) => void) | null;

  // Overlay visibility states
  showPausedOverlay: boolean;
  showVictoryOverlay: boolean;
  showDefeatOverlay: boolean;
  showDisconnectedOverlay: boolean;
  showWaitingConfigOverlay: boolean;
  showWaitingOpponentOverlay: boolean;
  showCountdownOverlay: boolean;

  // Game state flags
  opponentDisconnected: boolean;
  readyToStart: boolean;

  // Countdown state
  countdownValue: number;
  countdownTimerId: number | null;
}

interface GameInterfaceMethods {
  setupSocketListeners(): void;
  removeSocketListeners(): void;
  connectToGame(): void;
  disconnectFromGame(): void;
  togglePauseResume(): void;
  cancelGame(): void;
  handlePlayAgain(): void;
  startCountdown(seconds: number): void;
  setupOnlineGame(providedGameId?: string): Promise<void>;
  setupLocalGame(socketManager: SocketManager): void;
}

/**
 * Extract numeric ID from a string (like a URL parameter)
 */
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
      beforeUnloadHandler: null,

      // Overlay visibility states
      showPausedOverlay: false,
      showVictoryOverlay: false,
      showDefeatOverlay: false,
      showDisconnectedOverlay: false,
      showWaitingConfigOverlay: false,
      showWaitingOpponentOverlay: false,
      showCountdownOverlay: false,

      // Game state flags
      opponentDisconnected: false,
      readyToStart: false,

      // Countdown state
      countdownValue: 5,
      countdownTimerId: null,
    };
  },

  /**
   * Lifecycle: Component mounted
   * Initialize connection based on whether it's a local or online game
   */
  async onMounted(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Component mounted");

    if (this.props.localSocketManager) {
      this.setupLocalGame(this.props.localSocketManager);
    } else {
      // Set up a new online game (no reconnection)
      await this.setupOnlineGame();
    }
  },

  /**
   * Set up a local game with provided socket manager
   */
  setupLocalGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    socketManager: SocketManager
  ) {
    console.log("[GameInterface] Setting up local game");

    const handleBeforeUnload = () => {
      if (socketManager.getIsConnected()) {
        socketManager.disconnect();
      }
    };

    this.updateState({
      socketManager,
      beforeUnloadHandler: handleBeforeUnload,
    });

    window.addEventListener("beforeunload", handleBeforeUnload);
    this.setupSocketListeners();

    // Start the local game connection and initialize
    socketManager
      .connect()
      .then(() => {
        console.log(
          "[GameInterface] Local connection established, starting game"
        );
        socketManager.startOfflineGame();
      })
      .catch((error) => {
        console.error(
          `[GameInterface] Local game connection failed: ${error.message}`
        );
      });
  },

  /**
   * Set up an online game with connection to the server
   */
  async setupOnlineGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    providedGameId?: string
  ) {
    console.log("[GameInterface] Setting up online game");

    const router = this.getAppContext?.router;
    const gameIdFromUrl = extractNumericId(router?.getParams?.gameId);
    const gameId = providedGameId || gameIdFromUrl;

    if (!gameId) {
      console.error("[GameInterface] Missing game ID in URL");
      return;
    }

    // Get user authentication details
    let userId;
    try {
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      const user = await response.json();
      userId = user.id;
      console.log(`[GameInterface] User authenticated: ${userId}`);
    } catch (err) {
      console.error("[GameInterface] Failed to get user info:", err);
      return;
    }

    if (!userId) {
      console.error("[GameInterface] Missing user ID");
      return;
    }

    // Initialize socket manager for online game
    const socketManager = new SocketManager();
    socketManager.init(gameId, userId);

    const handleBeforeUnload = () => {
      if (socketManager.getIsConnected()) {
        // Simple disconnect, no state saving
        socketManager.disconnect();
      }
    };

    this.updateState({
      socketManager,
      beforeUnloadHandler: handleBeforeUnload,
      showWaitingConfigOverlay: true,
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also handle navigation within the app
    window.addEventListener("popstate", handleBeforeUnload);

    this.setupSocketListeners();
    this.connectToGame();
  },

  /**
   * Lifecycle: Component unmounted
   * Clean up resources and event listeners
   */
  onUnmounted(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Component unmounting");
    const { socketManager, beforeUnloadHandler, countdownTimerId } = this.state;

    if (socketManager?.getIsConnected()) {
      console.log("[GameInterface] Disconnecting socket on unmount");
      socketManager.disconnect();
    }

    this.removeSocketListeners();

    if (beforeUnloadHandler) {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("popstate", beforeUnloadHandler);
    }

    if (countdownTimerId !== null) {
      clearInterval(countdownTimerId);
    }
  },

  /**
   * Set up all socket event listeners
   */
  setupSocketListeners(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (!socketManager) {
      console.warn("[GameInterface] Cannot setup listeners: No socket manager");
      return;
    }

    console.log("[GameInterface] Setting up socket listeners");
    const handlers: Record<string, Function> = {};

    // Connection event handlers
    handlers.onConnect = () => {
      console.log("[GameInterface] Connected to server");
      this.updateState({
        isConnected: true,
        showDisconnectedOverlay: false,
      });
    };

    handlers.onDisconnect = (data: DisconnectData) => {
      console.log(
        `[GameInterface] Disconnected from server, code: ${data.code}, reason: ${data.reason}`
      );
      this.updateState({
        isConnected: false,
        showDisconnectedOverlay: this.state.isConnected,
        showPausedOverlay: false,
      });
    };

    handlers.onError = (data: ErrorData) => {
      console.error(`[GameInterface] Error: ${data.message}`, data.error);
    };

    // Game state event handlers
    handlers.onGameState = (data: GameStateData) => {
      console.log(
        `[GameInterface] Game state update: ${data.state}`,
        data.gameState
      );

      const isPaused = data.gameState?.state === GameStates.PAUSED;
      this.updateState({
        gameState: data.gameState,
        showPausedOverlay: isPaused,
        showWaitingConfigOverlay: false,
      });

      if (data.state === "readyToStart") {
        console.log("[GameInterface] Game ready to start, initiating countdown");
        this.startCountdown(5);
      }
    };

    // Player events
    handlers.onPlayerJoined = (data: PlayerJoinedData) => {
      const playersCount = Object.keys(data.players).length;

      if (data.position) {
        // Current player joined
        console.log(
          `[GameInterface] Joined as ${data.position} player (${playersCount}/2 players)`
        );
        this.updateState({
          playerPosition: data.position,
          showWaitingConfigOverlay: false,
          showWaitingOpponentOverlay: playersCount < 2,
        });
      } else {
        // Other player joined
        console.log(
          `[GameInterface] Another player joined (${playersCount}/2 players)`
        );

        if (playersCount >= 2) {
          this.updateState({
            showWaitingOpponentOverlay: false,
            readyToStart: true,
          });
        }
      }
    };

    // Game lifecycle event handlers
    handlers.onGameStart = (data: GameStartData) => {
      console.log("[GameInterface] Game started", data.gameState);

      if (this.state.countdownTimerId !== null) {
        clearInterval(this.state.countdownTimerId);
      }

      this.updateState({
        gameState: data.gameState,
        showPausedOverlay: false,
        showVictoryOverlay: false,
        showDefeatOverlay: false,
        opponentDisconnected: false,
        showWaitingConfigOverlay: false,
        showWaitingOpponentOverlay: false,
        showCountdownOverlay: false,
        countdownTimerId: null,
      });
    };

    handlers.onGamePause = (data: GamePauseResumeData) => {
      console.log(`[GameInterface] Game paused: ${data.reason || "No reason"}`);
      this.updateState({ showPausedOverlay: true });
    };

    handlers.onGameResume = (data: GamePauseResumeData) => {
      console.log(`[GameInterface] Game resumed: ${data.message}`);
      this.updateState({ showPausedOverlay: false });
    };

    handlers.onGameFinish = (data: GameFinishData) => {
      const gameState = socketManager.getGameState();
      const playerPosition = socketManager.getPlayerPosition();
      const userWon = gameState?.winner === playerPosition;

      console.log(`[GameInterface] Game finished. Winner: ${gameState?.winner}`, {
        userPosition: playerPosition,
        didWin: userWon,
      });

      this.updateState({
        gameState: data.gameState,
        showVictoryOverlay: userWon,
        showDefeatOverlay: !userWon,
      });
    };

    // Connection event handlers
    handlers.onReconnect = (data: ReconnectData) => {
      if (data.gameState) {
        // Full reconnection with game state
        const playerPosition = socketManager.getPlayerPosition();
        const isPaused = data.gameState.state === GameStates.PAUSED;

        console.log(`[GameInterface] Fully reconnected as ${playerPosition} player`);
        this.updateState({
          gameState: data.gameState,
          playerPosition: playerPosition,
          opponentDisconnected: false,
          showDisconnectedOverlay: false,
          showPausedOverlay: isPaused,
        });
      } else {
        // Player reconnect notification
        console.log(`[GameInterface] Player reconnected (position: ${data.position})`);

        const isOpponentReconnect =
          data.position !== socketManager.getPlayerPosition();
        if (this.state.opponentDisconnected && isOpponentReconnect) {
          console.log(
            "[GameInterface] Opponent reconnected, hiding disconnect overlay"
          );
          this.updateState({
            opponentDisconnected: false,
            showDisconnectedOverlay: false,
            showPausedOverlay:
              this.state.gameState?.state === GameStates.PAUSED,
          });
        }
      }
    };

    handlers.onOpponentDisconnect = () => {
      console.log(
        "[GameInterface] Opponent disconnected, showing disconnect overlay"
      );
      this.updateState({
        opponentDisconnected: true,
        showDisconnectedOverlay: true,
        showPausedOverlay: false,
      });
    };

    // Register all event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socketManager.addEventListener(
        event as keyof SocketManager["listeners"],
        handler as any
      );
    });

    this.updateState({ socketEventHandlers: handlers });

    // Check initial game state after a delay to ensure we have the latest data
    setTimeout(() => {
      const { gameState } = this.state;

      // Set initial overlays based on game state
      if (gameState?.state === GameStates.PAUSED) {
        console.log("[GameInterface] Initial state: Game is paused");
        this.updateState({ showPausedOverlay: true });
      }

      if (socketManager.getGameConfig()) {
        this.updateState({ showWaitingConfigOverlay: false });

        if (gameState?.state === GameStates.START) {
          console.log("[GameInterface] Initial state: Waiting for opponent");
          this.updateState({ showWaitingOpponentOverlay: true });
        }
      }
    }, 500);
  },

  /**
   * Remove all socket event listeners
   */
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
    
    // Don't update state during unmounting - this causes the "Component is not mounted" error
    // this.updateState({ socketEventHandlers: {} });
  },

  /**
   * Connect to the game server
   */
  connectToGame(
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
    socketManager
      .connect()
      .then(() => {
        console.log("[GameInterface] Connection successful");
      })
      .catch((error) => {
        console.error(`[GameInterface] Connection failed: ${error.message}`);
      });
  },

  /**
   * Disconnect from the game server
   */
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

  /**
   * Toggle game pause/resume state
   */
  togglePauseResume(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager, gameState } = this.state;

    if (!socketManager || !socketManager.getIsConnected() || !gameState) {
      console.warn(
        "[GameInterface] Cannot toggle pause/resume: Not connected or no game in progress"
      );
      return;
    }

    if (gameState.state === GameStates.IN_PLAY) {
      console.log("[GameInterface] Pausing game");
      socketManager.pauseGame();
    } else if (gameState.state === GameStates.PAUSED) {
      console.log("[GameInterface] Resuming game");
      socketManager.resumeGame();
    } else {
      console.warn(
        `[GameInterface] Cannot pause/resume game in state: ${gameState.state}`
      );
    }
  },

  /**
   * Cancel the current game
   */
  cancelGame(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (socketManager && socketManager.getIsConnected()) {
      console.log("[GameInterface] Canceling game");
      this.disconnectFromGame();
    }
  },

  /**
   * Handle play again action after game over
   */
  handlePlayAgain(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Play again requested");

    this.updateState({
      showVictoryOverlay: false,
      showDefeatOverlay: false,
    });

    const { socketManager } = this.state;
    if (socketManager && !socketManager.getIsConnected()) {
      console.log("[GameInterface] Reconnecting for a new game");
      this.connectToGame();
    }
  },

  /**
   * Start countdown timer before game start
   */
  startCountdown(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    seconds: number
  ) {
    console.log(`[GameInterface] Starting countdown: ${seconds} seconds`);

    // Clear any existing countdown
    if (this.state.countdownTimerId !== null) {
      clearInterval(this.state.countdownTimerId);
    }

    this.updateState({
      countdownValue: seconds,
      showCountdownOverlay: true,
      showWaitingOpponentOverlay: false,
    });

    // Start countdown timer
    const timerId = window.setInterval(() => {
      const { countdownValue } = this.state;

      if (countdownValue <= 1) {
        clearInterval(timerId);
        console.log("[GameInterface] Countdown finished");
        this.updateState({
          countdownTimerId: null,
          showCountdownOverlay: false,
        });
      } else {
        this.updateState({ countdownValue: countdownValue - 1 });
      }
    }, 1000);

    this.updateState({ countdownTimerId: timerId });
  },

  /**
   * Render the game interface
   */
  render(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    const {
      socketManager,
      gameState,
      isConnected,
      showPausedOverlay,
      showVictoryOverlay,
      showDefeatOverlay,
      showDisconnectedOverlay,
      showWaitingConfigOverlay,
      showWaitingOpponentOverlay,
      readyToStart,
      showCountdownOverlay,
      countdownValue,
      playerPosition,
    } = this.state;

    console.log("[GameInterface] Render with state:", {
      isConnected,
      playerPosition,
      gameState: gameState ? `[state=${gameState.state}]` : "null",
    });

    const gameConfig = socketManager?.getGameConfig();

    // Calculate player and opponent scores based on position
    const score = gameState?.score
      ? {
          player:
            gameState.score[playerPosition === "left" ? "left" : "right"] || 0,
          opponent:
            gameState.score[playerPosition === "left" ? "right" : "left"] || 0,
        }
      : { player: 0, opponent: 0 };

    // Create the game canvas with all overlays
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
        // Waiting for configuration overlay
        createElement(WaitingConfigurationOverlay, {
          visible: showWaitingConfigOverlay,
        }),

        // Waiting for opponent overlay
        createElement(WaitingOpponentOverlay, {
          visible: showWaitingOpponentOverlay && !showWaitingConfigOverlay,
          position: playerPosition || undefined,
        }),

        // Countdown overlay
        createElement(CountdownOverlay, {
          visible: showCountdownOverlay,
          countdown: countdownValue,
        }),

        // Disconnected overlay
        createElement(DisconnectedOverlay, {
          visible:
            showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay &&
            !showCountdownOverlay,
        }),

        // Victory overlay
        createElement(VictoryOverlay, {
          visible:
            showVictoryOverlay &&
            !showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay,
          score: score,
          onPlayAgain: this.handlePlayAgain.bind(this),
        }),

        // Defeat overlay
        createElement(GameOverLossOverlay, {
          visible:
            showDefeatOverlay &&
            !showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay,
          score: score,
        }),

        // Paused overlay
        createElement(GamePausedOverlay, {
          visible:
            showPausedOverlay &&
            !showDisconnectedOverlay &&
            !showVictoryOverlay &&
            !showDefeatOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay &&
            !showCountdownOverlay,
          onResume: () => this.togglePauseResume(),
        }),

        // The actual game canvas
        createElement(GameCanvas, {
          gameState,
          gameConfig: gameConfig,
          socketManager: socketManager,
        }),
      ]
    );

    // Return the complete game interface
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
        // Game controls (pause, cancel buttons)
        createElement(GameControls, {
          isConnected,
          gameState: gameState || ({} as GameState),
          onPause: () => this.togglePauseResume(),
          onCancel: () => this.cancelGame(),
        }),

        // Game canvas with overlays
        gameCanvasWithOverlays,
      ]
    );
  },
});

export default GameInterface;
