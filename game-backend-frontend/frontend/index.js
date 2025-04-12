let socket;
let gameConfig = {
    playersNumber: 2,
    ballSpeed: 5,
    maxBallSpeed: 10,
    ballSize: 10,
    paddleWidth: 100,
    paddleHeight: 10,
    paddleSpeed: 10,
    boardWidth: 800,
    boardHeight: 600,
    scoreToWin: 10,
};
let playerType = null;
let gameState = {
  ball: { x: gameConfig.boardWidth/2, y: gameConfig.boardHeight/2 },
  paddles: { up: gameConfig.boardWidth/2, down: gameConfig.boardWidth/2 },
  score: { mainPlayer: 0, secondPlayer: 0 },
  boardWidth: gameConfig.boardWidth,          
  boardHeight: gameConfig.boardHeight,  
  inProgress: false,
  ended: false,
  winner: null
};
let gameStarted = false;

// Reconnection variables
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;
let currentGameId, currentUserId;

// Keyboard control variables
let keyState = {
  a: false,
  d: false
};
let lastPaddlePosition = null; // Track last position to avoid redundant updates

// Set up global error handler
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // Log the error but don't let it crash the connection
    log('error', `JavaScript error: ${event.message}`);
    return true; // Prevents default handling
});

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Function to log events
function log(type, message) {
  const eventsDiv = document.getElementById('events');
  const now = new Date().toISOString().substr(11, 8);
  const entry = document.createElement('div');
  
  if (typeof message === 'object') {
    entry.innerHTML = `<pre>[${now}] ${type}: ${JSON.stringify(message, null, 2)}</pre>`;
  } else {
    entry.textContent = `[${now}] ${type}: ${message}`;
  }
  
  if (type === 'error') {
    entry.style.color = 'red';
  } else if (type === 'emit') {
    entry.style.color = 'blue';
  } else if (type === 'receive') {
    entry.style.color = 'green';
  }
  
  eventsDiv.appendChild(entry);
  eventsDiv.scrollTop = eventsDiv.scrollHeight;
}

function renderGame() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw center line
  ctx.strokeStyle = '#555';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw paddles
  ctx.fillStyle = '#FFF';
  
  // Top paddle (player 2)
  ctx.fillRect(
    gameState.paddles.up - (gameConfig.paddleWidth / 2),
    10,
    gameConfig.paddleWidth,
    gameConfig.paddleHeight
  );
  
  // Bottom paddle (player 1)
  ctx.fillRect(
    gameState.paddles.down - (gameConfig.paddleWidth / 2),
    canvas.height - 20,
    gameConfig.paddleWidth,
    gameConfig.paddleHeight
  );
  
  // Draw ball
  ctx.beginPath();
  ctx.arc(
    gameState.ball.x,
    gameState.ball.y,
    gameConfig.ballSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = '#FFF';
  ctx.fill();
  ctx.closePath();
  
  // Update scoreboard
  document.getElementById('score1').textContent = gameState.score.mainPlayer;
  document.getElementById('score2').textContent = gameState.score.secondPlayer;
  
  // Update game status
  if (gameState.ended) {
    const winner = gameState.winner === 'mainPlayer' ? 'Player 1' : 'Player 2';
    document.getElementById('gameStatus').textContent = `Game Over! ${winner} wins!`;
    document.getElementById('gameStatus').style.color = '#4CAF50';
  } else if (gameStarted) {
    document.getElementById('gameStatus').textContent = 'Game in progress';
    document.getElementById('gameStatus').style.color = '#2196F3';
  } else {
    document.getElementById('gameStatus').textContent = 'Waiting for game to start';
    document.getElementById('gameStatus').style.color = '#FF9800';
  }
  
  // Request next frame
  requestAnimationFrame(renderGame);
}

function gameLoop() {
  let paddleMoved = false;
  if (gameStarted && !gameState.ended && socket && socket.readyState === WebSocket.OPEN && playerType) {
    let currentPosition = playerType === 'mainPlayer' ? 
        gameState.paddles.down : gameState.paddles.up;
    
    // Store original position to detect movement
    const originalPosition = currentPosition;
    
    // Apply keyboard input
    if (keyState.a) {
      currentPosition -= gameConfig.paddleSpeed;
      paddleMoved = true;
    }
    if (keyState.d) {
      currentPosition += gameConfig.paddleSpeed;
      paddleMoved = true;
    }
    
    // Keep paddle within bounds
    currentPosition = Math.max(gameConfig.paddleWidth / 2, 
               Math.min(canvas.width - gameConfig.paddleWidth / 2, currentPosition));
    
    // Update local state first for immediate visual feedback
    if (playerType === 'mainPlayer') {
      gameState.paddles.down = currentPosition;
    } else {
      gameState.paddles.up = currentPosition;
    }
    
    // Only send if the position changed
    if (paddleMoved && currentPosition !== lastPaddlePosition) {
      sendMessage({
        type: 'paddleMove',
        position: currentPosition
      });
      lastPaddlePosition = currentPosition;
    }
  }
  
  requestAnimationFrame(gameLoop);
}

// WebSocket connection handling
function connectWebSocket(gameId, userId) {
  if (socket) {
    socket.close();
  }
  
  // Store these for potential reconnection
  currentGameId = gameId;
  currentUserId = userId;
  
  log('info', `Connecting WebSocket with gameId=${gameId}, userId=${userId}`);
  
  socket = new WebSocket(`ws://localhost:3000/ws/game/${gameId}/${userId}`);
  
  // Set up heartbeat
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  let heartbeatTimer;
  
  function heartbeat() {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = setTimeout(() => {
      log('warn', 'Connection seems dead - reconnecting...');
      socket.close();
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        log('info', `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        connectWebSocket(currentGameId, currentUserId);
      } else {
        log('error', 'Maximum reconnection attempts reached');
      }
    }, HEARTBEAT_INTERVAL + 5000);
  }
  
  // Connection opened
  socket.addEventListener('open', (event) => {
    log('info', 'Connected to server');
    reconnectAttempts = 0;
    heartbeat(); // Start heartbeat
    
    // You need to explicitly join a game now
    sendMessage({
      type: 'joinGame'
    });
  });
  
  // Connection closed
  socket.addEventListener('close', (event) => {
    log('info', `WebSocket disconnected with code: ${event.code}`);
    clearTimeout(heartbeatTimer);
    
    if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      log('info', `Attempting to reconnect (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(currentGameId, currentUserId);
      }, RECONNECT_DELAY);
    }
  });
  
  // Connection error
  socket.addEventListener('error', (error) => {
    log('error', `WebSocket error: ${error}`);
  });
  
  // Listen for messages
  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      handleMessage(message);
      heartbeat(); // Reset heartbeat timer when message is received
    } catch (error) {
      log('error', `Error parsing message: ${error}`);
    }
  });
}

// Send message helper
function sendMessage(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    log('error', 'WebSocket not connected');
  }
}

// Handle incoming messages
function handleMessage(message) {
  const { type, data } = message;
  
  switch (type) {
    case 'initGame':
      gameConfig = data.gameConfig;
      gameState = data.gameState;
      log('receive', data);
      break;
      
    case 'joinedGame':
      playerType = data.playerType;
      log('receive', data);
      log('info', `You are playing as ${playerType}`);
      document.getElementById('gameStatus').textContent = 'Joined game, waiting for opponent';
      break;
      
    case 'playerJoined':
      log('receive', data);
      document.getElementById('gameStatus').textContent = 'Opponent joined, ready to start';
      break;
      
    case 'readyToStart':
      log('receive', data);
      document.getElementById('gameStatus').textContent = 'Game ready! Press Start Game to begin';
      break;
      
    case 'gameStarted':
      log('receive', 'Game started');
      gameStarted = true;
      gameState.ended = false;
      gameState.winner = null;
      document.getElementById('gameStatus').textContent = 'Game in progress';
      break;
      
    case 'gameStateUpdate':
      gameState = data;
      break;
      
    case 'gameOver':
      log('receive', data);
      gameStarted = false;
      gameState.ended = true;
      gameState.winner = data.winner;
      
      const winnerText = data.winner === 'mainPlayer' ? 'Player 1' : 'Player 2';
      document.getElementById('gameStatus').textContent = `Game Over! ${winnerText} wins!`;
      break;
      
    case 'playerDisconnected':
      log('receive', data);
      document.getElementById('gameStatus').textContent = 'Opponent disconnected!';
      break;
      
    case 'gamePaused':
      log('receive', data);
      gameStarted = false;
      document.getElementById('gameStatus').textContent = data.reason === 'playerDisconnected' ? 
        'Game paused: Waiting for player to reconnect...' : 'Game paused';
      break;
      
    case 'gameResumed':
      log('receive', data);
      gameStarted = true;
      document.getElementById('gameStatus').textContent = 'Game in progress';
      break;
      
    case 'reconnectedToGame':
      log('receive', data);
      playerType = data.playerType;
      gameState = data.gameState;
      document.getElementById('gameStatus').textContent = 'Reconnected to game!';
      gameStarted = !data.gameState.ended;
      break;
      
    case 'playerReconnected':
      log('receive', data);
      document.getElementById('gameStatus').textContent = 'Opponent reconnected, game continuing...';
      break;
      
    case 'error':
      log('error', data.message);
      break;
      
    default:
      log('warn', `Unknown message type: ${type}`);
  }
}

// Start rendering loop
renderGame();

// Start game loop
gameLoop();

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'a') {
    keyState.a = true;
  }
  if (event.key.toLowerCase() === 'd') {
    keyState.d = true;
  }
  
  // Prevent scrolling if using game controls
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'a', 'd'].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key.toLowerCase() === 'a') keyState.a = false;
  if (event.key.toLowerCase() === 'd') keyState.d = false;
});

// Mouse controls (if enabled)
canvas.addEventListener('mousemove', (event) => {
  if (!gameStarted || gameState.ended || !playerType || 
      socket?.readyState !== WebSocket.OPEN ||
      !document.getElementById('useMouseControl')?.checked) {
    return;
  }
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  
  // Only send updates when the mouse position changes
  if (mouseX !== lastPaddlePosition) {
    // Update local state first for immediate visual feedback
    if (playerType === 'mainPlayer') {
      gameState.paddles.down = mouseX;
    } else {
      gameState.paddles.up = mouseX;
    }
    
    // Then send to server
    sendMessage({
      type: 'paddleMove',
      position: mouseX
    });
    lastPaddlePosition = mouseX;
  }
});

// UI Event listeners
document.getElementById('connect').addEventListener('click', () => {
  const gameId = document.getElementById('gameId').value;
  const userId = document.getElementById('userId').value;
  connectWebSocket(gameId, userId);
});

document.getElementById('disconnect').addEventListener('click', () => {
  if (socket) {
    socket.close(1000, "Manual disconnect");
    log('info', 'Manually disconnected');
    gameStarted = false;
  }
});

document.getElementById('joinGame').addEventListener('click', () => {
  sendMessage({ type: 'joinGame' });
  log('emit', 'joinGame event sent');
});

document.getElementById('startGame').addEventListener('click', () => {
  sendMessage({ type: 'startGame' });
  log('emit', 'startGame event sent');
});

document.getElementById('paddleMove').addEventListener('click', () => {
  const position = Math.floor(Math.random() * canvas.width);
  
  // Update local state first
  if (playerType === 'mainPlayer') {
    gameState.paddles.down = position;
  } else if (playerType === 'secondPlayer') {
    gameState.paddles.up = position;
  }
  
  sendMessage({ 
    type: 'paddleMove', 
    position: position 
  });
  
  lastPaddlePosition = position;
  log('emit', `paddleMove event sent with position: ${position}`);
});

document.getElementById('pauseGame').addEventListener('click', () => {
  sendMessage({ type: 'pauseGame' });
  log('emit', 'pauseGame event sent');
  gameStarted = false;
});

// Add window focus/blur handling for key states
window.addEventListener('blur', () => {
  // Clear all key states when window loses focus
  keyState.a = false;
  keyState.d = false;
});

// Add periodic ping to check connection health
setInterval(() => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Send a ping message through the WebSocket
    sendMessage({ type: 'ping', timestamp: Date.now() });
  }
}, 5000);