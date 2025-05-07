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
  opponentDisconnected: boolean;
  showWaitingConfigOverlay: boolean;
  showWaitingOpponentOverlay: boolean;
  ReadyToStart: boolean;
  countdownValue: number;
  showCountdownOverlay: boolean;
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
}

function extractNumericId(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const matches = value.match(/\d+/);
  return matches ? matches[0] : undefined;
}

const GameInterface = defineComponent<GameInterfaceState>({
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
      ReadyToStart: false,
      showDisconnectedOverlay: false,
      opponentDisconnected: false,
      showWaitingConfigOverlay: false,
      showWaitingOpponentOverlay: false,
      countdownValue: 5,
      showCountdownOverlay: false,
      countdownTimerId: null,
    };
  },

  async onMounted(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
    console.log("[GameInterface] Component mounted");

    const router = this.getAppContext?.router;
    const gameId = extractNumericId(router?.getParams?.gameId);
    let userId;
    try {
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      const user = await response.json();
      userId = user.id;
    } catch (err) {
      console.log(err);
    }

    if (!gameId || !userId) {
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
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    this.setupSocketListeners();
    this.connectToGame();

    this.updateState({ showWaitingConfigOverlay: true });
  },

  onUnmounted(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
    if (this.state.socketManager?.getIsConnected()) {
      this.state.socketManager.disconnect();
    }

    this.removeSocketListeners();

    if (this.state.beforeUnloadHandler) {
      window.removeEventListener(
        "beforeunload",
        this.state.beforeUnloadHandler
      );
    }

    if (this.state.countdownTimerId !== null) {
      clearInterval(this.state.countdownTimerId);
    }
  },

  setupSocketListeners(
    this: IComponent<GameInterfaceState> & GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (!socketManager) return;

    const handlers: Record<string, Function> = {};

    handlers.onConnect = () => {
      console.log("[GameInterface] Connected to server");
      this.updateState({
        isConnected: true,
        showDisconnectedOverlay: false,
      });
    };

    handlers.onDisconnect = (data: DisconnectData) => {
      console.log("[GameInterface] Disconnected from server");
      this.updateState({
        isConnected: false,
        showDisconnectedOverlay: this.state.isConnected,
        showPausedOverlay: false,
      });
    };

    handlers.onError = (data: ErrorData) => {
      console.error(`[GameInterface] Error: ${data.message}`);
    };

    handlers.onGameState = (data: GameStateData) => {
      console.log("[GameInterface] Game state update:", data.state);

      const isPaused = data.gameState?.state === GameStates.PAUSED;
      this.updateState({
        gameState: data.gameState,
        showPausedOverlay: isPaused,
        showWaitingConfigOverlay: false,
      });

      console.log("[GameInterface] Is game paused?", isPaused);

      if (data.state === "readyToStart") {
        console.log(
          "[GameInterface] Ready to start received from server, starting countdown for all players"
        );
        this.startCountdown(5);
      }
    };

    handlers.onPlayerJoined = (data: PlayerJoinedData) => {
      if (data.position) {
        const playersCount = Object.keys(data.players).length;

        this.updateState({
          playerPosition: data.position,
          showWaitingConfigOverlay: false,
          showWaitingOpponentOverlay: playersCount < 2,
        });

        console.log(
          `[GameInterface] Joined as ${data.position} player. ${playersCount}/2 players connected.`
        );
      } else {
        const playersCount = Object.keys(data.players).length;

        if (playersCount >= 2) {
          this.updateState({
            showWaitingOpponentOverlay: false,
            ReadyToStart: true,
          });
        }

        console.log(
          `[GameInterface] Player joined. ${playersCount}/2 players connected.`
        );
      }
    };

    handlers.onGameStart = (data: GameStartData) => {
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
      console.log("[GameInterface] Game started!");
    };

    handlers.onGamePause = (data: GamePauseResumeData) => {
      console.log("[GameInterface] Game paused");
      this.updateState({ showPausedOverlay: true });
    };

    handlers.onGameResume = (data: GamePauseResumeData) => {
      console.log("[GameInterface] Game resumed");
      this.updateState({ showPausedOverlay: false });
    };

    handlers.onGameFinish = (data: GameFinishData) => {
      const gameState = socketManager.getGameState();
      const playerPosition = socketManager.getPlayerPosition();
      const userWon = gameState?.winner === playerPosition;

      console.log("[GameInterface] Game finished", {
        userWon,
        winner: gameState?.winner,
        playerPosition,
      });

      this.updateState({
        gameState: data.gameState,
        showVictoryOverlay: userWon,
        showDefeatOverlay: !userWon,
      });

      console.log("[GameInterface] Victory overlay:", userWon);
      console.log("[GameInterface] Defeat overlay:", !userWon);
    };

    handlers.onReconnect = (data: ReconnectData) => {
      if (data.gameState) {
        const playerPosition = socketManager.getPlayerPosition();
        const isPaused = data.gameState.state === GameStates.PAUSED;

        this.updateState({
          gameState: data.gameState,
          playerPosition: playerPosition,
          opponentDisconnected: false,
          showDisconnectedOverlay: false,
          showPausedOverlay: isPaused,
        });

        console.log(
          `[GameInterface] Reconnected to game as ${playerPosition} player`
        );
      } else {
        console.log(
          `[GameInterface] Player reconnected (position: ${data.position})`
        );

        if (
          this.state.opponentDisconnected &&
          data.position !== socketManager.getPlayerPosition()
        ) {
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
      console.log("[GameInterface] Opponent disconnected");
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
      if (this.state.gameState?.state === GameStates.PAUSED) {
        this.updateState({ showPausedOverlay: true });
      }

      if (socketManager.getGameConfig()) {
        this.updateState({ showWaitingConfigOverlay: false });

        const gameState = socketManager.getGameState();
        const state = gameState?.state;
        if (state == GameStates.START) {
          this.updateState({ showWaitingOpponentOverlay: true });
        }
      }
    }, 500);
  },

  removeSocketListeners(
    this: IComponent<GameInterfaceState> & GameInterfaceMethods
  ) {
    const { socketManager, socketEventHandlers } = this.state;
    if (!socketManager) return;

    Object.entries(socketEventHandlers).forEach(([event, handler]) => {
      socketManager.removeEventListener(
        event as keyof SocketManager["listeners"],
        handler as any
      );
    });

    this.updateState({ socketEventHandlers: {} });
  },

  connectToGame(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
    const { socketManager } = this.state;
    if (!socketManager || socketManager.getIsConnected()) {
      console.log("[GameInterface] Already connected or connecting");
      return;
    }

    console.log("[GameInterface] Connecting...");

    socketManager
      .connect()
      .then(() => {
        console.log("WebSocket connection successful");
      })
      .catch((error) => {
        console.error(`[GameInterface] Connection failed: ${error.message}`);
      });
  },

  disconnectFromGame(
    this: IComponent<GameInterfaceState> & GameInterfaceMethods
  ) {
    const { socketManager } = this.state;
    if (socketManager && socketManager.getIsConnected()) {
      console.log("[GameInterface] Disconnecting...");
      socketManager.disconnect();
    }
  },

  togglePauseResume(
    this: IComponent<GameInterfaceState> & GameInterfaceMethods
  ) {
    const { socketManager, gameState } = this.state;

    if (!socketManager || !socketManager.getIsConnected() || !gameState) {
      console.log(
        "[GameInterface] Cannot pause/resume: Not connected or no game in progress"
      );
      return;
    }

    if (gameState.state === GameStates.IN_PLAY) {
      socketManager.pauseGame();
      console.log("[GameInterface] Requesting game pause...");
    } else if (gameState.state === GameStates.PAUSED) {
      socketManager.resumeGame();
      console.log("[GameInterface] Requesting game resume...");
    } else {
      console.log(`[GameInterface] Cannot pause/resume game in current state`);
    }
  },

  cancelGame(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
    const { socketManager } = this.state;
    if (socketManager && socketManager.getIsConnected()) {
      this.disconnectFromGame();
      console.log("[GameInterface] Game canceled");
    }
  },

  handlePlayAgain(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
    this.updateState({
      showVictoryOverlay: false,
      showDefeatOverlay: false,
    });

    const { socketManager } = this.state;
    if (socketManager) {
      if (!socketManager.getIsConnected()) {
        this.connectToGame();
      }
    }
  },

  startCountdown(
    this: IComponent<GameInterfaceState> & GameInterfaceMethods,
    seconds: number
  ) {
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
        this.updateState({
          countdownTimerId: null,
          showCountdownOverlay: false,
        });
        console.log("[GameInterface] Countdown finished, hiding overlay");
      } else {
        this.updateState({ countdownValue: countdownValue - 1 });
      }
    }, 1000);

    this.updateState({ countdownTimerId: timerId });
  },

  render(this: IComponent<GameInterfaceState> & GameInterfaceMethods) {
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
      ReadyToStart,
      showCountdownOverlay,
      countdownValue,
      playerPosition,
    } = this.state;

    console.log("[GameInterface] Rendering with overlay states:", {
      showPausedOverlay,
      showVictoryOverlay,
      showDefeatOverlay,
      showDisconnectedOverlay,
      showWaitingConfigOverlay,
      showWaitingOpponentOverlay,
      showCountdownOverlay,
      countdownValue,
    });

    const gameConfig = socketManager?.getGameConfig();

    const score = gameState?.score
      ? {
          player:
            gameState.score[
              this.state.playerPosition === "left" ? "left" : "right"
            ] || 0,
          opponent:
            gameState.score[
              this.state.playerPosition === "left" ? "right" : "left"
            ] || 0,
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
});

export default GameInterface;
