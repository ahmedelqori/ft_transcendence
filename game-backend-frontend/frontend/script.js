// DOM Elements
const gameBoard = document.getElementById('game-board');
const leftPaddle = document.getElementById('left-paddle');
const rightPaddle = document.getElementById('right-paddle');
const ball = document.getElementById('ball');
const leftScore = document.getElementById('left-score');
const rightScore = document.getElementById('right-score');
const statusEl = document.getElementById('status');
const startButton = document.getElementById('start-button');
const joinButton = document.getElementById('join-button');
const gameOverScreen = document.getElementById('game-over');
const winnerText = document.getElementById('winner-text');
const restartButton = document.getElementById('restart-button');

// Connect to Socket.io server
const socket = io('http://localhost:3000');
let gameActive = false;
let playerId = null;
let role = null;

// Game board dimensions
const boardWidth = gameBoard.offsetWidth;
const boardHeight = gameBoard.offsetHeight;

// Track mouse position for paddle movement
let mouseY = 0;

// Initialize game
function init() {
    // Set up event listeners
    gameBoard.addEventListener('mousemove', handleMouseMove);
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    startButton.addEventListener('click', startGame);
    joinButton.addEventListener('click', joinGame);
    restartButton.addEventListener('click', requestRestart);

    // Set up socket event listeners
    socket.on('connect', () => {
        statusEl.textContent = 'Connected to server. Waiting for game...';
        playerId = socket.id;
    });

    socket.on('gameState', updateGameState);
    socket.on('gameStart', handleGameStart);
    socket.on('gameOver', handleGameOver);
    socket.on('gameCreated', () => {
        statusEl.textContent = 'Game created! Waiting for opponent...';
        role = 'left';
    });
    
    socket.on('gameJoined', () => {
        statusEl.textContent = 'Joined game! Waiting for host to start...';
        role = 'right';
    });
    
    socket.on('opponentLeft', () => {
        statusEl.textContent = 'Opponent left the game. Waiting for new opponent...';
        gameActive = false;
        gameOverScreen.style.display = 'none';
    });
}

// Handle mouse movement to control paddle
function handleMouseMove(e) {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
    
    // Only send paddle position if game is active
    if (gameActive) {
        sendPaddlePosition();
    }
}

// Handle touch movement for mobile devices
function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const rect = gameBoard.getBoundingClientRect();
        mouseY = e.touches[0].clientY - rect.top;
        
        // Only send paddle position if game is active
        if (gameActive) {
            sendPaddlePosition();
        }
    }
}

// Send paddle position to server
function sendPaddlePosition() {
    // Calculate paddle position with boundaries
    const paddleHeight = role === 'left' ? leftPaddle.offsetHeight : rightPaddle.offsetHeight;
    let paddleY = mouseY - (paddleHeight / 2);
    
    // Prevent paddle from going out of bounds
    if (paddleY < 0) paddleY = 0;
    if (paddleY > boardHeight - paddleHeight) paddleY = boardHeight - paddleHeight;
    
    // Send position to server
    socket.emit('paddleMove', paddleY);
}

// Update game state based on server data
function updateGameState(state) {
    // Update ball position
    ball.style.left = `${state.ball.x}px`;
    ball.style.top = `${state.ball.y}px`;
    
    // Update paddle positions
    leftPaddle.style.top = `${state.paddles.left}px`;
    rightPaddle.style.top = `${state.paddles.right}px`;
    
    // Update scores
    leftScore.textContent = state.score.left;
    rightScore.textContent = state.score.right;
    
    // Add ball rotation
    const rotation = (state.ball.x + state.ball.y) % 360;
    ball.style.transform = `rotate(${rotation}deg)`;
}

// Start a new game (host only)
function startGame() {
    if (role === 'left') {
        socket.emit('startGame');
        startButton.disabled = true;
    }
}

// Join an existing game
function joinGame() {
    socket.emit('joinGame');
    joinButton.disabled = true;
}

// Handle game start event
function handleGameStart() {
    gameActive = true;
    gameOverScreen.style.display = 'none';
    statusEl.textContent = 'Game in progress';
    
    if (role === 'left') {
        joinButton.disabled = true;
    } else {
        startButton.disabled = true;
    }
}

// Handle game over event
function handleGameOver(result) {
    gameActive = false;
    gameOverScreen.style.display = 'flex';
    
    if ((role === 'left' && result.winner === 'left') || 
        (role === 'right' && result.winner === 'right')) {
        winnerText.textContent = 'You Win!';
    } else {
        winnerText.textContent = 'You Lose!';
    }
    
    if (role === 'left') {
        startButton.disabled = false;
    }
}

// Request game restart
function requestRestart() {
    if (role === 'left') {
        socket.emit('restartGame');
    } else {
        statusEl.textContent = 'Waiting for host to restart the game...';
    }
    gameOverScreen.style.display = 'none';
}

// Initialize the game when page loads
window.onload = init;