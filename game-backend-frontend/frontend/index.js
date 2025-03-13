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

    // Keyboard control variables
    let keyState = {
      a: false,
      d: false
    };
    let paddlePosition = gameConfig.boardWidth/2; // Store paddle position locally
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
    
    // Start rendering loop
    renderGame();

function gameLoop() {
    let paddlemoved = false;
    if (gameStarted && !gameState.ended && socket?.connected && playerType) {
        let currentPosition = playerType === 'mainPlayer' ? 
            gameState.paddles.down : gameState.paddles.up
        if (keyState.a){
            currentPosition -= gameConfig.paddleSpeed;
            paddlemoved = true
        }
        if (keyState.d){
            currentPosition += gameConfig.paddleSpeed;
            paddlemoved = true;
        }
        playerType === 'mainPlayer' ? 
            gameState.paddles.down = currentPosition :
            gameState.paddles.up = currentPosition;
        if (paddlemoved)
            socket.emit('paddleMove', currentPosition);
    }
  requestAnimationFrame(gameLoop);
}
    
    // Start game loop
    gameLoop();
    
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => {
        console.log('keydown event:');
      if (event.key.toLowerCase() === 'a') {
        console.log('A key pressed, keyState:', keyState);
        keyState.a = true;
      }
      if (event.key.toLowerCase() === 'd'){ 
        console.log('D key pressed, keyState:', keyState);
        keyState.d = true};
    });
    
    document.addEventListener('keyup', (event) => {
      if (event.key.toLowerCase() === 'a') keyState.a = false;
      if (event.key.toLowerCase() === 'd') keyState.d = false;
    });
    
    // Connect button
    document.getElementById('connect').addEventListener('click', () => {
        console.log('connect button clicked');
      const gameId = document.getElementById('gameId').value;
      const userId = document.getElementById('userId').value;
      
      if (socket) {
        socket.disconnect();
      }
      
      log('info', `Connecting to socket with gameId=${gameId}, userId=${userId}`);
      
      // Create socket connection
      socket = io("http://localhost:3000/socket/game", {
        transports: ["websocket"],
        auth: {
          gameId: gameId,
          userId: userId
        }
      });
      
      // Setup listeners
      socket.on('connect', () => {
        console.log('connected to server');
        log('info', 'Connected to server');
      });
      
      socket.on('disconnect', () => {
        console.log('disconnected from server');
        log('info', 'Disconnected from server');
        gameStarted = false;
      });
      
      socket.on('connect_error', (err) => {
        log('error', `Connection error: ${err.message}`);
      });
      
      socket.on('initGame', (data) => {
        log('receive', data);
        if (data.gameConfig && data.gameState) {
          gameConfig = data.gameConfig;
          gameState = data.gameState;
        }
      });
      
      socket.on('joinedGame', (data) => {
        log('receive', data);
        playerType = data.playerType;
        log('info', `You are playing as ${playerType}`);        
      });
      
      socket.on('playerJoined', (data) => {
        log('receive', data);
      });
      
      socket.on('readyToStart', (data) => {
        log('receive', data);
      });
      
      socket.on('gameStarted', () => {
        log('receive', 'Game started');
        gameStarted = true;
      });
      
      socket.on('gameStateUpdate', (data) => {
        gameState = data;
      });
      
      socket.on('gameOver', (data) => {
        console.log('gameOver event received', data);
        try {
          log('receive', data);
          gameStarted = false;
          gameState.ended = true;
          gameState.winner = data.winner;
          
          const winnerText = data.winner === 'mainPlayer' ? 'Player 1' : 'Player 2';
          document.getElementById('gameStatus').textContent = `Game Over! ${winnerText} wins!`;
          
          // Don't do anything that might cause errors or disconnects
        } catch (err) {
          console.error('Error handling gameOver event:', err);
        }
      });
      
      socket.on('playerDisconnected', (data) => {
        console.log('Player disconnected:', data);  // Fixed the incomplete line
        log('receive', data);
        document.getElementById('gameStatus').textContent = 'Opponent disconnected!';
      });
      
      socket.on('gameError', (data) => {
        log('error', data);
      });
    });
    




    // EVENTS LISTENERS
    document.getElementById('disconnect').addEventListener('click', () => {
      if (socket) {
        socket.disconnect();
        log('info', 'Manually disconnected');
        gameStarted = false;
      }
    });
    
    // Game events
    document.getElementById('joinGame').addEventListener('click', () => {
      if (socket && socket.connected) {
        socket.emit('joinGame');
        log('emit', 'joinGame event sent');
      } else {
        log('error', 'Not connected');
      }
    });
    
    document.getElementById('startGame').addEventListener('click', () => {
      if (socket && socket.connected) {
        socket.emit('startGame');
        log('emit', 'startGame event sent');
      } else {
        log('error', 'Not connected');
      }
    });
    
    document.getElementById('pauseGame').addEventListener('click', () => {
      if (socket && socket.connected) {
        socket.emit('pauseGame');
        log('emit', 'pauseGame event sent');
        gameStarted = false;
      } else {
        log('error', 'Not connected');
      }
    });