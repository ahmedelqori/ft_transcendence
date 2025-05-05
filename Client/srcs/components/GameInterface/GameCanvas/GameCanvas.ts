import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";
import { 
  GameState, 
  GameConfig, 
  SocketManager,
  GameStates 
} from "../../../services/socket-manager.js";
import { GameRenderer } from "../GameRenderer.js";

interface GameCanvasProps {
  gameState: GameState | null;
  gameConfig: GameConfig | null;
  socketManager: SocketManager | null;
}

interface GameCanvasState {
  keysPressed: Record<string, boolean>;
  keyboardMoveSpeed: number;
  keyboardIntervalId?: ReturnType<typeof setInterval>;
  boundHandlers: {
    keyDown: ((e: KeyboardEvent) => void) | null;
    keyUp: ((e: KeyboardEvent) => void) | null;
    mouseMove: ((e: MouseEvent) => void) | null;
    contextMenu: ((e: Event) => void) | null;
  };
}

interface GameCanvasMethods {
  findCanvasElement(): HTMLCanvasElement | null;
  handleMouseMove(e: MouseEvent): void;
  handleKeyDown(e: KeyboardEvent): void;
  handleKeyUp(e: KeyboardEvent): void;
  handleContextMenu(e: Event): void;
  startKeyboardControlLoop(): void;
  processKeyboardInput(): void;
  cleanupEventListeners(): void;
}

export const GameCanvas = defineComponent<GameCanvasState, GameCanvasProps>({
  state() {
    return {
      keysPressed: {},
      keyboardMoveSpeed: 3,
      boundHandlers: {
        keyDown: null,
        keyUp: null,
        mouseMove: null,
        contextMenu: null
      }
    };
  },

  onMounted(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const keyDownHandler = this.handleKeyDown.bind(this);
    const keyUpHandler = this.handleKeyUp.bind(this);
    const mouseMoveHandler = this.handleMouseMove.bind(this);
    const contextMenuHandler = this.handleContextMenu.bind(this);
    
    this.updateState({
      boundHandlers: {
        keyDown: keyDownHandler,
        keyUp: keyUpHandler,
        mouseMove: mouseMoveHandler,
        contextMenu: contextMenuHandler
      }
    });
    
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    
    this.startKeyboardControlLoop();
    
    setTimeout(() => {
      const gameCanvas = this.findCanvasElement();
      if (gameCanvas) {
        console.log("[GameCanvas] Canvas element found, adding event listeners");
        gameCanvas.addEventListener("contextmenu", contextMenuHandler);
        gameCanvas.addEventListener("mousemove", mouseMoveHandler);
      } else {
        console.error("[GameCanvas] Canvas element not found for event listeners");
      }
    }, 100);
  },

  onUnmounted(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    this.cleanupEventListeners();
    
    if (this.state.keyboardIntervalId) {
      clearInterval(this.state.keyboardIntervalId);
    }
  },

  cleanupEventListeners(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { boundHandlers } = this.state;
    
    if (boundHandlers.keyDown) {
      window.removeEventListener("keydown", boundHandlers.keyDown);
    }
    
    if (boundHandlers.keyUp) {
      window.removeEventListener("keyup", boundHandlers.keyUp);
    }
    
    const gameCanvas = this.findCanvasElement();
    if (gameCanvas) {
      if (boundHandlers.mouseMove) {
        gameCanvas.removeEventListener("mousemove", boundHandlers.mouseMove);
      }
      
      if (boundHandlers.contextMenu) {
        gameCanvas.removeEventListener("contextmenu", boundHandlers.contextMenu);
      }
    }
    
    this.updateState({
      boundHandlers: {
        keyDown: null,
        keyUp: null,
        mouseMove: null,
        contextMenu: null
      }
    });
  },

  findCanvasElement(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods): HTMLCanvasElement | null {
    const canvas = document.querySelector(".game-canvas");
    return canvas as HTMLCanvasElement | null;
  },

  handleContextMenu(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: Event) {
    e.preventDefault();
  },

  handleMouseMove(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: MouseEvent) {
    const { socketManager, gameState } = this.props;
    const playerPosition = socketManager?.getPlayerPosition();
    
    if (!gameState || 
        gameState.state !== GameStates.IN_PLAY || 
        !playerPosition ||
        !socketManager) {
      return;
    }

    const canvas = e.target as HTMLCanvasElement;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const paddlePos = Math.max(0, Math.min(100, y));

    socketManager.sendPaddleMove(paddlePos);
  },

  handleKeyDown(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: KeyboardEvent) {
    const { socketManager } = this.props;
    const { keysPressed } = this.state;
    
    if (!socketManager?.getIsConnected() || !socketManager.getGameState()) return;

    this.updateState({
      keysPressed: { ...keysPressed, [e.key]: true }
    });

    if (
      socketManager.getGameState()?.state === GameStates.IN_PLAY &&
      (e.key === "ArrowUp" ||
       e.key === "ArrowDown" ||
       e.key === "w" ||
       e.key === "s")
    ) {
      e.preventDefault();

      this.processKeyboardInput();
    }
  },

  handleKeyUp(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: KeyboardEvent) {
    const { keysPressed } = this.state;
    const updatedKeys = { ...keysPressed };
    delete updatedKeys[e.key];
    
    this.updateState({ keysPressed: updatedKeys });
  },

  startKeyboardControlLoop(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const intervalId = setInterval(() => {
      const { socketManager } = this.props;
      const gameState = socketManager?.getGameState();
      
      if (
        !socketManager?.getIsConnected() ||
        !gameState ||
        gameState.state !== GameStates.IN_PLAY
      ) {
        return;
      }

      this.processKeyboardInput();
    }, 50);
    
    this.updateState({ keyboardIntervalId: intervalId });
  },

  processKeyboardInput(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { socketManager } = this.props;
    const { keysPressed, keyboardMoveSpeed } = this.state;
    
    if (!socketManager) return;
    
    const gameState = socketManager.getGameState();
    const playerPosition = socketManager.getPlayerPosition();

    if (!gameState || !playerPosition || gameState.state !== GameStates.IN_PLAY)
      return;

    let paddlePos = 50;

    if (playerPosition === "left") {
      paddlePos = gameState.paddles.left || 50;
    } else if (playerPosition === "right") {
      paddlePos = gameState.paddles.right || 50;
    } else {
      return;
    }

    let newPos = paddlePos;
    let moved = false;

    if (keysPressed["ArrowUp"] || keysPressed["w"]) {
      newPos = Math.max(0, paddlePos - keyboardMoveSpeed);
      moved = true;
    } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
      newPos = Math.min(100, paddlePos + keyboardMoveSpeed);
      moved = true;
    }

    if (moved && newPos !== paddlePos) {
      socketManager.sendPaddleMove(newPos);
    }
  },

  render(this: IComponent<GameCanvasState, GameCanvasProps>) {
    const { gameState, gameConfig } = this.props;
    
    if (!gameConfig) {
      return createElement(
        "div", {
          class: [
            "relative", 
            "w-full",
            "h-full",
            "flex",
            "items-center",
            "justify-center",
            "rounded-lg",
            "border-2",
            "border-[#878787]",
            "border-opacity-[30%]",
            "bg-black",
            "bg-opacity-10",
          ]
        },
      );
    }
    
    return createElement(
      "div", {
        class: [
          "relative", 
          "flex",
          "items-center",
          "justify-center",
          "w-full",
          "h-full",
          "overflow-hidden",
          "max-h-[90vh]"
        ],
        style: {
          aspectRatio: `${gameConfig.ratio}`,
          maxWidth: "1200px",
          margin: "0 auto"
        }
      }, [
        createElement(GameRenderer, { 
          gameState, 
          gameConfig: gameConfig
        }),
      ]
    )
  },
});

export default GameCanvas;
