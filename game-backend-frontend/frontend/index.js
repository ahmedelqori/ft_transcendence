import { GameRenderer } from './responsive-utils.js';

let socket;
let gameId;
let userId;
let playerType;
let gameStarted = false;
let gameConfig = {};
let gameState = {};
let lastPaddlePosition;
let renderer;
let connected = false;
// Key state tracking
const keyState = {
  w: false,
  s: false
};

// DOM elements
const canvas = document.getElementById('gameCanvas');
const eventsContainer = document.getElementById('events');
const gameStatusElement = document.getElementById('gameStatus');

// Connection elements
const gameIdInput = document.getElementById('gameId');
const userIdInput = document.getElementById('userId');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');

// Game control buttons
const joinGameButton = document.getElementById('joinGame');
const startGameButton = document.getElementById('startGame');
const pauseGameButton = document.getElementById('pauseGame');
const cancelGameButton = document.getElementById('cancelGame');
const useMouseControl = document.getElementById('useMouseControl');





function connectWebSocket() {
  if (connected) 
    return;
  gameId = parseInt(gameIdInput.value);
  userId = parseInt(userIdInput.value);
  
  const wsUrl = `ws://localhost:3000/ws/game/${gameId}/${userId}`;
  logEvent('Connecting to', wsUrl);
  try {
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      logEvent('WebSocket connected');
      connected = true;
      renderer = new GameRenderer(canvas, gameConfig);
      renderer.setupResponsiveCanvas();
      document.body.classList.add('connected');
      updateUIState();
    };
    

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (err) {
        logEvent('Error parsing message', err.message);
      }
    };
    
    socket.onclose = () => {
      logEvent('WebSocket disconnected');
      connected = false;
      document.body.classList.remove('connected');
      gameStarted = false;
      updateUIState();
    };
    
    socket.onerror = (error) => {
      logEvent('WebSocket error', error);
      connected = false;
      document.body.classList.remove('connected');
      updateUIState();
    };
    
  } catch (err) {
    logEvent('Connection error', err.message);
  }
}

function disconnectWebSocket() {
  if (!connected || !socket) 
    return;
  
  socket.close();
  connected = false;
  document.body.classList.remove('connected');
  updateUIState();
  logEvent('Disconnected from server');
}

function handleServerMessage(message) {
  logEvent('Received', message.type);
  console.log(message);
  switch (message.type) {
    case 'initGame':
      gameConfig = message.data.gameConfig;
      gameState = message.data.gameState;
      renderer = new GameRenderer(canvas, gameConfig);
      renderer.setupResponsiveCanvas();
      requestAnimationFrame(gameLoop);
      logEvent('Game initialized with config', gameConfig);
      break;
    
    case 'joinedGame':
      playerType = message.data.playerType;
      logEvent('Joined game as', playerType);
      gameStatusElement.textContent = `You are Player ${playerType === 'mainPlayer' ? '1' : '2'}`;
      break;
    
    case 'playerJoined':
      logEvent('Player joined', message.data);
      if (playerType) {
        gameStatusElement.textContent = 'Both players connected. Ready to start!';
      }
      break;
    
    case 'gameStarted':
      gameStarted = true;
      gameState.inProgress = true;
      gameStatusElement.textContent = 'Game in progress!';
      document.querySelector('.game-canvas-container').classList.add('game-active');
      logEvent('Game started');
      break;
    
    case 'gameStateUpdate':
      gameState = message.data;
      break;
    
    case 'gamePaused':
      gameState.inProgress = false;
      gameStatusElement.textContent = 'Game paused';
      logEvent('Game paused', message.data);
      break;
    
    case 'gameResumed':
      gameState.inProgress = true;
      gameStatusElement.textContent = 'Game resumed';
      logEvent('Game resumed', message.data);
      break;
    
    case 'gameOver':
      gameStarted = false;
      gameState.inProgress = false;
      gameState.ended = true;
      
      const winner = message.data.winner === playerType ? 'You' : 'Opponent';
      gameStatusElement.textContent = `Game over! ${winner} won!`;
      document.querySelector('.game-canvas-container').classList.remove('game-active');
      logEvent('Game over', message.data);
      break;
    
    case 'error':
      logEvent('Error', message.message);
      gameStatusElement.textContent = `Error: ${message.message}`;
      break;
      
    default:
      logEvent('Unknown message type', message);
  }
  
  updateUIState();
}

function gameLoop() {
  processInput();
  
  // Render the game
  if (renderer && connected) {
    renderer.renderGame(gameState);
  }
  
  // Update score display
  document.getElementById('score1').textContent = gameState?.score?.mainPlayer || 0;
  document.getElementById('score2').textContent = gameState?.score?.secondPlayer || 0;
  
  requestAnimationFrame(gameLoop);
}

// Process keyboard and mouse input
function processInput() {
  if (!gameStarted || !gameState?.inProgress || !playerType || !connected) {
    return;
  }
  
  let paddleMoved = false;
  let currentPosition = playerType === 'mainPlayer' ? 
      gameState.paddles.left : gameState.paddles.right;
  
  const originalPosition = currentPosition;
  
  // Apply keyboard input (W and S for vertical movement)
  const moveAmount = gameConfig.paddleSpeed;
  
  if (keyState.w) {
    currentPosition -= moveAmount;
    paddleMoved = true;
  }
  if (keyState.s) {
    currentPosition += moveAmount;
    paddleMoved = true;
  }
  
  // Keep paddle within bounds
  const paddleHalfHeight = gameConfig.paddleHeight / 2;
  currentPosition = Math.max(paddleHalfHeight, 
             Math.min(100 - paddleHalfHeight, currentPosition));
  
  // Update local state first
  if (playerType === 'mainPlayer') {
    gameState.paddles.left = currentPosition;
  } else {
    gameState.paddles.right = currentPosition;
  }
  
  // Send update to server
  if (paddleMoved && currentPosition !== lastPaddlePosition) {
    sendMessage({
      type: 'paddleMove',
      position: currentPosition
    });
    lastPaddlePosition = currentPosition;
  }
}

// Send WebSocket message
function sendMessage(data) {
  if (!connected || !socket || socket.readyState !== WebSocket.OPEN) return;
  
  try {
    socket.send(JSON.stringify(data));
    logEvent('Sent', data.type);
  } catch (err) {
    logEvent('Send error', err.message);
  }
}

// Update UI based on game state
function updateUIState() {
  const isConnected = connected && socket?.readyState === WebSocket.OPEN;
  
  // Connection buttons
  connectButton.disabled = isConnected;
  disconnectButton.disabled = !isConnected;
  
  // Game control buttons
  joinGameButton.disabled = !isConnected || playerType;
  startGameButton.disabled = !isConnected || !playerType || gameStarted;
  pauseGameButton.disabled = !isConnected || !gameStarted || !gameState?.inProgress;
  cancelGameButton.disabled = !isConnected || !gameStarted;
}

// Set up all event listeners
function setupEventListeners() {
  // Connection buttons
  connectButton.addEventListener('click', connectWebSocket);
  disconnectButton.addEventListener('click', disconnectWebSocket);
  
  // Game control buttons
  joinGameButton.addEventListener('click', () => {
    if (!connected) return;
    sendMessage({ type: 'joinGame' });
  });
  
  startGameButton.addEventListener('click', () => {
    if (!connected || !playerType) return;
    sendMessage({ type: 'startGame' });
  });
  
  pauseGameButton.addEventListener('click', () => {
    if (!connected || !gameStarted) return;
    sendMessage({ type: 'pauseGame' });
  });
  
  cancelGameButton.addEventListener('click', () => {
    if (!connected || !gameStarted) return;
    sendMessage({ type: 'cancelGame' });
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'w') keyState.w = true;
    if (event.key.toLowerCase() === 's') keyState.s = true;
    
    // Prevent scrolling with game keys
    if (['w', 's', ' ', 'arrowup', 'arrowdown'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });
  
  document.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'w') keyState.w = false;
    if (event.key.toLowerCase() === 's') keyState.s = false;
  });
  
  // Mouse controls
  canvas.addEventListener('mousemove', (event) => {
    if (!gameStarted || !gameState?.inProgress || !playerType || !connected || !useMouseControl.checked) {
      return;
    }
    
    // Convert mouse position to percentage
    const paddlePosition = renderer.handleMouseMove(event);
      // Update local state
      if (playerType === 'mainPlayer') {
        gameState.paddles.left = paddlePosition;
      } else {
        gameState.paddles.right = paddlePosition;
      }
      
      // Send to server
      sendMessage({
        type: 'paddleMove',
        position: paddlePosition
      });
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (renderer) {
      setTimeout(() => {
        renderer.setupResponsiveCanvas();
      }, 100);
    }
  });
  
  // Update UI state initially
  updateUIState();
}

// Start the application
document.addEventListener('DOMContentLoaded', setupEventListeners);
logEvent('Game interface loaded');



function logEvent(event, data) {
  const date = new Date();
  const timeStr = date.toLocaleTimeString();
  const eventElement = document.createElement('div');
  eventElement.innerHTML = `<span style="color:#9af">[${timeStr}]</span> <span style="color:#fd7">${event}</span>`;
  
  if (data) {
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
    eventElement.innerHTML += `: <span style="color:#aaa">${dataStr}</span>`;
  }
  
  eventsContainer.appendChild(eventElement);
  eventsContainer.scrollTop = eventsContainer.scrollHeight;
}