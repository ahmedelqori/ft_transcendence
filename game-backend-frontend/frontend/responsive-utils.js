
export class GameRenderer {
    constructor(canvas, gameConfig) {
      this.canvas = canvas;
      this.gameConfig = gameConfig;
      this.calculateScaleFactor();
    }

    calculateScaleFactor() {
      this.canvasWidth = this.canvas.width;
      this.canvasHeight = this.canvas.height;      
    }
    
    xToPixels(xPercent) {
      return (xPercent / 100) * this.canvasWidth;
    }

    yToPixels(yPercent) {
      return (yPercent / 100) * this.canvasHeight;
    }

    yToPercent(yPixels) {
      return (yPixels / this.canvasHeight) * 100;
    }

    drawPaddle(context, x, y) {
        context.fillStyle = '#FFF';
        const paddleWidth = this.xToPixels(this.gameConfig.paddleWidth);
        const paddleHeight = this.yToPixels(this.gameConfig.paddleHeight);
        const xPos = this.xToPixels(x);
        const yPos = this.yToPixels(y) - (paddleHeight / 2);
        context.fillRect(xPos, yPos, paddleWidth, paddleHeight);
      }
    
      drawBall(context, x, y) {
        const ballSizePixels = Math.min(
          this.xToPixels(this.gameConfig.ballSize),
          this.yToPixels(this.gameConfig.ballSize)
        );
        const radius = ballSizePixels / 2;
        const centerX = this.xToPixels(x);
        const centerY = this.yToPixels(y);        
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 10;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        const gradient = context.createRadialGradient(
          centerX - radius/3, centerY - radius/3, radius/10,
          centerX, centerY, radius
        );        
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, '#F0F0F0');
        gradient.addColorStop(1, '#CCCCCC');

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.closePath();
        
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
      }
    
    
    drawCenterLine(context){
      context.strokeStyle = '#555';
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(this.canvasWidth / 2, 0);
      context.lineTo(this.canvasWidth / 2, this.canvasHeight);
      context.stroke();
      context.setLineDash([]);
    }

    drawGameInPause(context){
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      
      context.font = 'bold 16px Arial';
      context.textAlign = 'center';
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.fillText('Game Paused', centerX, centerY - 40);
      context.font = '14px Arial';
    }
    drawWaitingForStart(context){
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      
      context.font = 'bold 16px Arial';
      context.textAlign = 'center';
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.fillText('waiting for start', centerX, centerY - 40);
      context.font = '14px Arial';
    }

    drawGameOver(context, gameState){
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.fillStyle = '#ff9966';
      context.fillText('GAME OVER', centerX, centerY - 40);
      
      const winner = gameState.winner === 'mainPlayer' ? 'Player 1' : 'Player 2';
      context.font = '18px Arial';
      context.fillStyle = 'white';
      context.fillText(`${winner} wins!`, centerX, centerY - 10);
      context.fillText(`${gameState.score.mainPlayer} - ${gameState.score.secondPlayer}`, centerX, centerY + 20);
    }

    drawWaitingForOpponent(context) {
      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      
      context.font = 'bold 18px Arial';
      context.textAlign = 'center';
      context.fillStyle = 'rgba(255, 255, 255, 0.6)';
      context.fillText('Waiting for opponent...', centerX, centerY - 40);
      
      const dots = '.'.repeat(Math.floor((Date.now() / 500) % 4));
      context.font = '16px Arial';
      context.fillText(`Searching${dots}`, centerX, centerY);
      
      context.font = '14px Arial';
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.fillText(`Game ID: ${gameId}`, centerX, centerY + 50);
    }
    drawBallTrajectory(context, gameState) {
      if (!gameState.inProgress || !gameState.ball.xDir || !gameState.ball.yDir) return;
      
      const steps = 20; // How far ahead to predict
      let x = gameState.ball.x;
      let y = gameState.ball.y;
      const xDir = gameState.ball.xDir;
      const yDir = gameState.ball.yDir;
      
      context.beginPath();
      context.moveTo(this.xToPixels(x), this.yToPixels(y));
      
      // Simplified trajectory prediction (ignoring paddle collisions)
      for (let i = 0; i < steps; i++) {
        x += xDir * 0.5;
        y += yDir * 0.5;
        
        // Simple bounce prediction off top/bottom
        if (y <= 0 || y >= 100) {
          y = y <= 0 ? -y : 200 - y; // Reflect
        }
        
        // Stop at paddle or edge
        if (x <= this.gameConfig.leftPaddleX + this.gameConfig.paddleWidth + 1 || 
            x >= this.gameConfig.rightPaddleX - 1) {
          break;
        }
        
        context.lineTo(this.xToPixels(x), this.yToPixels(y));
      }
      
      context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      context.lineWidth = 1;
      context.stroke();
    }
    renderGame(gameState) {
        if (!gameState) 
          return;
        const context = this.canvas.getContext('2d');
        
        context.fillStyle = '#222';
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (gameState.inProgress) {
          context.fillStyle = '#1a1a1a';
        } else if (gameState.ended) {
          context.fillStyle = '#2a1a1a';
        } else {
          context.fillStyle = '#1a1a2a';
        }
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawCenterLine(context);
        this.drawBallTrajectory(context, gameState);
        this.drawPaddle(context, this.gameConfig.leftPaddleX, gameState.paddles.left);
        this.drawPaddle(context, this.gameConfig.rightPaddleX - this.gameConfig.paddleWidth, 
                       gameState.paddles.right);        
        this.drawBall(context, gameState.ball.x, gameState.ball.y);
        
        if (!gameState.started){
          this.drawWaitingForStart(context);
        }
        if (!gameState.inProgress && !gameState.ended && gameState.started) {
          this.drawGameInPause(context);
        }
        if (gameState.ended) {
          this.drawGameOver(context), gameState;
        }
    }

// ****************************** RESPONSIVE CANVA ****************************** 

      setupResponsiveCanvas() {
        const padding = 20;
        const container = this.canvas.parentElement;
        if (!container) 
          return;        
        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width - padding;
        const maxHeight = containerRect.height - padding;        
        let width, height;        
        width = maxWidth;
        height = width / this.gameConfig.ratio;        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * this.gameConfig.ratio;
        }
        const newWidth = Math.floor(width);
        const newHeight = Math.floor(height);
        if (this.canvas.width !== newWidth || 
            this.canvas.height !== newHeight) {
          this.canvas.width = newWidth;
          this.canvas.height = newHeight;
          this.calculateScaleFactor();          
          this.canvas.style.width = `${newWidth}px`;
          this.canvas.style.height = `${newHeight}px`;
        }
      }
    
    /**
     * Update the game configuration
     */
    updateConfig(newConfig) {
        this.gameConfig = {
          ...this.gameConfig,
          ...newConfig
        };
      }
    
    

    drawText(text, y, fontSize = 16, color = 'white') {
      const context = this.canvas.getContext('2d');
      context.font = `${fontSize}px Arial`;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.fillText(text, this.canvas.width / 2, y);
    }

        /**
     * Handle mouse movement and convert to game percentage
     */
        handleMouseMove(event) {
          const rect = this.canvas.getBoundingClientRect();
          
          // Get mouse position relative to canvas
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          
          // Account for CSS scaling by using the ratio of actual canvas size to displayed size
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          
          // Scale mouse position to actual canvas coordinates
          const canvasX = mouseX * scaleX;
          const canvasY = mouseY * scaleY;
          
          // Convert to game percentage (we only care about Y for paddles)
          return this.yToPercent(canvasY);
        }
  }

  