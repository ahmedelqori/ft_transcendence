import { defaultGameConfig, gameState, boardCenter, Game } from "./gameConfig.js";
import {fastify} from '../server.js';
import { validateSocketConnection } from "../middlewares/auth.middleware.js";
const buttomBoard = 0
const topBoard = 100
const leftBoard = 0
const rightBoard = 100
let intervalId = null;


export function startGameLoop(broadcastDataToPlayers) {
  if (intervalId) 
    return;
  const frameTime = 1000 / defaultGameConfig.FPS;
  gameState.state = Game.IN_PLAY;
  intervalId = setInterval(() => {
    if (gameState.state != Game.IN_PLAY)
      return;
    updateBallPosition();
    broadcastDataToPlayers(gameState);
  }, frameTime);
}

export function stopGameLoop() {
    clearInterval(intervalId);
    intervalId = null;
}
export function reconnecting(){
  if (intervalId){
    stopGameLoop();
    gameState.state = Game.RECONNECT;
  }
}
export function pauseGame() {
  if (intervalId){
    stopGameLoop();
    gameState.state = Game.PAUSED;
  }
}

export function resumeGame(onUpdate) {
  if (!intervalId) {
    startGameLoop(onUpdate);
  }
}







// ************************** GAMEPLAY CORE LOGIQUE **************************

export function resetBallAndPaddles() {
  gameState.ball = {
    x: boardCenter,
    y: boardCenter,
    xDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed,
    yDir: (Math.random() > 0.5 ? 1 : -1) * defaultGameConfig.ballSpeed
  };
  gameState.paddles.left = boardCenter;
  gameState.paddles.right = boardCenter;
}

export function updateBallPosition() {
  if (gameState.state != Game.IN_PLAY)
    return;
  gameState.ball.x += gameState.ball.xDir;
  gameState.ball.y += gameState.ball.yDir;

  const ballRadius = defaultGameConfig.ballSize / 2;
  
  if (gameState.ball.y - ballRadius <= buttomBoard) {
    gameState.ball.yDir = Math.abs(gameState.ball.yDir);
    gameState.ball.y = ballRadius;
  }
  else if (gameState.ball.y + ballRadius >= topBoard) {
    gameState.ball.yDir = -Math.abs(gameState.ball.yDir);
    gameState.ball.y = topBoard - ballRadius;
  }
  
  checkPaddleCollisions();
  checkScoring();
}

export function checkPaddleCollisions() {
  const leftPaddleX = defaultGameConfig.leftPaddleX;
  const rightPaddleX = defaultGameConfig.rightPaddleX - defaultGameConfig.paddleWidth;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  
  const collisionLeftPaddle = gameState.ball.xDir < leftBoard &&
    gameState.ball.x - ballRadius <= leftPaddleX + defaultGameConfig.paddleWidth && 
    gameState.ball.x + ballRadius >= leftPaddleX &&
    gameState.ball.y + ballRadius >= gameState.paddles.left - paddleHalfHeight && 
    gameState.ball.y - ballRadius <= gameState.paddles.left + paddleHalfHeight;
    
  const collisionRightPaddle = gameState.ball.xDir > leftBoard &&
    gameState.ball.x + ballRadius >= rightPaddleX && 
    gameState.ball.x - ballRadius <= rightPaddleX + defaultGameConfig.paddleWidth &&
    gameState.ball.y + ballRadius >= gameState.paddles.right - paddleHalfHeight && 
    gameState.ball.y - ballRadius <= gameState.paddles.right + paddleHalfHeight;
    
  if (collisionLeftPaddle)
    updateAfterPaddleCollision('left');
  if (collisionRightPaddle)
    updateAfterPaddleCollision('right');
}

export function updateAfterPaddleCollision(paddleType) {
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddlePos = paddleType === 'left' ? gameState.paddles.left : gameState.paddles.right;
  
  let relativeIntersection = (gameState.ball.y - (paddlePos - paddleHalfHeight)) / defaultGameConfig.paddleHeight;
  relativeIntersection = Math.max(0, Math.min(1, relativeIntersection));
  
  const bounceAngle = (relativeIntersection - 0.5) * Math.PI * 0.6;
  
  const aspectAdjustedBounceAngle = Math.atan(Math.tan(bounceAngle) * defaultGameConfig.ratio);
  
  const incomingAngle = Math.atan2(gameState.ball.yDir, gameState.ball.xDir);
  const currentSpeed = Math.sqrt(gameState.ball.xDir * gameState.ball.xDir + gameState.ball.yDir * gameState.ball.yDir);
  const newSpeed = Math.min(currentSpeed * 1.05, defaultGameConfig.maxBallSpeed);
  
  const direction = paddleType === 'left' ? 1 : -1;
  
  const adjustedAngle = aspectAdjustedBounceAngle * 0.7 + (incomingAngle * 0.3 * (direction < 0 ? -1 : 1));
  
  gameState.ball.xDir = direction * Math.cos(adjustedAngle) * newSpeed;
  
  gameState.ball.yDir = Math.sin(adjustedAngle) * newSpeed * defaultGameConfig.ratio;
  
  gameState.ball.x = paddleType === 'left' 
    ? defaultGameConfig.leftPaddleX + defaultGameConfig.paddleWidth + ballRadius + 0.1
    : defaultGameConfig.rightPaddleX - ballRadius - 0.1;
}

export function checkScoring() {
  const ballRadius = defaultGameConfig.ballSize / 2;
  
  if (gameState.ball.x - ballRadius < leftBoard) {
    gameState.score.secondPlayer += 1;
    resetBallAndPaddles();
  } 
  else if (gameState.ball.x + ballRadius > rightBoard) {
    gameState.score.mainPlayer += 1;
    resetBallAndPaddles();
  }
  
  if (gameState.score.mainPlayer === defaultGameConfig.scoreToWin || 
      gameState.score.secondPlayer === defaultGameConfig.scoreToWin) {
    gameState.state = Game.FINISHED;
    gameState.winner = gameState.score.mainPlayer === defaultGameConfig.scoreToWin ? 'mainPlayer' : 'secondPlayer';
  }
}

export function updatePaddlePosition(playerType, position) {
  if (typeof position !== 'number' || isNaN(position)) {
    return false;
  }
  let newPosition = position;
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  
  if (newPosition < paddleHalfHeight) {
    newPosition = paddleHalfHeight;
  } else if (newPosition > topBoard - paddleHalfHeight) {
    newPosition = topBoard - paddleHalfHeight;
  }
  
  if (playerType === 'mainPlayer') {
    gameState.paddles.left = newPosition;
    return true;
  } else if (playerType === 'secondPlayer') {
    gameState.paddles.right = newPosition;
    return true;
  }
  return false;
}