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

interface GameInterfaceProps {
  localSocketManager?: SocketManager;
  user: any;
  friendName?: string;
}

interface GameInterfaceState {
  socketManager: SocketManager | null;
  gameState: GameState | null;
  gameConfig: GameConfig | null;
  playerPosition: string | null;
  isConnected: boolean;
  socketEventHandlers: Record<string, Function>;
  beforeUnloadHandler: ((ev: BeforeUnloadEvent) => void) | null;

  showPausedOverlay: boolean;
  showVictoryOverlay: boolean;
  showDefeatOverlay: boolean;
  showDisconnectedOverlay: boolean;
  showWaitingConfigOverlay: boolean;
  showWaitingOpponentOverlay: boolean;
  showCountdownOverlay: boolean;

  opponentDisconnected: boolean;
  readyToStart: boolean;

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

      showPausedOverlay: false,
      showVictoryOverlay: false,
      showDefeatOverlay: false,
      showDisconnectedOverlay: false,
      showWaitingConfigOverlay: false,
      showWaitingOpponentOverlay: false,
      showCountdownOverlay: false,

      opponentDisconnected: false,
      readyToStart: false,

      countdownValue: 5,
      countdownTimerId: null,
    };
  },

  async onMounted(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods
  ) {
    console.log("[GameInterface] Component mounted");

    if (this.props.localSocketManager) {
      this.setupLocalGame(this.props.localSocketManager);
    } else {
      await this.setupOnlineGame();
    }
  },

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

    let userId;
    try {
      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/account/whoami/"
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

    const socketManager = new SocketManager();
    socketManager.init(gameId, userId);

    const handleBeforeUnload = () => {
      if (socketManager.getIsConnected()) {
        socketManager.disconnect();
      }
    };

    this.updateState({
      socketManager,
      beforeUnloadHandler: handleBeforeUnload,
      showWaitingConfigOverlay: true,
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    window.addEventListener("popstate", handleBeforeUnload);

    this.setupSocketListeners();
    this.connectToGame();
  },

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
        console.log(
          "[GameInterface] Game ready to start, initiating countdown"
        );
        this.startCountdown(5);
      }
    };

    handlers.onPlayerJoined = (data: PlayerJoinedData) => {
      const playersCount = Object.keys(data.players).length;

      if (data.position) {
        console.log(
          `[GameInterface] Joined as ${data.position} player (${playersCount}/2 players)`
        );
        this.updateState({
          playerPosition: data.position,
          showWaitingConfigOverlay: false,
          showWaitingOpponentOverlay: playersCount < 2,
        });
      } else {
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

      console.log(
        `[GameInterface] Game finished. Winner: ${gameState?.winner}`,
        {
          userPosition: playerPosition,
          didWin: userWon,
        }
      );

      this.updateState({
        gameState: data.gameState,
        showVictoryOverlay: userWon,
        showDefeatOverlay: !userWon,
      });
    };

    handlers.onReconnect = (data: ReconnectData) => {
      if (data.gameState) {
        const playerPosition = socketManager.getPlayerPosition();
        const isPaused = data.gameState.state === GameStates.PAUSED;

        console.log(
          `[GameInterface] Fully reconnected as ${playerPosition} player`
        );
        this.updateState({
          gameState: data.gameState,
          playerPosition: playerPosition,
          opponentDisconnected: false,
          showDisconnectedOverlay: false,
          showPausedOverlay: isPaused,
        });
      } else {
        console.log(
          `[GameInterface] Player reconnected (position: ${data.position})`
        );

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

    Object.entries(handlers).forEach(([event, handler]) => {
      socketManager.addEventListener(
        event as keyof SocketManager["listeners"],
        handler as any
      );
    });

    this.updateState({ socketEventHandlers: handlers });

    setTimeout(() => {
      const { gameState } = this.state;

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

  startCountdown(
    this: IComponent<GameInterfaceState, GameInterfaceProps> &
      GameInterfaceMethods,
    seconds: number
  ) {
    console.log(`[GameInterface] Starting countdown: ${seconds} seconds`);

    if (this.state.countdownTimerId !== null) {
      clearInterval(this.state.countdownTimerId);
    }

    this.updateState({
      countdownValue: seconds,
      showCountdownOverlay: true,
      showWaitingOpponentOverlay: false,
    });

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

    const score = gameState?.score
      ? {
          player:
            gameState.score[playerPosition === "left" ? "left" : "right"] || 0,
          opponent:
            gameState.score[playerPosition === "left" ? "right" : "left"] || 0,
        }
      : { player: 0, opponent: 0 };

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

        createElement(WaitingConfigurationOverlay, {
          visible: showWaitingConfigOverlay,
        }),

        createElement(WaitingOpponentOverlay, {
          visible: showWaitingOpponentOverlay && !showWaitingConfigOverlay,
          position: playerPosition || undefined,
        }),

        createElement(CountdownOverlay, {
          visible: showCountdownOverlay,
          countdown: countdownValue,
        }),

        createElement(DisconnectedOverlay, {
          visible:
            showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay &&
            !showCountdownOverlay,
        }),

        createElement(VictoryOverlay, {
          visible:
            showVictoryOverlay &&
            !showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay,
          score: score,
          onPlayAgain: this.handlePlayAgain.bind(this),
        }),

        createElement(GameOverLossOverlay, {
          visible:
            showDefeatOverlay &&
            !showDisconnectedOverlay &&
            !showWaitingConfigOverlay &&
            !showWaitingOpponentOverlay,
          score: score,
        }),

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
        createElement(GameCanvas, {
          gameState,
          gameConfig: gameConfig,
          socketManager: socketManager,
          user: this.props.user,
          friendName: this.props.friendName,
        }),
      ]
    );

    return createElement(
      "section",
      {
        class: [
          "flex",
          "flex-col",
          "gap-0",
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
          gameState: gameState,
          onPause: () => this.togglePauseResume(),
          onCancel: () => this.cancelGame(),
        }),
        gameCanvasWithOverlays,
      ]
    );
  },
});

export default GameInterface;
