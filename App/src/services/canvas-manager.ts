import { GameConfig } from "@/components/GameInterface/GameRenderer.js";

/**
 * Canvas Manager service for creating and managing game canvas elements
 */
export class CanvasManager {
   static instance: CanvasManager | null = null;
   canvas: HTMLCanvasElement | null = null;
   gameConfig: GameConfig | null = null;
   canvasWidth: number = 0;
   canvasHeight: number = 0;
   maxWidth: number = 0;
   maxHeight: number = 0;
   container: HTMLElement | null = null;
   resizeHandler: ((e: UIEvent) => void) | null = null;
  
  /**
   * Get the singleton instance of CanvasManager
   */
  public static getInstance(): CanvasManager {
    if (!this.instance) {
      this.instance = new CanvasManager();
    }
    return this.instance;
  }
  
  /**
   *  constructor to enforce singleton pattern
   */
   constructor() {}
  
  /**
   * Initialize the canvas manager with a container element
   */
  public init(container: HTMLElement): HTMLCanvasElement {
    this.container = container;
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('game-canvas', 
        'block', 'rounded-lg', 'shadow-lg', 'border-2',
        'border-[#ddf247]', 'border-opacity-30', 'touch-none',
        'backdrop-blur-sm', 'bg-opacity-10', 'bg-black',
        'max-h-full', 'max-w-full');
      
      this.container.appendChild(this.canvas);      
      this.setupResizeHandling();
    }
    
    return this.canvas;
  }
  
  /**
   * Set the game configuration
   */
  public setGameConfig(config: GameConfig): void {
    this.gameConfig = config;
    
    if (this.canvas && this.gameConfig) {
      this.canvas.style.aspectRatio = `${this.gameConfig.ratio}`;
      this.resizeCanvas();
    }
  }
  
  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }
  
  /**
   * Get the game configuration
   */
  public getGameConfig(): GameConfig | null {
    return this.gameConfig;
  }
  
  /**
   * Calculate scale factor for canvas
   */
  public calculateScaleFactor(): void {
    if (!this.canvas) return;
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }
  
  /**
   * Convert x percentage to pixels
   */
  public xToPixels(xPercent: number): number {
    return (xPercent / 100) * this.canvasWidth;
  }
  
  /**
   * Convert y percentage to pixels
   */
  public yToPixels(yPercent: number): number {
    return (yPercent / 100) * this.canvasHeight;
  }
  
  /**
   * Resize the canvas based on container size and game configuration
   */
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
  
  /**
   * Setup resize handling with debouncing
   */
    setupResizeHandling(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // Create debounced resize handler
    this.resizeHandler = (() => {
      let timeout: number | null = null;
      return (e: UIEvent) => {
        if (timeout) {
          window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
          this.resizeCanvas();
        }, 100);
      };
    })();
    
    // Add the event listener
    window.addEventListener('resize', this.resizeHandler);
  }
  
  /**
   * Get canvas dimensions
   */
  public get dimensions(): { width: number; height: number } {
    return {
      width: this.canvasWidth,
      height: this.canvasHeight
    };
  }
  
  /**
   * Clean up resources when no longer needed
   */
  public destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    
    this.canvas = null;
    this.gameConfig = null;
    this.container = null;
    CanvasManager.instance = null;
  }
}