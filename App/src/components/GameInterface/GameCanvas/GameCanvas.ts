import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import {
  type GameState,
  type GameConfig,
  SocketManager,
  GameStates,
} from "@/services/socket-manager.js";
import { GameRenderer } from "../GameRenderer.js";
import { CanvasManager } from "@/services/canvas-manager.js";

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
  processLocalGameInput(): void;
  processOnlineGameInput(): void;
  setupCanvasEventListeners(): void;
}

export const GameCanvas = defineComponent<GameCanvasState, GameCanvasProps>({
  /**
   * Initialize component state
   */
  state() {
    return {
      keysPressed: {},
      keyboardMoveSpeed: 1,
      boundHandlers: {
        keyDown: null,
        keyUp: null,
        mouseMove: null,
        contextMenu: null
      }
    };
  },

  /**
   * Lifecycle: Component mounted - set up event listeners
   */
  onMounted(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    console.log("[GameCanvas] Component mounted");
    
    // Bind all handlers to preserve context
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
    
    // Attach keyboard handlers globally
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    
    // Start the input processing loop
    this.startKeyboardControlLoop();
    
    // Set up canvas event listeners after a delay to ensure canvas is created
    setTimeout(() => {
      this.setupCanvasEventListeners();
    }, 300);
  },

  /**
   * Setup canvas-specific event listeners
   */
  setupCanvasEventListeners(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { boundHandlers } = this.state;
    const canvas = this.findCanvasElement();
    
    if (canvas && boundHandlers.mouseMove && boundHandlers.contextMenu) {
      console.log("[GameCanvas] Canvas element found, adding mouse event listeners");
      canvas.addEventListener("contextmenu", boundHandlers.contextMenu);
      canvas.addEventListener("mousemove", boundHandlers.mouseMove);
    } else {
      console.log("[GameCanvas] Canvas element not available yet, will retry");
      setTimeout(() => {
        this.setupCanvasEventListeners();
      }, 300);
    }
  },

  /**
   * Lifecycle: Component unmounted - clean up event listeners
   */
  onUnmounted(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    console.log("[GameCanvas] Component unmounting");
    this.cleanupEventListeners();
    
    if (this.state.keyboardIntervalId) {
      console.log("[GameCanvas] Clearing keyboard control interval");
      clearInterval(this.state.keyboardIntervalId);
    }
  },

  /**
   * Clean up all event listeners
   */
  cleanupEventListeners(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    console.log("[GameCanvas] Cleaning up event listeners");
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
  },

  /**
   * Find the canvas element using the CanvasManager
   */
  findCanvasElement(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods): HTMLCanvasElement | null {
    // Use the canvas manager to get the canvas element
    return CanvasManager.getInstance().getCanvas();
  },

  /**
   * Handle context menu events (prevent right-click menu)
   */
  handleContextMenu(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: Event) {
    e.preventDefault();
  },

  /**
   * Handle mouse movement for paddle control (online games only)
   */
  handleMouseMove(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: MouseEvent) {
    const { socketManager, gameState } = this.props;
    
    // Skip mouse movement handling entirely for local games
    if (socketManager?.isLocalGame()) {
      return;
    }
    
    // Regular online game handling
    if (!socketManager || 
        !gameState || 
        gameState.state !== GameStates.IN_PLAY) {
      return;
    }

    const canvas = e.target as HTMLCanvasElement;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const paddlePos = Math.max(0, Math.min(100, y));
    console.log(`[GameCanvas] Mouse move: paddle position ${paddlePos.toFixed(1)}`);
    socketManager.sendPaddleMove(paddlePos);
  },

  /**
   * Handle key down events for paddle control
   */
  handleKeyDown(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: KeyboardEvent) {
    const { socketManager } = this.props;
    const { keysPressed } = this.state;
    
    if (!socketManager?.getIsConnected() || !socketManager.getGameState()) return;

    // Update pressed keys state
    this.updateState({
      keysPressed: { ...keysPressed, [e.key]: true }
    });

    // Process input immediately for a more responsive feel
    const gamePlayingState = socketManager.getGameState()?.state === GameStates.IN_PLAY;
    const isControlKey = e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s";
    
    if (gamePlayingState && isControlKey) {
      e.preventDefault();
      this.processKeyboardInput();
    }
  },

  /**
   * Handle key up events
   */
  handleKeyUp(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods, e: KeyboardEvent) {
    const { keysPressed } = this.state;
    const updatedKeys = { ...keysPressed };
    delete updatedKeys[e.key];
    
    this.updateState({ keysPressed: updatedKeys });
  },

  /**
   * Start the keyboard control processing loop
   */
  startKeyboardControlLoop(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    console.log("[GameCanvas] Starting keyboard control loop");
    
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
    }, 1000/60);
    
    this.updateState({ keyboardIntervalId: intervalId });
  },

  /**
   * Process keyboard input for local game (both paddles)
   */
  processLocalGameInput(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { socketManager } = this.props;
    const { keysPressed, keyboardMoveSpeed } = this.state;
    
    if (!socketManager) return;
    
    const gameState = socketManager.getGameState();
    if (!gameState) return;
    
    // Process left paddle (W/S keys)
    let leftPaddlePos = gameState.paddles.left || 50;
    let leftMoved = false;
    let leftNewPos = leftPaddlePos;
    
    if (keysPressed["w"]) {
      leftNewPos = Math.max(0, leftPaddlePos - keyboardMoveSpeed);
      leftMoved = true;
    } else if (keysPressed["s"]) {
      leftNewPos = Math.min(100, leftPaddlePos + keyboardMoveSpeed);
      leftMoved = true;
    }
    
    if (leftMoved && leftNewPos !== leftPaddlePos) {
      console.log(`[GameCanvas] Left paddle move: ${leftNewPos.toFixed(1)}`);
      socketManager.sendOfflinePaddleMove(leftNewPos, 'left');
    }
    
    // Process right paddle (Arrow keys)
    let rightPaddlePos = gameState.paddles.right || 50;
    let rightMoved = false;
    let rightNewPos = rightPaddlePos;
    
    if (keysPressed["ArrowUp"]) {
      rightNewPos = Math.max(0, rightPaddlePos - keyboardMoveSpeed);
      rightMoved = true;
    } else if (keysPressed["ArrowDown"]) {
      rightNewPos = Math.min(100, rightPaddlePos + keyboardMoveSpeed);
      rightMoved = true;
    }
    
    if (rightMoved && rightNewPos !== rightPaddlePos) {
      console.log(`[GameCanvas] Right paddle move: ${rightNewPos.toFixed(1)}`);
      socketManager.sendOfflinePaddleMove(rightNewPos, 'right');
    }
  },

  /**
   * Process keyboard input for online game (player's paddle only)
   */
  processOnlineGameInput(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { socketManager } = this.props;
    const { keysPressed, keyboardMoveSpeed } = this.state;
    
    if (!socketManager) return;
    
    const gameState = socketManager.getGameState();
    if (!gameState) return;
    
    const playerPosition = socketManager.getPlayerPosition();
    if (!playerPosition) return;
    
    // Get current paddle position based on player side
    let paddlePos = 50;
    if (playerPosition === "left") {
      paddlePos = gameState.paddles.left || 50;
    } else if (playerPosition === "right") {
      paddlePos = gameState.paddles.right || 50;
    } else {
      return;
    }

    // Calculate new position based on key presses
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

  /**
   * Process keyboard input based on game type (local or online)
   */
  processKeyboardInput(this: IComponent<GameCanvasState, GameCanvasProps> & GameCanvasMethods) {
    const { socketManager } = this.props;
    if (!socketManager) return;
    
    const gameState = socketManager.getGameState();
    if (!gameState || gameState.state !== GameStates.IN_PLAY) return;
    
    // Handle input differently based on game type
    if (socketManager.isLocalGame()) {
      this.processLocalGameInput();
    } else {
      this.processOnlineGameInput();
    }
  },

  /**
   * Render the game canvas
   */
  render(this: IComponent<GameCanvasState, GameCanvasProps>) {
    const { gameState, gameConfig } = this.props;
    
    // If no config yet, show placeholder
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
        [
          createElement(
            "div",
            {
              class: ["text-center", "text-[var(--light-grey)]", "text-lg"]
            },
            ["Waiting for game configuration..."]
          )
        ]
      );
    }
    
    // Render game container with renderer
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
          maxWidth: "1200px",
          margin: "0 auto"
        }
      }, [
        createElement(GameRenderer, { 
          gameState, 
          gameConfig: gameConfig
        }),
      ]
    );
  },
});

export default GameCanvas;
