import { GameRenderer } from "./responsive-utils.js";

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
let socket = null;
let gameConfig = null;
let gameState = null;
let gameId = null;
let userId = null;
let playerType = null;
let isConnected = false;
let players = {};
let renderer = null;
let animationFrameId = null;
let keysPressed = {};
let keyboardMoveSpeed = 3;

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const pauseBtn = document.getElementById("pauseBtn");
const cancelBtn = document.getElementById("cancelBtn");
const statusMessage = document.getElementById("statusMessage");
const playerTypeDisplay = document.getElementById("playerType");
const scoreLeft = document.getElementById("scoreLeft");
const scoreRight = document.getElementById("scoreRight");
const gameStateDisplay = document.getElementById("gameState");

// Initialize game - get parameters from URL
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  gameId = urlParams.get("gameId");
  userId = urlParams.get("userId");

  if (!gameId || !userId) {
    updateStatus("Error: Missing gameId or userId parameters", "error");
    connectBtn.disabled = true;
    return;
  }

  updateStatus(`Ready to connect. Game ID: ${gameId}, User ID: ${userId}`);

  // Set up event listeners
  connectBtn.addEventListener("click", connectToGame);
  disconnectBtn.addEventListener("click", disconnectFromGame);
  cancelBtn.addEventListener("click", cancelGame);
  canvas.addEventListener("mousemove", handleMouseMove);
  pauseBtn.addEventListener("click", togglePauseResume);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (renderer) {
      renderer.setupResponsiveCanvas();
      render(); // Re-render after resize
    }
  });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  // Prevent context menu on right-click
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  startKeyboardControlLoop();
}

// Connect to WebSocket
function connectToGame() {
  if (socket) {
    updateStatus("Already connected or connecting");
    return;
  }

  updateStatus("Connecting...");

  // Create WebSocket connection - fix URL to be more flexible
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host =
    window.location.hostname.split(":")[0] == "127.0.0.1"
      ? "localhost:3000"
      : window.location.host;
  const wsUrl = `${protocol}//${host}/ws/game/${gameId}/${userId}`;

  console.log("Connecting to WebSocket:", wsUrl);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    isConnected = true;
    updateStatus("Connected to game server");
    updateButtons(true);
    updateStatus("Reconnected to existing game");
  };

  socket.onclose = (event) => {
    isConnected = false;
    updateStatus(`Disconnected: ${event.reason || "Connection closed"}`);
    updateButtons(false);
    socket = null;

    // Stop animation if it's running
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  socket.onerror = (error) => {
    updateStatus("WebSocket error", "error");
    console.error("WebSocket error:", error);
  };

  socket.onmessage = handleMessage;
}

// Disconnect from WebSocket
function disconnectFromGame() {
  if (socket) {
    updateStatus("Disconnecting...");
    socket.close(1000);
  }
}

// Pause the game
function pauseGame() {
  if (
    socket &&
    isConnected &&
    gameState &&
    gameState.state === GAME_STATES.IN_PLAY
  ) {
    sendMessage({ type: "pauseGame" });
    updateStatus("Requesting game pause...");
  } else {
    updateStatus("Cannot pause game in current state");
  }
}

// Cancel the game
function cancelGame() {
  if (socket && isConnected) {
    disconnectFromGame();
    updateStatus("Game canceled");
  }
}

// Handle incoming WebSocket messages
function handleMessage(event) {
  try {
    const message = JSON.parse(event.data);
    console.log("Received:", message);

    switch (message.type) {
      case "connected":
        // We're connected, now we'll automatically join
        updateStatus("Connected, joining game...");
        break;

      case "initGame":
        gameConfig = message.data.gameConfig;
        gameState = message.data.gameState;
        console.log("InitGame received:", gameConfig, gameState);

        // Initialize the renderer
        if (!renderer && gameConfig) {
          console.log("Creating renderer with config:", gameConfig);
          renderer = new GameRenderer(canvas, gameConfig, GAME_STATES);
          console.log("Renderer created:", renderer);
          // Start animation loop
          startAnimationLoop();
        }

        updateStatus("Game initialized");
        updateGameStateDisplay();
        sendMessage({type: 'joinGame'});
        updateStatus("Initialized, joining game...");
        break;

      case "joinedGame":
        playerType = message.data.playerType;
        gameState = message.data.gameState;
        players = message.data.players;
        playerTypeDisplay.textContent = playerType;
        console.log(`Joined as ${playerType}`);
        updateStatus(
          `Joined as ${playerType}. ${
            Object.keys(players).length
          }/2 players connected.`
        );
        updateGameStateDisplay();
        break;

      case "playerJoined":
        players = message.data.players;
        updateStatus(
          `Player joined. ${Object.values(players).length}/2 players connected.`
        );
        break;

      case "readyToStart":
        gameState = message.data.gameState;
        updateStatus("Both players connected, game starting in 2 seconds...");
        updateGameStateDisplay();
        break;

        case "gameStarted":
          console.log("Game started event received:", message.data);
          gameState = message.data.gameState;
          // Add inProgress flag for renderer
          gameState.inProgress = true;
          updateStatus("Game started!");
          updateGameStateDisplay();
          console.log("Game state after game started:", gameState);
          break;

      case "gameStateUpdate":
        const prevState = gameState ? { ...gameState } : null;
        gameState = message.data;

        // Ensure inProgress flag is set
        gameState.inProgress = gameState.state === GAME_STATES.IN_PLAY;

        // For debugging paddle movement issues
        if (prevState && prevState.paddles && gameState.paddles) {
          const leftChanged = prevState.paddles.left !== gameState.paddles.left;
          const rightChanged =
            prevState.paddles.right !== gameState.paddles.right;

          if (leftChanged || rightChanged) {
            console.log(
              `Paddle update - Left: ${gameState.paddles.left}, Right: ${gameState.paddles.right}`
            );
          }
        }

        updateGameStateDisplay();
        updateScores();
        break;

      case "gamePaused":
        gameState.state = GAME_STATES.PAUSED;
        // Update inProgress flag
        gameState.inProgress = false;
        updateStatus(`Game paused: ${message.data.message}`);
        updateGameStateDisplay();
        break;

      case "gameResumed":
        gameState.state = GAME_STATES.IN_PLAY;
        // Update inProgress flag
        gameState.inProgress = true;
        updateStatus(`Game resumed: ${message.data.message}`);
        updateGameStateDisplay();
        break;

      case "playerReconnected":
        updateStatus(`Player ${message.data.playerType} reconnected`);
        break;

      case "reconnectedToGame":
        gameState = message.data.gameState;
        playerType = message.data.playerType;
        players = message.data.players;
        // Update inProgress flag
        gameState.inProgress = gameState.state === GAME_STATES.IN_PLAY;
        updateStatus(`Reconnected to game as ${playerType}`);
        playerTypeDisplay.textContent = playerType;
        updateGameStateDisplay();
        break;

      case "gameFinished":
        gameState = message.data.gameState;
        // Update flags for renderer
        gameState.inProgress = false;
        gameState.ended = true;
        const winner = gameState.winner === playerType ? "You" : "Opponent";
        updateStatus(`Game finished. ${winner} won!`);
        updateGameStateDisplay();
        updateScores();
        break;

      case "gameCanceled":
        gameState.state = GAME_STATES.CANCELED;
        // Update inProgress flag
        gameState.inProgress = false;
        updateStatus(`Game canceled: ${message.data.message}`);
        updateGameStateDisplay();
        break;

      case "error":
        updateStatus(`Error: ${message.data.message}`, "error");
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    updateStatus("Error processing server message", "error");
  }
}

function startAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  function animate() {
    render();
    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);
}

// Send a message to the server
function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    updateStatus("Cannot send message: Not connected");
  }
}

function togglePauseResume() {
  if (!socket || !isConnected || !gameState) {
    updateStatus("Cannot pause/resume: Not connected or no game in progress");
    return;
  }

  if (gameState.state === GAME_STATES.IN_PLAY) {
    // Game is running, so pause it
    sendMessage({ type: "pauseGame" });
    updateStatus("Requesting game pause...");
  } else if (gameState.state === GAME_STATES.PAUSED) {
    // Game is paused, so resume it
    sendMessage({ type: "resumeGame" });
    updateStatus("Requesting game resume...");
  } else {
    updateStatus(`Cannot pause/resume game in state: ${gameState.state}`);
  }
}

// Handle mouse movement to control paddle
function handleMouseMove(e) {
  if (!gameState || gameState.state !== GAME_STATES.IN_PLAY) 
    return;
  let y;
  y = renderer.convertScreenToGameCoordinates(e).y;
  y = Math.max(0, Math.min(100, y));

  sendMessage({
    type: "paddleMove",
    position: y,
  });
}

// Handle key down events
function handleKeyDown(e) {
  if (!isConnected || !gameState) return;

  // Store which keys are pressed
  keysPressed[e.key] = true;

  // Handle immediate key press for more responsive controls
  if (
    gameState.state === GAME_STATES.IN_PLAY &&
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
function startKeyboardControlLoop() {
  // Process keyboard input approximately 20 times per second
  const keyboardInterval = setInterval(() => {
    if (!isConnected || !gameState || gameState.state !== GAME_STATES.IN_PLAY) {
      return; // Skip if not in a game or not playing
    }

    processKeyboardInput();
  }, 50); // 50ms = 20 times per second

  // Clean up interval on page unload
  window.addEventListener("beforeunload", () => {
    clearInterval(keyboardInterval);
  });
}

// Process keyboard inputs and move paddle accordingly
function processKeyboardInput() {
  if (!gameState || !gameState.state === GAME_STATES.IN_PLAY) return;

  let paddlePos;
  let paddleSide;

  // Map player types from backend to paddle position
  // Backend uses both 'mainPlayer'/'secondPlayer' and 'left'/'right'
  if (playerType === "mainPlayer" || playerType === "left") {
    paddlePos = gameState.paddles?.left || 50;
    paddleSide = "left";
  } else if (playerType === "secondPlayer" || playerType === "right") {
    paddlePos = gameState.paddles?.right || 50;
    paddleSide = "right";
  } else {
    console.log(`Unknown player type: ${playerType}`);
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
    console.log(`Keyboard paddle move (${paddleSide}): ${newPos}`);
    sendMessage({
      type: "paddleMove",
      position: newPos,
    });

    // Update local state for smoother rendering while waiting for server response
    if (paddleSide === "left") {
      gameState.paddles.left = newPos;
    } else {
      gameState.paddles.right = newPos;
    }
  }
}

// Update UI buttons based on connection state
function updateButtons(connected) {
  connectBtn.style.display = connected ? "none" : "inline-block";
  disconnectBtn.style.display = connected ? "inline-block" : "none";
  pauseBtn.style.display = connected ? "inline-block" : "none";
  cancelBtn.style.display = connected ? "inline-block" : "none";

  // Update button states based on game state
  if (connected && gameState) {
    pauseBtn.disabled = gameState.state !== GAME_STATES.IN_PLAY;
  }
}

// Update status message
function updateStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status " + type;
}

// Update game state display
function updateGameStateDisplay() {
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
}

// Update score display
function updateScores() {
  if (!gameState || !gameState.score) return;

  scoreLeft.textContent = gameState.score.mainPlayer;
  scoreRight.textContent = gameState.score.secondPlayer;
}

// Render game on canvas
function render() {
  if (!gameState) {
    console.log("No gameState available for rendering");
    return;
  }
  if (!renderer) {
    console.log("No renderer available");
    return;
  }
  // console.log("Rendering game state:", gameState);
  renderer.renderGame(gameState);
}

// Initialize the app
init();
