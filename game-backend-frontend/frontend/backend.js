const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let gameState = {
  ball: { x: 0, y: 0, dx: 0, dy: 0 },
  paddles: { left: 0, right: 0 },
  score: { left: 0, right: 0 },
  inProgress: false
};

// Game configuration
const config = {
  ballSize: 25,
  paddleWidth: 15,
  paddleHeight: 150,
  initialBallSpeed: 5,
  maxBallSpeed: 15,
  speedIncrease: 0.5,
  maxScore: 5
};

let leftPlayerId = null;
let rightPlayerId = null;
let gameInterval = null;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle joining a game
  socket.on('joinGame', () => {
    if (!leftPlayerId) {
      leftPlayerId = socket.id;
      socket.emit('gameCreated');
      console.log('Left player joined:', leftPlayerId);
    } else if (!rightPlayerId && socket.id !== leftPlayerId) {
      rightPlayerId = socket.id;
      socket.emit('gameJoined');
      io.to(leftPlayerId).emit('opponentJoined');
      console.log('Right player joined:', rightPlayerId);
    } else {
      socket.emit('gameFull');
    }
  });
  
  // Handle paddle movement
  socket.on('paddleMove', (position) => {
    if (!gameState.inProgress) return;
    
    if (socket.id === leftPlayerId) {
      gameState.paddles.left = position;
    } else if (socket.id === rightPlayerId) {
      gameState.paddles.right = position;
    }
  });
  
  // Start the game (only left player can start)
  socket.on('startGame', () => {
    if (socket.id === leftPlayerId && rightPlayerId) {
      resetBall();
      gameState.inProgress = true;
      io.emit('gameStart');
      
      // Start game loop
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(updateGameState, 1000/60); // 60 FPS
    }
  });
  
  // Restart game
  socket.on('restartGame', () => {
    if (socket.id === leftPlayerId) {
      gameState.score.left = 0;
      gameState.score.right = 0;
      resetBall();
      gameState.inProgress = true;
      io.emit('gameStart');
      
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(updateGameState, 1000/60);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.id === leftPlayerId) {
      leftPlayerId = null;
      if (rightPlayerId) {
        io.to(rightPlayerId).emit('opponentLeft');
      }
      if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      }
      gameState.inProgress = false;
    } else if (socket.id === rightPlayerId) {
      rightPlayerId = null;
      io.to(leftPlayerId).emit('opponentLeft');
      if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      }
      gameState.inProgress = false;
    }
  });
});

// Calculate initial position and dimensions once the first client connects
io.on('connection', (socket) => {
  // Only do this on the first connection
  if (!gameState.boardWidth) {
    socket.on('boardDimensions', (dimensions) => {
      gameState.boardWidth = dimensions.width;
      gameState.boardHeight = dimensions.height;
      
      // Set initial paddle positions in the middle of the board
      const paddleY = (gameState.boardHeight - config.paddleHeight) / 2;
      gameState.paddles.left = paddleY;
      gameState.paddles.right = paddleY;
      
      resetBall();
    });
    
    // Request board dimensions from the first client
    socket.emit('getBoardDimensions');
  }
});

// Reset ball to center with random direction
function resetBall() {
  // Get board dimensions (fallback to reasonable defaults if not set yet)
  const boardWidth = gameState.boardWidth || 800;
  const boardHeight = gameState.boardHeight || 600;
  
  gameState.ball = {
    x: boardWidth / 2 - config.ballSize / 2,
    y: boardHeight / 2 - config.ballSize / 2,
    dx: (Math.random() > 0.5 ? 1 : -1) * config.initialBallSpeed,
    dy: (Math.random() * 2 - 1) * config.initialBallSpeed
  };
}

// Game loop to update ball position, check collisions, etc.
function updateGameState() {
  if (!gameState.inProgress) return;
  
  // Get current dimensions
  const boardWidth = gameState.boardWidth || 800;
  const boardHeight = gameState.boardHeight || 600;
  
  // Move ball
  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;
  
  // Ball collision with top and bottom walls
  if (gameState.ball.y <= 0 || gameState.ball.y >= boardHeight - config.ballSize) {
    gameState.ball.dy = -gameState.ball.dy;
    // Ensure ball stays in bounds
    if (gameState.ball.y < 0) {
      gameState.ball.y = 0;
    } else if (gameState.ball.y > boardHeight - config.ballSize) {
      gameState.ball.y = boardHeight - config.ballSize;
    }
  }
  
  // Left paddle collision (50px from left edge)
  const leftPaddleX = 50;
  if (gameState.ball.dx < 0 && // Ball moving left
      gameState.ball.x <= leftPaddleX + config.paddleWidth && 
      gameState.ball.x >= leftPaddleX &&
      gameState.ball.y + config.ballSize >= gameState.paddles.left && 
      gameState.ball.y <= gameState.paddles.left + config.paddleHeight) {
    
    // Calculate bounce angle based on where the ball hit the paddle
    const hitPosition = (gameState.ball.y + config.ballSize/2 - gameState.paddles.left) / config.paddleHeight;
    const bounceAngle = (hitPosition - 0.5) * Math.PI * 0.7; // -35° to 35° angle
    
    const speed = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
    const newSpeed = Math.min(speed + config.speedIncrease, config.maxBallSpeed);
    
    gameState.ball.dx = Math.cos(bounceAngle) * newSpeed;
    gameState.ball.dy = Math.sin(bounceAngle) * newSpeed;
    
    // Ensure ball is moving right
    if (gameState.ball.dx <= 0) {
      gameState.ball.dx = 2; // Minimum rightward velocity
    }
  }
  
  // Right paddle collision (50px from right edge)
  const rightPaddleX = boardWidth - 50 - config.paddleWidth;
  if (gameState.ball.dx > 0 && // Ball moving right
      gameState.ball.x + config.ballSize >= rightPaddleX && 
      gameState.ball.x <= rightPaddleX + config.paddleWidth &&
      gameState.ball.y + config.ballSize >= gameState.paddles.right && 
      gameState.ball.y <= gameState.paddles.right + config.paddleHeight) {
    
    // Calculate bounce angle based on where the ball hit the paddle
    const hitPosition = (gameState.ball.y + config.ballSize/2 - gameState.paddles.right) / config.paddleHeight;
    const bounceAngle = (hitPosition - 0.5) * Math.PI * 0.7; // -35° to 35° angle
    
    const speed = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
    const newSpeed = Math.min(speed + config.speedIncrease, config.maxBallSpeed);
    
    gameState.ball.dx = -Math.cos(bounceAngle) * newSpeed;
    gameState.ball.dy = Math.sin(bounceAngle) * newSpeed;
    
    // Ensure ball is moving left
    if (gameState.ball.dx >= 0) {
      gameState.ball.dx = -2; // Minimum leftward velocity
    }
  }
  
  // Scoring: Ball out of bounds on left or right
  if (gameState.ball.x + config.ballSize < 0) {
    // Right player scores
    gameState.score.right += 1;
    checkGameOver();
    resetBall();
  } else if (gameState.ball.x > boardWidth) {
    // Left player scores
    gameState.score.left += 1;
    checkGameOver();
    resetBall();
  }
  
  // Send updated game state to all players
  io.emit('gameState', gameState);
}

// Check if the game is over
function checkGameOver() {
  if (gameState.score.left >= config.maxScore || gameState.score.right >= config.maxScore) {
    const winner = gameState.score.left >= config.maxScore ? 'left' : 'right';
    io.emit('gameOver', { winner });
    gameState.inProgress = false;
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});