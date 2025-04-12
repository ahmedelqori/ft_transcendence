import { defaultGameConfig, gameState } from "./gameConfig.js";
import {fastify} from '../server.js';

export function resetBallAndPaddles() {
  gameState.ball = {
    x: gameState.boardWidth / 2,
    y: gameState.boardHeight / 2,
    xDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed,
    yDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed
  };
  // Reset paddles to middle position (vertically centered)
  gameState.paddles.left = gameState.boardHeight / 2;
  gameState.paddles.right = gameState.boardHeight / 2;
}

export function updateBallPosition() {
  if (!gameState.inProgress)
    return;
  gameState.ball.x += gameState.ball.xDir;
  gameState.ball.y += gameState.ball.yDir;

  const ballRadius = defaultGameConfig.ballSize / 2;
  
  // Handle top and bottom wall collisions
  if (gameState.ball.y - ballRadius <= 0) {
    gameState.ball.yDir = -gameState.ball.yDir;
    gameState.ball.y = ballRadius;
  }
  else if (gameState.ball.y + ballRadius >= gameState.boardHeight) {
    gameState.ball.yDir = -gameState.ball.yDir;
    gameState.ball.y = gameState.boardHeight - ballRadius;
  }
  
  checkPaddleCollisions();
  checkScoring();
}

export function checkPaddleCollisions() {
  const leftPaddleX = defaultGameConfig.leftPaddleX;
  const rightPaddleX = defaultGameConfig.rightPaddleX;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  
  // Left paddle collision
  const collisionLeftPaddle = gameState.ball.xDir < 0 &&
    gameState.ball.x - ballRadius <= leftPaddleX + defaultGameConfig.paddleWidth && 
    gameState.ball.x + ballRadius >= leftPaddleX &&
    gameState.ball.y + ballRadius >= gameState.paddles.left - paddleHalfHeight && 
    gameState.ball.y - ballRadius <= gameState.paddles.left + paddleHalfHeight;
    
  // Right paddle collision
  const collisionRightPaddle = gameState.ball.xDir > 0 &&
    gameState.ball.x + ballRadius >= rightPaddleX && 
    gameState.ball.x - ballRadius <= rightPaddleX + defaultGameConfig.paddleWidth &&
    gameState.ball.y + ballRadius >= gameState.paddles.right - paddleHalfHeight && 
    gameState.ball.y - ballRadius <= gameState.paddles.right + paddleHalfHeight;
    
  if (collisionLeftPaddle)
    updateAfterPaddleCollision('left');
  if (collisionRightPaddle)
    updateAfterPaddleCollision('right');
}

function updateAfterPaddleCollision(paddleType) {
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddlePos = paddleType === 'left' ? gameState.paddles.left : gameState.paddles.right;
  const moveSign = paddleType === 'left' ? 1 : -1;
  
  // Calculate bounce angle based on where ball hits the paddle (vertical position)
  const collisionPos = (gameState.ball.y - (paddlePos - paddleHalfHeight)) / defaultGameConfig.paddleHeight;
  const bounceAngle = (collisionPos - 0.5) * Math.PI * 0.7;
  
  const speed = Math.sqrt(gameState.ball.xDir ** 2 + gameState.ball.yDir ** 2);
  const newSpeed = Math.min(speed + 0.5, defaultGameConfig.maxBallSpeed);
  
  // Calculate ball position after bounce
  const ballX = paddleType === 'left' 
    ? defaultGameConfig.leftPaddleX + defaultGameConfig.paddleWidth + ballRadius
    : defaultGameConfig.rightPaddleX - ballRadius;
  
  // Update ball direction - key change: x and y are swapped compared to vertical version
  gameState.ball.yDir = Math.sin(bounceAngle) * newSpeed;
  gameState.ball.xDir = moveSign * Math.abs(Math.cos(bounceAngle) * newSpeed);
  gameState.ball.x = ballX;
}

export function checkScoring() {
  const ballRadius = defaultGameConfig.ballSize / 2;
  
  // Ball goes past left edge - second player scores
  if (gameState.ball.x - ballRadius < 0) {
    gameState.score.secondPlayer += 1;
    resetBallAndPaddles();
  } 
  // Ball goes past right edge - main player scores
  else if (gameState.ball.x + ballRadius > gameState.boardWidth) {
    gameState.score.mainPlayer += 1;
    resetBallAndPaddles();
  }
  
  if (gameState.score.mainPlayer === defaultGameConfig.scoreToWin || 
      gameState.score.secondPlayer === defaultGameConfig.scoreToWin) {
    gameState.ended = true;
    gameState.winner = gameState.score.mainPlayer === defaultGameConfig.scoreToWin ? 'mainPlayer' : 'secondPlayer';
  }
}


let intervalId = null;

export function startGameLoop(gameEvent) {
  if (intervalId) 
    return;
  const frameTime = 1000 / defaultGameConfig.FPS;
  gameState.inProgress = true;
  function gameLoop() {
    if (!gameState.inProgress)
      return;
    updateBallPosition();
    gameEvent(gameState);
  }
  intervalId = setInterval(gameLoop, frameTime);
}

export function stopGameLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  gameState.inProgress = false;
}

export function pauseGame() {
  gameState.inProgress = false;
}

export function resumeGame(onUpdate = null) {
  if (!intervalId) {
    startGameLoop(defaultGameConfig.FPS, onUpdate);
  } else {
    gameState.inProgress = true;
  }
}

export function updatePaddlePosition(playerType, position) {
  if (typeof position !== 'number' || isNaN(position)) {
    return false;
  }
  
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  
  let newPosition = position;
  // Keep paddle within vertical bounds
  if (newPosition < paddleHalfHeight) {
    newPosition = paddleHalfHeight;
  } else if (newPosition > gameState.boardHeight - paddleHalfHeight) {
    newPosition = gameState.boardHeight - paddleHalfHeight;
  }
  
  // Update the appropriate paddle
  if (playerType === 'mainPlayer') {
    gameState.paddles.left = newPosition;
    return true;
  } else if (playerType === 'secondPlayer') {
    gameState.paddles.right = newPosition;
    return true;
  }
  return false;
}