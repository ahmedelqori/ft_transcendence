
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
    ball: { x: defaultGameConfig.boardWidth/2, y: defaultGameConfig.boardHeight/2, xDir: 0, yDir: 0 }, 
    paddles: { up: defaultGameConfig.boardWidth/2, down: defaultGameConfig.boardWidth/2 }, 
    score: { mainPlayer: 0, secondPlayer: 0 },  
    boardWidth: defaultGameConfig.boardWidth,          
    boardHeight: defaultGameConfig.boardHeight,  
    inProgress: false,      
    winner: null,     
    ended: false,      
};

