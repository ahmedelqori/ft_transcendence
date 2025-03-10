
export const defaultGameConfig = {
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
}
defaultGameConfig.upPaddleY = defaultGameConfig.boardHeight * 0.05;
defaultGameConfig.downPaddleY = defaultGameConfig.boardHeight * 0.95 - defaultGameConfig.paddleHeight;

export const gameState = {
    ball: { x: 0, y: 0, xDir: 0, yDir: 0 }, 
    paddles: { up: 0, down: 0 }, 
    score: { mainPlayer: 0, secondPlayer: 0 },  
    inProgress: false,      
    boardWidth: defaultGameConfig.boardWidth,          
    boardHeight: defaultGameConfig.boardHeight,  
    winner: null,     
    ended: false,      
};

