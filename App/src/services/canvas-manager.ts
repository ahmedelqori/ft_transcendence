import { GameConfig } from "@/components/GameInterface/GameRenderer.js";

export class CanvasManager {
   static instance: CanvasManager | null = null;
   canvas: HTMLCanvasElement | null;
   gameConfig: GameConfig | null;
   canvasWidth: number;
   canvasHeight: number;
   maxWidth: number;
   maxHeight: number;
   container: HTMLElement | null;
   resizeHandler: ((e: UIEvent) => void) | null;

   constructor() {
    this.canvas = null;
    this.gameConfig = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.maxHeight = 0;
    this.maxWidth = 0;
    this.container = null;
    this.resizeHandler = null;
   }  
    public static getInstance(): CanvasManager {
        if (!this.instance)
          this.instance = new CanvasManager();
        return this.instance;
    }

  public init(container: HTMLElement): HTMLCanvasElement {
    this.container = container;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('game-canvas', 'block', 'rounded-lg', 'shadow-lg', 'border-2',
        'border-[#ddf247]', 'border-opacity-30', 'touch-none', 'backdrop-blur-sm', 'bg-opacity-10', 'bg-black',
        'max-h-full', 'max-w-full');
      this.container.appendChild(this.canvas);      
      this.setupResizeHandling();
    }
    return this.canvas;
  }
  
  public setGameConfig(config: GameConfig): void {
    this.gameConfig = config;
    if (this.canvas && this.gameConfig) {
      this.canvas.style.aspectRatio = `${this.gameConfig.ratio}`;
      this.resizeCanvas();
    }
  }
  
  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }
  
  public getGameConfig(): GameConfig | null {
    return this.gameConfig;
  }

  public calculateScaleFactor(): void {
    if (!this.canvas) return;
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  public xToPixels(xPercent: number): number {
    return (xPercent / 100) * this.canvasWidth;
  }
  
  public yToPixels(yPercent: number): number {
    return (yPercent / 100) * this.canvasHeight;
  }

  public resizeCanvas(): void {
    if (!this.canvas || !this.container || !this.gameConfig) return;
    const containerRect = this.container.getBoundingClientRect();
    this.maxWidth = containerRect.width;
    this.maxHeight = containerRect.height;
    let width, height;
    const ratio = this.gameConfig.ratio;
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
      this.canvas.width = width;
      this.canvas.height = height;
      this.calculateScaleFactor();
    }
  }
    setupResizeHandling(): void {
    if (this.resizeHandler)
      window.removeEventListener('resize', this.resizeHandler);    
    this.resizeHandler = (() => {
      let timeout: number | null = null;
      return (e: UIEvent) => {
        if (timeout)
          window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          this.resizeCanvas();
        }, 100);
      };
    })();
    window.addEventListener('resize', this.resizeHandler);
  }
  
  public get dimensions(): { width: number; height: number } {
    return {
      width: this.canvasWidth,
      height: this.canvasHeight
    };
  }
  public destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.canvas && this.container)
      this.container.removeChild(this.canvas);
    this.canvas = null;
    this.gameConfig = null;
    this.container = null;
    CanvasManager.instance = null;
  }
}