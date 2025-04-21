import { GameRenderer } from "./responsive-utils.js";
import { SocketManager } from "./socket-manager.js";

const GAME_STATES = {
  START: 0,
  JOINED: 1,
  IN_PLAY: 2,
  PAUSED: 3,
  RECONNECT: 4,
  CANCELED: 5,
  ERROR: 6,
  FINISHED: 7,
};

// Game variables
let socketManager = null;
let renderer = null;
let animationFrameId = null;
let keysPressed = {};
let keyboardMoveSpeed = 3;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const pauseBtn = document.getElementById("pauseBtn");
const cancelBtn = document.getElementById("cancelBtn");
const statusMessage = document.getElementById("statusMessage");
const playerPositionDisplay = document.getElementById("playerType");
const scoreLeft = document.getElementById("scoreLeft");
const scoreRight = document.getElementById("scoreRight");
const gameStateDisplay = document.getElementById("gameState");

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("gameId");
  const userId = urlParams.get("userId");

  if (!gameId || !userId) {
    updateStatus("Error: Missing gameId or userId parameters", "error");
    connectBtn.disabled = true;
    return;
  }
  console.log(`Ready to connect. Game ID: ${gameId}, User ID: ${userId}`);
  updateStatus(`Ready to connect. Game ID: ${gameId}, User ID: ${userId}`);

  // Create socket manager and set up event listeners
  socketManager = new SocketManager();
  socketManager.init(gameId, userId);
  setupSocketListeners();

  // Set up UI event listeners
  connectBtn.addEventListener("click", connectToGame);
  disconnectBtn.addEventListener("click", disconnectFromGame);
  cancelBtn.addEventListener("click", cancelGame);
  canvas.addEventListener("mousemove", handleMouseMove);
  pauseBtn.addEventListener("click", togglePauseResume);

  // Handle window resize
  window.addEventListener("resize", async () => {
    if (renderer) {
      renderer.setupResponsiveCanvas();
      await render(); // Re-render after resize
    }
  });

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  // Prevent context menu on right-click
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  await startKeyboardControlLoop();
}

// Set up socket manager event listeners
function setupSocketListeners() {
  // Connection events
  socketManager.addEventListener("onConnect", (data) => {
    updateStatus("Connected to game server");
    updateButtons(true);

    // Log connection success
    console.log("Connected to game server successfully");
  });

  socketManager.addEventListener("onDisconnect", (data) => {
    updateStatus(`Disconnected: ${data.reason || "Connection closed"}`);
    updateButtons(false);

    // Stop animation if running
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  socketManager.addEventListener("onError", (data) => {
    updateStatus(`Error: ${data.message}`, "error");
  });

  // Game state events
  socketManager.addEventListener("onGameState", (data) => {
    if (data.state === "readyToStart") {
      updateStatus("Both players connected, game starting in 2 seconds...");
      console.log(
        "Game ready to start - both players connected. Starting in 2 seconds..."
      );
    }
    console.log(data);
    updateGameStateDisplay();
    updateScores();
  });

  // Player events
  socketManager.addEventListener("onPlayerJoined", (data) => {
    if (data.position) {
      // This is our own join confirmation
      updatePlayerPositionDisplay(socketManager.getPlayerPosition());
      updateStatus(
        `Joined as ${socketManager.getPlayerPosition()} player. ${
          Object.keys(data.players).length
        }/2 players connected.`
      );
      console.log(
        `Successfully joined as ${socketManager.getPlayerPosition()} player.`
      );
      console.log(`Players connected: ${Object.keys(data.players).length}/2`);
    } else {
      // Another player joined
      updateStatus(
        `Player joined. ${
          Object.values(data.players).length
        }/2 players connected.`
      );
      console.log(
        `Another player joined. Players connected: ${
          Object.values(data.players).length
        }/2`
      );
    }
    updateGameStateDisplay();
  });

  // Game flow events
  socketManager.addEventListener("onGameStart", (data) => {
    updateStatus("Game started!");
    console.log("Game started event received!");
    updateGameStateDisplay();
  });

  socketManager.addEventListener("onGamePause", (data) => {
    updateStatus(`Game paused: ${data.message}`);
    updateGameStateDisplay();
  });

  socketManager.addEventListener("onGameResume", (data) => {
    updateStatus(`Game resumed: ${data.message}`);
    updateGameStateDisplay();
  });

  socketManager.addEventListener("onGameFinish", (data) => {
    const gameState = socketManager.getGameState();
    const playerPosition = socketManager.getPlayerPosition();
    const userWon = gameState.winner === playerPosition;
    const winner = userWon ? "You" : "Opponent";
    updateStatus(`Game finished. ${winner} won!`);
    updateGameStateDisplay();
    updateScores();
  });

  // Reconnection events
  socketManager.addEventListener("onReconnect", (data) => {
    if (data.gameState) {
      // We reconnected
      updateStatus(
        `Reconnected to game as ${socketManager.getPlayerPosition()} player`
      );
      updatePlayerPositionDisplay(socketManager.getPlayerPosition());
    } else {
      // Other player reconnected
      updateStatus(`Player reconnected (position: ${data.position})`);
    }
    updateGameStateDisplay();
  });
}

// Connect to WebSocket
async function connectToGame() {
  if (socketManager.isConnected) {
    updateStatus("Already connected or connecting");
    return;
  }

  updateStatus("Connecting...");

  try {
    await socketManager.connect();
    // Connection successful - handled by event listener
    console.log("WebSocket connection successful");
  } catch (error) {
    updateStatus(`Connection failed: ${error.message}`, "error");
    console.error("Connection error:", error);
  }
}

// Disconnect from WebSocket
async function disconnectFromGame() {
  if (socketManager && socketManager.isConnected) {
    updateStatus("Disconnecting...");
    socketManager.disconnect();
  }
}

// Cancel the game (just disconnect)
async function cancelGame() {
  if (socketManager && socketManager.isConnected) {
    await disconnectFromGame();
    updateStatus("Game canceled");
  }
}

// Update player position display
function updatePlayerPositionDisplay(position) {
  if (playerPositionDisplay) {
    playerPositionDisplay.textContent = position;
    console.log(`Updated position display to: ${position}`);
  } else {
    console.warn("playerPositionDisplay element not found");
  }
}

async function startAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  function animate() {
    render();
    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);
}

async function togglePauseResume() {
  if (
    !socketManager ||
    !socketManager.isConnected ||
    !socketManager.getGameState()
  ) {
    updateStatus("Cannot pause/resume: Not connected or no game in progress");
    return;
  }

  const gameState = socketManager.getGameState();

  if (gameState.state === GAME_STATES.IN_PLAY) {
    // Game is running, so pause it
    await socketManager.pauseGame();
    updateStatus("Requesting game pause...");
  } else if (gameState.state === GAME_STATES.PAUSED) {
    // Game is paused, so resume it
    await socketManager.resumeGame();
    updateStatus("Requesting game resume...");
  } else {
    updateStatus(`Cannot pause/resume game in state: ${gameState.state}`);
  }
}

// Handle mouse movement to control paddle
async function handleMouseMove(e) {
  const gameState = socketManager.getGameState();
  const playerPosition = socketManager.getPlayerPosition();

  if (!gameState || gameState.state !== GAME_STATES.IN_PLAY || !playerPosition)
    return;

  // Get mouse Y position in game coordinates
  const rect = canvas.getBoundingClientRect();
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // Constrain to valid range
  const paddlePos = Math.max(0, Math.min(100, y));

  // Send the paddle position update
  await socketManager.sendPaddleMove(paddlePos);
}

// Handle key down events
function handleKeyDown(e) {
  if (!socketManager.isConnected || !socketManager.getGameState()) return;

  // Store which keys are pressed
  keysPressed[e.key] = true;

  // Handle immediate key press for more responsive controls
  if (
    socketManager.getGameState().state === GAME_STATES.IN_PLAY &&
    (e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "w" ||
      e.key === "s")
  ) {
    // Prevent default behavior for arrow keys to avoid page scrolling
    e.preventDefault();

    // Process the key press immediately for better responsiveness
    processKeyboardInput();
  }
}

// Handle key up events
function handleKeyUp(e) {
  // Remove released keys
  delete keysPressed[e.key];
}

// Continuous processing of keyboard inputs
async function startKeyboardControlLoop() {
  // Process keyboard input approximately 20 times per second
  const keyboardInterval = setInterval(async () => {
    const gameState = socketManager?.getGameState();
    if (
      !socketManager?.isConnected ||
      !gameState ||
      gameState.state !== GAME_STATES.IN_PLAY
    ) {
      return; // Skip if not in a game or not playing
    }

    await processKeyboardInput();
  }, 50); // 50ms = 20 times per second

  // Clean up interval on page unload
  window.addEventListener("beforeunload", async () => {
    clearInterval(keyboardInterval);
    if (socketManager && socketManager.isConnected) {
      await socketManager.disconnect();
    }
  });
}

// Process keyboard inputs and move paddle accordingly
async function processKeyboardInput() {
  const gameState = socketManager.getGameState();
  const playerPosition = socketManager.getPlayerPosition();

  if (!gameState || !playerPosition || gameState.state !== GAME_STATES.IN_PLAY)
    return;

  // Determine which paddle we control
  let paddlePos = 50; // Default center position

  if (playerPosition === "left") {
    paddlePos = gameState.paddles.left || 50;
  } else if (playerPosition === "right") {
    paddlePos = gameState.paddles.right || 50;
  } else {
    // Unknown position, can't move paddle
    return;
  }

  // Calculate new position based on pressed keys
  let newPos = paddlePos;
  let moved = false;

  if (keysPressed["ArrowUp"] || keysPressed["w"]) {
    newPos = Math.max(0, paddlePos - keyboardMoveSpeed);
    moved = true;
  } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
    newPos = Math.min(100, paddlePos + keyboardMoveSpeed);
    moved = true;
  }

  // Only send update if position changed
  if (moved && newPos !== paddlePos) {
    await socketManager.sendPaddleMove(newPos);
  }
}

// Update UI buttons based on connection state
function updateButtons(connected) {
  connectBtn.style.display = connected ? "none" : "inline-block";
  disconnectBtn.style.display = connected ? "inline-block" : "none";
  pauseBtn.style.display = connected ? "inline-block" : "none";
  cancelBtn.style.display = connected ? "inline-block" : "none";

  // Update button states based on game state
  if (connected && socketManager.getGameState()) {
    const gameState = socketManager.getGameState();
    pauseBtn.disabled =
      gameState.state !== GAME_STATES.IN_PLAY &&
      gameState.state !== GAME_STATES.PAUSED;
  }
}

// Update status message
function updateStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status " + type;
}

// Update game state display
function updateGameStateDisplay() {
  const gameState = socketManager.getGameState();
  if (!gameState) return;

  const states = [
    "START",
    "JOINED",
    "IN_PLAY",
    "PAUSED",
    "RECONNECT",
    "CANCELED",
    "ERROR",
    "FINISHED",
  ];
  gameStateDisplay.textContent = states[gameState.state];

  // Update button states
  if (gameState.state === GAME_STATES.IN_PLAY) {
    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = false;
    pauseBtn.classList.remove("resume-btn");
    pauseBtn.classList.add("pause-btn");
  } else if (gameState.state === GAME_STATES.PAUSED) {
    pauseBtn.textContent = "Resume";
    pauseBtn.disabled = false;
    pauseBtn.classList.remove("pause-btn");
    pauseBtn.classList.add("resume-btn");
  } else {
    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;
    pauseBtn.classList.remove("resume-btn");
    pauseBtn.classList.add("pause-btn");
  }

  // Initialize renderer if needed and game config is available
  if (
    !renderer &&
    gameState &&
    socketManager &&
    socketManager.getGameConfig()
  ) {
    const gameConfig = socketManager.getGameConfig();
    console.log("Creating renderer with config:", gameConfig);
    renderer = new GameRenderer(canvas, gameConfig, GAME_STATES);
    console.log("Renderer created:", renderer);
    // Start animation loop
    startAnimationLoop();
  }
}

// Update score display
function updateScores() {
  const gameState = socketManager.getGameState();
  if (!gameState || !gameState.score) return;

  // Simple direct access to left/right scores
  const leftVal = gameState.score.left || 0;
  const rightVal = gameState.score.right || 0;

  // Update HTML elements
  if (scoreLeft) scoreLeft.textContent = leftVal;
  if (scoreRight) scoreRight.textContent = rightVal;
}

// Render game on canvas
async function render() {
  const gameState = socketManager.getGameState();
  if (!gameState) {
    console.log("No gameState available for rendering");
    return;
  }
  if (!renderer) {
    console.log("No renderer available");
    return;
  }
  renderer.renderGame(gameState);
}

// Initialize the app
init().catch((error) => {
  console.error("Error during initialization:", error);
  updateStatus("Failed to initialize the game", "error");
});
