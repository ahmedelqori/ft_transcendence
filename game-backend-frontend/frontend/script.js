// Game elements
const gameBoard = document.getElementById("game-board");
const topPaddle = document.getElementById("top-paddle");
const bottomPaddle = document.getElementById("bottom-paddle");
const ball = document.getElementById("ball");
const gameOverElement = document.getElementById("game-over");
const winnerText = document.getElementById("winner-text");
const statusElement = document.getElementById("status");
const topScoreElement = document.getElementById("top-score");
const bottomScoreElement = document.getElementById("bottom-score");
const inviteButton = document.getElementById("join-button");
const startGameButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

// Game variables
let socket;
let gameId;
let playerType;
let isGameStarted = false;
let boardRect;

// Initialize game
function initGame() {
  console.log("Initializing game...");
  boardRect = gameBoard.getBoundingClientRect();

  // Get game ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  gameId = urlParams.get("gameId");

  if (!gameId) {
    statusElement.textContent =
      "No game ID provided. Please create a new game or join an existing one.";
    startGameButton.style.display = "none";
    inviteButton.textContent = "Create New Game";
    inviteButton.addEventListener("click", createNewGame);
    return;
  }

  // Hide start button initially until both players join
  startGameButton.disabled = false;

  connectToServer();

  // Add event listeners
  gameBoard.addEventListener("mousemove", handleMouseMove);
  gameBoard.addEventListener("touchmove", handleTouchMove, { passive: false });
  inviteButton.addEventListener("click", generateGameLink);
  startGameButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);

  gameOverElement.style.display = "none";
}

// Create a new game
async function createNewGame() {
  try {
    console.log("from createNewGame")
    statusElement.textContent = "Creating new game...";
    // Get token from localStorage or your auth system
    const token = localStorage.getItem("authToken") || "dummyToken";

    const response = await fetch("http://localhost:3000/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userid": "2",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        playerOneId: 1, // Use an actual user ID if available
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`);
    }

    const gameData = await response.json();
    console.log("Game created with ID:", gameData.id);

    // Redirect to the same page with the game ID
    window.location.href = `${window.location.pathname}?gameId=${gameData.id}`;
  } catch (error) {
    console.error("Error creating game:", error);
    statusElement.textContent = `Error creating game: ${error.message}`;
  }
}

function connectToServer() {
  console.log("Connecting to server with gameId:", gameId);
  statusElement.textContent = "Connecting to server...";

  // Get token from localStorage or your auth system
  const token = localStorage.getItem("authToken") || "dummyToken";

  // Connect to the backend server
  socket = io("http://localhost:3000/socket/game", {
    path: "/api/games/live",
    transports: ["websocket"],
    auth: {
      gameId: gameId,
      token: token,
    },
  });

  // Socket event handlers
  socket.on("connect", () => {
    console.log("Connected to server. Socket ID:", socket.id);
    statusElement.textContent = "Connected to server. Joining game...";
    joinGame();
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
    statusElement.textContent = `Connection error: ${err.message}`;
  });

  socket.on("joinedGame", (data) => {
    console.log("Joined game as:", data.playerType);
    playerType = data.playerType;
    statusElement.textContent = `You joined as ${
      playerType === "mainPlayer" ? "Player 1" : "Player 2"
    }. Waiting for opponent...`;

    // Update player names
    if (playerType === "mainPlayer") {
      document.getElementById("player-one-name").textContent = "You";
      document.getElementById("player-two-name").textContent = "Opponent";
    } else {
      document.getElementById("player-one-name").textContent = "Opponent";
      document.getElementById("player-two-name").textContent = "You";
    }

    inviteButton.textContent = "Copy Game Link";
  });

  socket.on("playerJoined", (data) => {
    console.log("Other player joined:", data);
    statusElement.textContent = "Other player joined. Ready to start!";
  });

  socket.on("readyToStart", () => {
    console.log("Ready to start game");
    startGameButton.disabled = false;
    statusElement.textContent =
      "Both players connected. Click Start Game to begin!";
  });

  socket.on("gameStarted", () => {
    console.log("Game started");
    isGameStarted = true;
    statusElement.textContent = "Game in progress";
    startGameButton.style.display = "none";
    inviteButton.style.display = "none";
  });

  socket.on("gameStateUpdate", (gameState) => {
    updateGameState(gameState);
  });

  socket.on("playerDisconnected", (data) => {
    console.log("Player disconnected:", data);
    statusElement.textContent = "Other player disconnected.";
    isGameStarted = false;

    if (gameOverElement.style.display !== "flex") {
      gameOverElement.style.display = "flex";
      winnerText.textContent = "Opponent disconnected";
    }
  });

  socket.on("gameOver", (data) => {
    console.log("Game over:", data);
    handleGameOver(data);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    statusElement.textContent = `Error: ${error.message}`;
  });
}

// Handle mouse movement for paddle control
function handleMouseMove(event) {
  if (!isGameStarted || !playerType) return;

  const boardRect = gameBoard.getBoundingClientRect();
  const relativeX = event.clientX - boardRect.left;
  const paddlePosition = Math.max(0, Math.min(boardRect.width, relativeX));

  movePaddle(paddlePosition);
}

// Handle touch events for mobile
function handleTouchMove(event) {
  if (!isGameStarted || !playerType) return;
  event.preventDefault();

  const touch = event.touches[0];
  const boardRect = gameBoard.getBoundingClientRect();
  const relativeX = touch.clientX - boardRect.left;
  const paddlePosition = Math.max(0, Math.min(boardRect.width, relativeX));

  movePaddle(paddlePosition);
}

// Send paddle position to server
function movePaddle(position) {
  if (!socket || !isGameStarted) return;

  socket.emit("paddleMove", position);

  // Update local paddle position immediately for better user experience
  if (playerType === "mainPlayer") {
    bottomPaddle.style.left = `${position - 50}px`; // Adjust for paddle width
  } else if (playerType === "secondPlayer") {
    topPaddle.style.left = `${position - 50}px`; // Adjust for paddle width
  }
}

// Join the game
function joinGame() {
  if (!socket) return;
  console.log("Emitting joinGame event");
  socket.emit("joinGame");
}

// Generate and copy game link to clipboard
function generateGameLink() {
  const gameUrl = `${window.location.origin}${window.location.pathname}?gameId=${gameId}`;
  console.log("Game link:", gameUrl);

  // Copy to clipboard
  navigator.clipboard
    .writeText(gameUrl)
    .then(() => {
      statusElement.textContent =
        "Game link copied! Share it with your opponent.";
      setTimeout(() => {
        if (!isGameStarted) {
          statusElement.textContent = "Waiting for opponent to join...";
        }
      }, 3000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      statusElement.textContent = `Game link: ${gameUrl}`;
    });
}

// Start the game
function startGame() {
  if (!socket) return;
  console.log("Emitting startGame event");
  socket.emit("startGame");
  startGameButton.disabled = true;
}

// Update game state from server
function updateGameState(state) {
  // Update ball position - center it in the element
  const ballSize = 20; // Should match CSS
  ball.style.left = `${state.ball.x - ballSize / 2}px`;
  ball.style.top = `${state.ball.y - ballSize / 2}px`;

  // Update paddle positions
  const paddleWidth = 100; // Should match CSS
  const halfPaddleWidth = paddleWidth / 2;

  topPaddle.style.left = `${state.paddles.up - halfPaddleWidth}px`;
  bottomPaddle.style.left = `${state.paddles.down - halfPaddleWidth}px`;

  // Update scores
  topScoreElement.textContent = state.score.secondPlayer;
  bottomScoreElement.textContent = state.score.mainPlayer;
}

// Handle game over
function handleGameOver(data) {
  isGameStarted = false;
  gameOverElement.style.display = "flex";

  if (data.winner === playerType) {
    winnerText.textContent = "You Win!";
  } else {
    winnerText.textContent = "You Lose!";
  }

  statusElement.textContent = "Game Over";
}

// Restart the game
function restartGame() {
  window.location.reload();
}

// Initialize when page loads
window.addEventListener("load", initGame);
