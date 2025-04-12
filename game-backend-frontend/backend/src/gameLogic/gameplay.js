import { defaultGameConfig, gameState } from "./gameConfig.js";
import {fastify} from '../server.js';

export function resetBallAndPaddles() {
  gameState.ball = {
    x: gameState.boardWidth / 2,
    y: gameState.boardHeight / 2,
    xDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed,
    yDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed
  };
  gameState.paddles.up = gameState.boardWidth / 2;
  gameState.paddles.down = gameState.boardWidth / 2;
}

export function updateBallPosition() {
  if (!gameState.inProgress)
    return;
  gameState.ball.x += gameState.ball.xDir;
  gameState.ball.y += gameState.ball.yDir;

  const ballRadius = defaultGameConfig.ballSize / 2;
    if (gameState.ball.x - ballRadius <= 0) {
        gameState.ball.xDir = -gameState.ball.xDir;
        gameState.ball.x = ballRadius;
    }
    else if (gameState.ball.x + ballRadius >= gameState.boardWidth) {
        gameState.ball.xDir = -gameState.ball.xDir;
        gameState.ball.x = gameState.boardWidth - ballRadius;
    }
  checkPaddleCollisions();
  checkScoring();
}

export function checkPaddleCollisions() {
  const upPaddleY = defaultGameConfig.upPaddleY;
  const downPaddleY = defaultGameConfig.downPaddleY;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddleHalfWidth = defaultGameConfig.paddleWidth / 2;
  const collisionUpPaddle = gameState.ball.yDir < 0 &&
  gameState.ball.y - ballRadius <= upPaddleY + defaultGameConfig.paddleHeight && 
  gameState.ball.y + ballRadius >= upPaddleY &&
  gameState.ball.x + ballRadius >= gameState.paddles.up - paddleHalfWidth && 
  gameState.ball.x - ballRadius <= gameState.paddles.up + paddleHalfWidth
  const collisionDownPaddle = gameState.ball.yDir > 0 &&
  gameState.ball.y + ballRadius >= downPaddleY && 
  gameState.ball.y - ballRadius <= downPaddleY + defaultGameConfig.paddleHeight &&
  gameState.ball.x + ballRadius >= gameState.paddles.down - paddleHalfWidth && 
  gameState.ball.x - ballRadius <= gameState.paddles.down + paddleHalfWidth
  if (collisionUpPaddle)
    updateAfterPaddleCollision('up')
  if (collisionDownPaddle)
        updateAfterPaddleCollision('down')
}

function updateAfterPaddleCollision(paddleType){
  const paddleHalfWidth = defaultGameConfig.paddleWidth / 2;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddlePos = paddleType === 'up' ? gameState.paddles.up : gameState.paddles.down;
  const moveSign = paddleType === 'up' ? 1 : -1
  const collisionPos = (gameState.ball.x - (paddlePos - paddleHalfWidth)) / defaultGameConfig.paddleWidth;
  const bounceAngle = (collisionPos - 0.5) * Math.PI * 0.7;
  const speed = Math.sqrt(gameState.ball.xDir ** 2 + gameState.ball.yDir ** 2);
  const newSpeed = Math.min(speed + 0.5, defaultGameConfig.maxBallSpeed);
  const ballY = paddleType === 'up' ? defaultGameConfig.upPaddleY + defaultGameConfig.paddleHeight + ballRadius
  : defaultGameConfig.downPaddleY - ballRadius;
  gameState.ball.xDir = Math.sin(bounceAngle) * newSpeed;
  gameState.ball.yDir = moveSign * Math.abs(Math.cos(bounceAngle) * newSpeed);
  gameState.ball.y = ballY;
}


export function checkScoring() {
  const ballRadius = defaultGameConfig.ballSize / 2;
  if (gameState.ball.y - ballRadius < 0) {
    gameState.score.secondPlayer += 1;
    resetBallAndPaddles();
  } 
  else if (gameState.ball.y + ballRadius > gameState.boardHeight) {
    gameState.score.mainPlayer += 1;
    resetBallAndPaddles();
  }
  if (gameState.score.mainPlayer === defaultGameConfig.scoreToWin || gameState.score.secondPlayer === defaultGameConfig.scoreToWin){
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
  const paddleHalfWidth = defaultGameConfig.paddleWidth / 2;
  
  let newPosition = position;
  if (newPosition < paddleHalfWidth) {
    newPosition = paddleHalfWidth;
  } else if (newPosition > gameState.boardWidth - paddleHalfWidth) {
    newPosition = gameState.boardWidth - paddleHalfWidth;
  }
  
  if (playerType === 'mainPlayer') {
    gameState.paddles.down = newPosition;
    return true;
  } else if (playerType === 'secondPlayer') {
    gameState.paddles.up = newPosition;
    return true;
  }
  return false;
}