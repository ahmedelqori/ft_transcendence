import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { GameState, GameStates } from "@/components/GameInterface/socket-manager.js";
import { CanvasManager } from "@/components/GameInterface/canvas-manager.js";

export interface GameConfig {
  paddleWidth: number;
  paddleHeight: number;
  ballSize: number;
  leftPaddleX: number;
  rightPaddleX: number;
  ratio: number;
  [key: string]: any;
}

interface GameRendererProps {
  gameState: GameState | null;
  gameConfig: GameConfig;
}

interface GameRendererState {
  ballPositionHistory: Array<{ x: number; y: number; time: number }>;
  animationFrameId: number;
  canvasManager: CanvasManager | null;
}

interface GameRendererMethods {
  handleResize(): void;
  startAnimationLoop(): void;
  renderGame(): void;
  drawCenterLine(ctx: CanvasRenderingContext2D, canvasManager: CanvasManager): void;
  drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, canvasManager: CanvasManager): void;
  drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, canvasManager: CanvasManager, color?: string): void;
  drawScore(ctx: CanvasRenderingContext2D, gameState: GameState, canvasManager: CanvasManager): void;
  drawBallTrajectory(ctx: CanvasRenderingContext2D, gameState: GameState, canvasManager: CanvasManager): void;
  setupDrawing(ctx: CanvasRenderingContext2D, canvasManager: CanvasManager): void;
  init(): boolean;
  cleanup(): void;
}

export const GameRenderer = defineComponent<GameRendererState, GameRendererProps>({
  state() {
    return {
      ballPositionHistory: [],
      animationFrameId: 0,
      canvasManager: null
    };
  },

  onMounted(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    if (this.props.gameConfig) {
      setTimeout(() => {
        this.init();
        this.startAnimationLoop();
      }, 50);
    }
  },
  onUnmounted(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    cancelAnimationFrame(this.state.animationFrameId);    
    this.cleanup();
  },
  
  cleanup(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    const { canvasManager } = this.state;
    if (canvasManager)
      canvasManager.destroy();
  },
  init(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods): boolean {
    try {
      const containerElement = this.getHtmlElement;
      if (!this.props.gameConfig || !containerElement) return false;
      const canvasManager = CanvasManager.getInstance();      
      canvasManager.init(containerElement);      
      canvasManager.setGameConfig(this.props.gameConfig);
      if (this.getIsMounted) this.updateState({ canvasManager });
      return true;
    } catch (error) {
      console.log("[GameRenderer] Error initializing canvas:", error);
      return false;
    }
  },

  startAnimationLoop(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    if (!this.props.gameConfig) return;
    const animate = () => {
      this.renderGame();
      const nextFrameId = requestAnimationFrame(animate);
      if (this.getIsMounted) this.updateState({ animationFrameId: nextFrameId });
    };
    const initialFrameId = requestAnimationFrame(animate);
    if (this.getIsMounted) this.updateState({ animationFrameId: initialFrameId });
  },

  renderGame(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    const { gameState } = this.props;
    const { canvasManager } = this.state;
    if (!canvasManager)
      if (!this.init()) return;
    const canvas = canvasManager?.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    this.setupDrawing(ctx, canvasManager!);
    if (!gameState) return;
    try {
      this.drawCenterLine(ctx, canvasManager!);
      if (gameState.state === GameStates.IN_PLAY)
        this.drawBallTrajectory(ctx, gameState, canvasManager!);
      this.drawPaddle(ctx, this.props.gameConfig.leftPaddleX, gameState.paddles.left, canvasManager!,"#ddf247");
      this.drawPaddle(ctx, this.props.gameConfig.rightPaddleX - this.props.gameConfig.paddleWidth, gameState.paddles.right,canvasManager!,"#FFFFFF");
      if (gameState.ball) this.drawBall(ctx, gameState.ball.x, gameState.ball.y,canvasManager!);
      this.drawScore(ctx, gameState, canvasManager!);
    } catch (error) {
      console.log("[GameRenderer] Error rendering game:", error);
    }
  },
  handleResize(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods) {
    if (this.state.canvasManager) {
      this.state.canvasManager.resizeCanvas();
      this.renderGame();
    }
  },

  render(this: IComponent<GameRendererState, GameRendererProps>) {
    const { gameConfig } = this.props;
    if (!gameConfig) {
      return createElement(
        "div",
        {
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
          ],
        },
        [
          createElement(
            "div",
            {
              class: ["text-center", "text-[var(--light-grey)]", "text-lg"],
              style: {
                fontFamily: "'Poppins', sans-serif",
              },
            },
            ["Waiting for game configuration..."]
          ),
        ]
      );
    }

    return createElement(
      "div",
      {
        class: [
          "relative",
          "w-full",
          "h-full",
          "flex",
          "items-center",
          "justify-center",
          "max-w-[1200px]",
          "max-h-[800px]",
          "mx-auto",
        ],
        style: {
          aspectRatio: `${gameConfig.ratio}`,
        },
      }
    );
  },

  setupDrawing(this: IComponent<GameRendererState, GameRendererProps> &GameRendererMethods,ctx: CanvasRenderingContext2D,canvasManager: CanvasManager): void {
    const dimensions = canvasManager.dimensions;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    ctx.strokeStyle = "rgba(221, 242, 71, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, dimensions.width, dimensions.height);
  },

  drawCenterLine(this: IComponent<GameRendererState, GameRendererProps> &GameRendererMethods,ctx: CanvasRenderingContext2D,canvasManager: CanvasManager) {
    const { width, height } = canvasManager.dimensions;
    ctx.strokeStyle = "#444";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  drawBall(this: IComponent<GameRendererState, GameRendererProps> &GameRendererMethods,ctx: CanvasRenderingContext2D,x: number,y: number,canvasManager: CanvasManager) {
    const ballSizePixels = Math.min(canvasManager.xToPixels(this.props.gameConfig.ballSize),canvasManager.yToPixels(this.props.gameConfig.ballSize));
    const radius = ballSizePixels / 2;
    const centerX = canvasManager.xToPixels(x);
    const centerY = canvasManager.yToPixels(y);
    ctx.shadowColor = "#ff4242";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4242";
    ctx.fill();
    ctx.closePath();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  },

  drawPaddle(this: IComponent<GameRendererState, GameRendererProps> &GameRendererMethods,ctx: CanvasRenderingContext2D,x: number,y: number,canvasManager: CanvasManager,color: string = "#FFFFFF") {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    const paddleWidth = canvasManager.xToPixels(this.props.gameConfig.paddleWidth);
    const paddleHeight = canvasManager.yToPixels(this.props.gameConfig.paddleHeight);
    const xPos = canvasManager.xToPixels(x);
    const yPos = canvasManager.yToPixels(y) - paddleHeight / 2;
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(xPos + radius, yPos);
    ctx.lineTo(xPos + paddleWidth - radius, yPos);
    ctx.quadraticCurveTo(xPos + paddleWidth,yPos,xPos + paddleWidth,yPos + radius);
    ctx.lineTo(xPos + paddleWidth, yPos + paddleHeight - radius);
    ctx.quadraticCurveTo(xPos + paddleWidth,yPos + paddleHeight,xPos + paddleWidth - radius,yPos + paddleHeight);
    ctx.lineTo(xPos + radius, yPos + paddleHeight);
    ctx.quadraticCurveTo(xPos,yPos + paddleHeight,xPos,yPos + paddleHeight - radius);
    ctx.lineTo(xPos, yPos + radius);
    ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },

  drawScore(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods,ctx: CanvasRenderingContext2D,gameState: GameState,canvasManager: CanvasManager) {
    if (!gameState || !gameState.score) return;
    const { width } = canvasManager.dimensions;
    const topOffset = 50;
    const fontSize = 32;
    ctx.font = `bold ${fontSize}px 'Poppins', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    const leftScore = gameState.score.left || 0;
    const rightScore = gameState.score.right || 0;
    const scoreText = `${leftScore} - ${rightScore}`;
    ctx.fillText(scoreText, width / 2, topOffset);
  },

  drawBallTrajectory(this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods,ctx: CanvasRenderingContext2D,gameState: GameState,canvasManager: CanvasManager) {
    if (gameState.state !== GameStates.IN_PLAY || !gameState.ball) return;
    const currentBallPosition = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      time: Date.now(),
    };
    this.state.ballPositionHistory.push(currentBallPosition);
    const currentTime = Date.now();
    const maxTrailAge = 200;
    this.state.ballPositionHistory = this.state.ballPositionHistory.filter((pos) => currentTime - pos.time < maxTrailAge);
    if (this.state.ballPositionHistory.length > 1) {
      const sortedHistory = [...this.state.ballPositionHistory].sort((a, b) => a.time - b.time);
      for (let i = 0; i < sortedHistory.length - 1; i++) {
        const position = sortedHistory[i];
        const age = currentTime - position.time;
        const opacity = 1 - age / maxTrailAge;
        const size = Math.min(canvasManager.xToPixels(this.props.gameConfig.ballSize), canvasManager.yToPixels(this.props.gameConfig.ballSize)) * (0.7 + 0.3 * (1 - opacity));
        const centerX = canvasManager.xToPixels(position.x);
        const centerY = canvasManager.yToPixels(position.y);
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 66, 66, ${opacity * 0.3})`;
        ctx.fill();
      }
    }
    if (this.getIsMounted) this.updateState({ ballPositionHistory: this.state.ballPositionHistory });
  },
});
