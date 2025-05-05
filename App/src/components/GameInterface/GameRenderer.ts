import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { GameState, GameStates } from "@/services/socket-manager.js";

export interface GameConfig {
  paddleWidth: number;
  paddleHeight: number;
  ballSize: number;
  leftPaddleX: number;
  rightPaddleX: number;
  ratio: number;
  [key: string]: any;
}

export class ResponsiveCanva {
  private canvas: HTMLCanvasElement;
  private gameConfig: GameConfig;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private maxWidth: number = 0;
  private maxHeight: number = 0;

  constructor(canvas: HTMLCanvasElement, gameConfig: GameConfig) {
    this.canvas = canvas;
    this.gameConfig = gameConfig;
    this.calculateScaleFactor();
  }

  get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  calculateScaleFactor(): void {
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  xToPixels(xPercent: number): number {
    return (xPercent / 100) * this.canvasWidth;
  }

  yToPixels(yPercent: number): number {
    return (yPercent / 100) * this.canvasHeight;
  }

  setup(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    this.maxWidth = containerRect.width;
    this.maxHeight = containerRect.height;

    let width, height;

    const ratio = this.gameConfig?.ratio;

    if (this.maxWidth / this.maxHeight > ratio) {
      height = Math.min(this.maxHeight, 800);
      width = height * ratio;
    } else {
      width = Math.min(this.maxWidth, 1200);
      height = width / ratio;
    }

    width = Math.min(width, this.maxWidth);
    height = Math.min(height, this.maxHeight);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      console.log(
        `[ResponsiveCanva] Setting canvas dimensions: ${width.toFixed(
          0
        )}x${height.toFixed(0)}`
      );
      this.canvas.width = width;
      this.canvas.height = height;
      this.calculateScaleFactor();
    }
  }

  get dimensions(): { width: number; height: number } {
    return {
      width: this.canvasWidth,
      height: this.canvasHeight,
    };
  }
}

interface GameRendererProps {
  gameState: GameState | null;
  gameConfig: GameConfig;
}

interface GameRendererState {
  responsiveCanva: ResponsiveCanva | null;
  ballPositionHistory: Array<{ x: number; y: number; time: number }>;
  animationFrameId: number;
  resizeHandler?: (e: UIEvent) => void;
}

interface GameRendererMethods {
  handleResize(): void;
  startAnimationLoop(): void;
  renderGame(): void;
  drawCenterLine(
    ctx: CanvasRenderingContext2D,
    responsiveCanva: ResponsiveCanva
  ): void;
  drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    responsiveCanva: ResponsiveCanva
  ): void;
  drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    responsiveCanva: ResponsiveCanva,
    color?: string
  ): void;
  drawScore(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    responsiveCanva: ResponsiveCanva
  ): void;
  drawBallTrajectory(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    responsiveCanva: ResponsiveCanva
  ): void;
  setupDrawing(ctx: CanvasRenderingContext2D, canvas: ResponsiveCanva): void;
  initCanvas(): boolean;
}

export const GameRenderer = defineComponent<
  GameRendererState,
  GameRendererProps
>({
  state() {
    return {
      responsiveCanva: null,
      ballPositionHistory: [],
      animationFrameId: 0,
    };
  },

  onMounted(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ) {
    if (this.props.gameConfig) {
      setTimeout(() => {
        if (this.initCanvas()) {
          console.log("[GameRenderer] Canvas initialized successfully");
          this.handleResize();
          this.startAnimationLoop();
        }
      }, 50);
    } else {
      console.log("[GameRenderer] Waiting for game configuration");
    }

    let resizeTimeout: number | null = null;
    const debouncedResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = window.setTimeout(() => {
        this.handleResize();
        resizeTimeout = null;
      }, 100);
    };

    window.addEventListener("resize", debouncedResize);
    this.updateState({ resizeHandler: debouncedResize });
  },

  onUnmounted(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ) {
    cancelAnimationFrame(this.state.animationFrameId);

    if (this.state.resizeHandler) {
      window.removeEventListener("resize", this.state.resizeHandler);
    }
  },

  initCanvas(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ): boolean {
    try {
      if (!this.props.gameConfig) {
        console.log("[GameRenderer] Waiting for game configuration");
        return false;
      }

      const canvas = this.getHtmlElement.querySelector("canvas");
      if (!canvas) {
        console.error("[GameRenderer] Canvas element not found");
        return false;
      }

      const responsiveCanva = new ResponsiveCanva(
        canvas,
        this.props.gameConfig
      );
      responsiveCanva.setup();
      this.updateState({ responsiveCanva });
      return true;
    } catch (error) {
      console.error("[GameRenderer] Error initializing canvas:", error);
      return false;
    }
  },

  startAnimationLoop(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ) {
    if (!this.props.gameConfig) {
      console.log(
        "[GameRenderer] Not starting animation loop - waiting for game config"
      );
      return;
    }
    const animate = () => {
      this.renderGame();
      const nextFrameId = requestAnimationFrame(animate);
      this.updateState({ animationFrameId: nextFrameId });
    };

    const initialFrameId = requestAnimationFrame(animate);
    this.updateState({ animationFrameId: initialFrameId });
  },

  renderGame(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ) {
    const { gameState } = this.props;
    const { responsiveCanva } = this.state;

    if (!responsiveCanva) {
      if (!this.initCanvas()) {
        return;
      }
    }

    const canvas = responsiveCanva?.canvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    this.setupDrawing(ctx, responsiveCanva!);

    if (!gameState) {
      return;
    }

    try {
      this.drawCenterLine(ctx, responsiveCanva!);

      if (gameState.state === GameStates.IN_PLAY) {
        this.drawBallTrajectory(ctx, gameState, responsiveCanva!);
      }

      this.drawPaddle(
        ctx,
        this.props.gameConfig.leftPaddleX,
        gameState.paddles.left,
        responsiveCanva!,
        "#ddf247"
      );

      this.drawPaddle(
        ctx,
        this.props.gameConfig.rightPaddleX - this.props.gameConfig.paddleWidth,
        gameState.paddles.right,
        responsiveCanva!,
        "#FFFFFF"
      );

      if (gameState.ball) {
        this.drawBall(
          ctx,
          gameState.ball.x,
          gameState.ball.y,
          responsiveCanva!
        );
      }

      this.drawScore(ctx, gameState, responsiveCanva!);
    } catch (error) {
      console.error("[GameRenderer] Error rendering game:", error);
    }
  },

  handleResize(
    this: IComponent<GameRendererState, GameRendererProps> & GameRendererMethods
  ) {
    if (this.state.responsiveCanva) {
      console.log("[GameRenderer] Handling resize event");
      this.state.responsiveCanva.setup();
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

    const ratio = gameConfig.ratio;
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
      },
      [
        createElement("canvas", {
          class: [
            "game-canvas",
            "block",
            "rounded-lg",
            "shadow-lg",
            "border-2",
            "border-[#ddf247]",
            "border-opacity-30",
            "touch-none",
            "backdrop-blur-sm",
            "bg-opacity-10",
            "bg-black",
            "max-h-full",
            "max-w-full",
          ],
          style: {
            aspectRatio: `${ratio}`,
          },
        }),
      ]
    );
  },

  setupDrawing(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    responsiveCanva: ResponsiveCanva
  ): void {
    const dimensions = responsiveCanva.dimensions;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    ctx.strokeStyle = "rgba(221, 242, 71, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, dimensions.width, dimensions.height);
  },

  drawCenterLine(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    responsiveCanva: ResponsiveCanva
  ) {
    const { width, height } = responsiveCanva.dimensions;
    ctx.strokeStyle = "#444";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  drawBall(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    responsiveCanva: ResponsiveCanva
  ) {
    const ballSizePixels = Math.min(
      responsiveCanva.xToPixels(this.props.gameConfig.ballSize),
      responsiveCanva.yToPixels(this.props.gameConfig.ballSize)
    );

    const radius = ballSizePixels / 2;
    const centerX = responsiveCanva.xToPixels(x);
    const centerY = responsiveCanva.yToPixels(y);

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

  drawPaddle(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    responsiveCanva: ResponsiveCanva,
    color: string = "#FFFFFF"
  ) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const paddleWidth = responsiveCanva.xToPixels(
      this.props.gameConfig.paddleWidth
    );
    const paddleHeight = responsiveCanva.yToPixels(
      this.props.gameConfig.paddleHeight
    );
    const xPos = responsiveCanva.xToPixels(x);
    const yPos = responsiveCanva.yToPixels(y) - paddleHeight / 2;

    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(xPos + radius, yPos);
    ctx.lineTo(xPos + paddleWidth - radius, yPos);
    ctx.quadraticCurveTo(
      xPos + paddleWidth,
      yPos,
      xPos + paddleWidth,
      yPos + radius
    );
    ctx.lineTo(xPos + paddleWidth, yPos + paddleHeight - radius);
    ctx.quadraticCurveTo(
      xPos + paddleWidth,
      yPos + paddleHeight,
      xPos + paddleWidth - radius,
      yPos + paddleHeight
    );
    ctx.lineTo(xPos + radius, yPos + paddleHeight);
    ctx.quadraticCurveTo(
      xPos,
      yPos + paddleHeight,
      xPos,
      yPos + paddleHeight - radius
    );
    ctx.lineTo(xPos, yPos + radius);
    ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },

  drawScore(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    responsiveCanva: ResponsiveCanva
  ) {
    if (!gameState || !gameState.score) return;

    const { width } = responsiveCanva.dimensions;
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

  drawBallTrajectory(
    this: IComponent<GameRendererState, GameRendererProps> &
      GameRendererMethods,
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    responsiveCanva: ResponsiveCanva
  ) {
    if (gameState.state !== GameStates.IN_PLAY || !gameState.ball) return;

    const currentBallPosition = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      time: Date.now(),
    };

    this.state.ballPositionHistory.push(currentBallPosition);

    const currentTime = Date.now();
    const maxTrailAge = 200;
    this.state.ballPositionHistory = this.state.ballPositionHistory.filter(
      (pos) => currentTime - pos.time < maxTrailAge
    );

    if (this.state.ballPositionHistory.length > 1) {
      const sortedHistory = [...this.state.ballPositionHistory].sort(
        (a, b) => a.time - b.time
      );

      for (let i = 0; i < sortedHistory.length - 1; i++) {
        const position = sortedHistory[i];
        const age = currentTime - position.time;
        const opacity = 1 - age / maxTrailAge;
        const size =
          Math.min(
            responsiveCanva.xToPixels(this.props.gameConfig.ballSize),
            responsiveCanva.yToPixels(this.props.gameConfig.ballSize)
          ) *
          (0.7 + 0.3 * (1 - opacity));

        const centerX = responsiveCanva.xToPixels(position.x);
        const centerY = responsiveCanva.yToPixels(position.y);

        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 66, 66, ${opacity * 0.3})`;
        ctx.fill();
      }
    }

    this.updateState({ ballPositionHistory: this.state.ballPositionHistory });
  },
});
