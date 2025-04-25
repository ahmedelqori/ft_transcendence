import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pong Game - Pure Renderer</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="/client.js"></script>
        </body>
      </html>
    `);
  } else if (req.url === "/client.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(fs.readFileSync("client.js", "utf8"));
  }
});

// Game state and constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 8;
const BALL_SPEED = 5;
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

let gameState = {
  ball: {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    speedX: BALL_SPEED,
    speedY: BALL_SPEED,
    color: "#fcd34d",
  },
  leftPaddle: {
    x: 20,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#ddf247",
    score: 0,
    isMovingUp: false,
    isMovingDown: false,
  },
  rightPaddle: {
    x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#ffffff",
    score: 0,
    isMovingUp: false,
    isMovingDown: false,
  },
  fps: 0,
};

// FPS calculation variables
let frameCount = 0;
let lastFpsTime = Date.now();
let lastFrameTime = Date.now();

// const wss = new WebSocketServer({ port: 3002 });
//
// WebSocket setup
const wss = new WebSocketServer({ port: 3003 });
const clients = new Set();

// Game logic
function resetBall() {
  gameState.ball.x = CANVAS_WIDTH / 2;
  gameState.ball.y = CANVAS_HEIGHT / 2;
  gameState.ball.speedX = gameState.ball.speedX > 0 ? -BALL_SPEED : BALL_SPEED;
  gameState.ball.speedY = Math.random() * 6 - 3;
}

function updateGame() {
  // Update paddle positions
  if (gameState.leftPaddle.isMovingUp && gameState.leftPaddle.y > 0) {
    gameState.leftPaddle.y -= PADDLE_SPEED;
  }
  if (
    gameState.leftPaddle.isMovingDown &&
    gameState.leftPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT
  ) {
    gameState.leftPaddle.y += PADDLE_SPEED;
  }
  if (gameState.rightPaddle.isMovingUp && gameState.rightPaddle.y > 0) {
    gameState.rightPaddle.y -= PADDLE_SPEED;
  }
  if (
    gameState.rightPaddle.isMovingDown &&
    gameState.rightPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT
  ) {
    gameState.rightPaddle.y += PADDLE_SPEED;
  }

  // Update ball position
  gameState.ball.x += gameState.ball.speedX;
  gameState.ball.y += gameState.ball.speedY;

  // Wall collision (top and bottom)
  if (
    gameState.ball.y - gameState.ball.radius <= 0 ||
    gameState.ball.y + gameState.ball.radius >= CANVAS_HEIGHT
  ) {
    gameState.ball.speedY = -gameState.ball.speedY;
  }

  // Left paddle collision
  if (
    gameState.ball.x - gameState.ball.radius <=
      gameState.leftPaddle.x + gameState.leftPaddle.width &&
    gameState.ball.y >= gameState.leftPaddle.y &&
    gameState.ball.y <= gameState.leftPaddle.y + gameState.leftPaddle.height &&
    gameState.ball.speedX < 0
  ) {
    gameState.ball.speedX = -gameState.ball.speedX;
    const hitPosition =
      (gameState.ball.y - gameState.leftPaddle.y) / gameState.leftPaddle.height;
    gameState.ball.speedY = 10 * (hitPosition - 0.5);
  }

  // Right paddle collision
  if (
    gameState.ball.x + gameState.ball.radius >= gameState.rightPaddle.x &&
    gameState.ball.y >= gameState.rightPaddle.y &&
    gameState.ball.y <=
      gameState.rightPaddle.y + gameState.rightPaddle.height &&
    gameState.ball.speedX > 0
  ) {
    gameState.ball.speedX = -gameState.ball.speedX;
    const hitPosition =
      (gameState.ball.y - gameState.rightPaddle.y) /
      gameState.rightPaddle.height;
    gameState.ball.speedY = 10 * (hitPosition - 0.5);
  }

  // Score points
  if (gameState.ball.x - gameState.ball.radius <= 0) {
    gameState.rightPaddle.score++;
    resetBall();
  } else if (gameState.ball.x + gameState.ball.radius >= CANVAS_WIDTH) {
    gameState.leftPaddle.score++;
    resetBall();
  }

  // Calculate FPS
  frameCount++;
  const currentTime = Date.now();
  if (currentTime - lastFpsTime >= 1000) {
    gameState.fps = frameCount;
    frameCount = 0;
    lastFpsTime = currentTime;
  }
}

// Send game state to all clients
function broadcastGameState() {
  const message = JSON.stringify(gameState);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Game loop using setInterval for precise timing
let gameLoop;
function startGameLoop() {
  gameLoop = setInterval(() => {
    const now = Date.now();
    const delta = now - lastFrameTime;

    if (delta >= FRAME_INTERVAL) {
      updateGame();
      broadcastGameState();
      lastFrameTime = now - (delta % FRAME_INTERVAL);
    }
  }, 1);
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`New client connected. Active clients: ${clients.size}`);

  // Send initial game state
  ws.send(JSON.stringify(gameState));

  // Handle incoming messages (for receiving control inputs)
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "control") {
      if (data.paddle === "left") {
        gameState.leftPaddle.isMovingUp = data.up;
        gameState.leftPaddle.isMovingDown = data.down;
      } else if (data.paddle === "right") {
        gameState.rightPaddle.isMovingUp = data.up;
        gameState.rightPaddle.isMovingDown = data.down;
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Client disconnected. Active clients: ${clients.size}`);
  });
});

// Start the game loop
startGameLoop();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
