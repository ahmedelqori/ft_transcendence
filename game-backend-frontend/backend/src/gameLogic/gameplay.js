import {
  defaultGameConfig,
  boardCenter,
  Game,
  createGameLoop,
} from "./gameConfig.js";
import { fastify } from "../server.js";
// import { validateSocketConnection } from "../middlewares/auth.middleware.js";
const gameLoops = new Map(); // Map<gameId, {interval, callback, running, gameState}>
const buttomBoard = 0;
const topBoard = 100;
const leftBoard = 0;
const rightBoard = 100;

export function startGameLoop(gameId, gameState, callback) {
  fastify.log.info(`Starting game loop for game ${gameId}`);
  if (gameLoops.has(gameId)) {
    const existingLoop = gameLoops.get(gameId);
    clearInterval(existingLoop.interval);
  }
  const gameLoop = createGameLoop(gameState, callback);
  const frameTime = 1000 / defaultGameConfig.FPS;
  gameLoop.interval = setInterval(() => {
    if (gameLoop.running) {
      updateBallPosition(gameLoop.gameState);
      if (gameLoop.callback) {
        gameLoop.callback(gameLoop.gameState);
      }
    }
  }, frameTime);
  gameLoops.set(gameId, gameLoop);
}

export function stopGameLoop(gameId) {
  const gameLoop = gameLoops.get(gameId);
  if (!gameLoop) {
    fastify.log.warn(
      `Attempted to stop non-existent game loop for game ${gameId}`
    );
    return;
  }
  clearInterval(gameLoop.interval);
  gameLoops.delete(gameId);
  fastify.log.info(`Game loop stopped for game ${gameId}`);
}

export function reconnecting(gameId) {
  const gameLoop = gameLoops.get(gameId);
  if (!gameLoop) {
    fastify.log.warn(
      `Attempted to handle reconnection for non-existent game loop ${gameId}`
    );
    return;
  }
  gameLoop.running = false;
  gameLoop.gameState.state = Game.RECONNECT;
  fastify.log.info(`Game ${gameId} set to reconnection state`);
}

export function pauseGame(gameId) {
  const gameLoop = gameLoops.get(gameId);
  if (!gameLoop) {
    fastify.log.warn(
      `Attempted to pause non-existent game loop for game ${gameId}`
    );
    return;
  }
  gameLoop.running = false;
  fastify.log.info(`Game ${gameId} paused`);
}

export function resumeGame(gameId) {
  const gameLoop = gameLoops.get(gameId);
  if (!gameLoop) {
    fastify.log.warn(
      `Attempted to resume non-existent game loop for game ${gameId}`
    );
    return;
  }
  gameLoop.running = true;
  fastify.log.info(`Game ${gameId} resumed`);
}

// ************************** GAMEPLAY CORE LOGIQUE **************************

export function resetBallAndPaddles(gameState) {
  const speed = defaultGameConfig.ballSpeed;
  let angleDeg = 30 + Math.random() * 30;
  if (Math.random() < 0.5) {
    angleDeg = 180 - angleDeg;
  }
  const angleRad = angleDeg * (Math.PI / 180);
  let xDir = Math.cos(angleRad) * speed;
  let yDir = Math.sin(angleRad) * speed;
  if (Math.random() < 0.5) yDir = -yDir;
  gameState.ball = {
    x: boardCenter,
    y: boardCenter,
    xDir,
    yDir,
  };
  gameState.paddles.left = boardCenter;
  gameState.paddles.right = boardCenter;
}

export function updateBallPosition(gameState) {
  if (gameState.state != Game.IN_PLAY) return;
  gameState.ball.x += gameState.ball.xDir;
  gameState.ball.y += gameState.ball.yDir;

  const ballRadius = defaultGameConfig.ballSize / 2;

  if (gameState.ball.y - ballRadius <= buttomBoard) {
    gameState.ball.yDir = Math.abs(gameState.ball.yDir);
    gameState.ball.y = ballRadius;
  } else if (gameState.ball.y + ballRadius >= topBoard) {
    gameState.ball.yDir = -Math.abs(gameState.ball.yDir);
    gameState.ball.y = topBoard - ballRadius;
  }

  checkPaddleCollisions(gameState);
  checkScoring(gameState);
}

export function checkPaddleCollisions(gameState) {
  const leftPaddleX = defaultGameConfig.leftPaddleX;
  const rightPaddleX =
    defaultGameConfig.rightPaddleX - defaultGameConfig.paddleWidth;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;

  const collisionLeftPaddle =
    gameState.ball.xDir < leftBoard &&
    gameState.ball.x - ballRadius <=
      leftPaddleX + defaultGameConfig.paddleWidth &&
    gameState.ball.x + ballRadius >= leftPaddleX &&
    gameState.ball.y + ballRadius >=
      gameState.paddles.left - paddleHalfHeight &&
    gameState.ball.y - ballRadius <= gameState.paddles.left + paddleHalfHeight;

  const collisionRightPaddle =
    gameState.ball.xDir > leftBoard &&
    gameState.ball.x + ballRadius >= rightPaddleX &&
    gameState.ball.x - ballRadius <=
      rightPaddleX + defaultGameConfig.paddleWidth &&
    gameState.ball.y + ballRadius >=
      gameState.paddles.right - paddleHalfHeight &&
    gameState.ball.y - ballRadius <= gameState.paddles.right + paddleHalfHeight;

  if (collisionLeftPaddle) updateAfterPaddleCollision("left", gameState);
  if (collisionRightPaddle) updateAfterPaddleCollision("right", gameState);
}

export function updateAfterPaddleCollision(paddleType, gameState) {
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;
  const ballRadius = defaultGameConfig.ballSize / 2;
  const paddlePos =
    paddleType === "left" ? gameState.paddles.left : gameState.paddles.right;

  let relativeIntersection =
    (gameState.ball.y - (paddlePos - paddleHalfHeight)) /
    defaultGameConfig.paddleHeight;
  relativeIntersection = Math.max(0, Math.min(1, relativeIntersection));

  const bounceAngle = (relativeIntersection - 0.5) * Math.PI * 0.6;

  const aspectAdjustedBounceAngle = Math.atan(
    Math.tan(bounceAngle) * defaultGameConfig.ratio
  );

  const incomingAngle = Math.atan2(gameState.ball.yDir, gameState.ball.xDir);
  const currentSpeed = Math.sqrt(
    gameState.ball.xDir * gameState.ball.xDir +
      gameState.ball.yDir * gameState.ball.yDir
  );
  const newSpeed = Math.min(
    currentSpeed * 1.05,
    defaultGameConfig.maxBallSpeed
  );

  const direction = paddleType === "left" ? 1 : -1;

  const adjustedAngle =
    aspectAdjustedBounceAngle * 0.7 +
    incomingAngle * 0.3 * (direction < 0 ? -1 : 1);

  gameState.ball.xDir = direction * Math.cos(adjustedAngle) * newSpeed;

  gameState.ball.yDir =
    Math.sin(adjustedAngle) * newSpeed * defaultGameConfig.ratio;

  gameState.ball.x =
    paddleType === "left"
      ? defaultGameConfig.leftPaddleX +
        defaultGameConfig.paddleWidth +
        ballRadius +
        0.1
      : defaultGameConfig.rightPaddleX - ballRadius - 0.1;
}

export function checkScoring(gameState) {
  const ballRadius = defaultGameConfig.ballSize / 2;

  if (gameState.ball.x - ballRadius < leftBoard) {
    gameState.score.right += 1;
    resetBallAndPaddles(gameState);
  } else if (gameState.ball.x + ballRadius > rightBoard) {
    gameState.score.left += 1;
    resetBallAndPaddles(gameState);
  }

  if (
    gameState.score.left === defaultGameConfig.scoreToWin ||
    gameState.score.right === defaultGameConfig.scoreToWin
  ) {
    gameState.state = Game.FINISHED;
    gameState.winner =
      gameState.score.left === defaultGameConfig.scoreToWin ? "left" : "right";
  }
}

export function updatePaddlePosition(gameState, userId, position, isPlayerOne) {
  if (typeof position !== "number" || isNaN(position)) {
    return false;
  }

  let newPosition = position;
  const paddleHalfHeight = defaultGameConfig.paddleHeight / 2;

  if (newPosition < paddleHalfHeight) {
    newPosition = paddleHalfHeight;
  } else if (newPosition > topBoard - paddleHalfHeight) {
    newPosition = topBoard - paddleHalfHeight;
  }

  // Debug paddle movement
  fastify.log.debug(
    `Updating paddle: userId=${userId}, isLeft=${isPlayerOne}, position=${newPosition}`
  );

  if (isPlayerOne) {
    gameState.paddles.left = newPosition;
    return true;
  } else {
    gameState.paddles.right = newPosition;
    return true;
  }
}
