export const defaultGameConfig = {
    playersNumber: 2,
    ballSpeed: 1,
    maxBallSpeed: 10,
    ballSize: 10,
    paddleWidth: 10,        // Was paddleHeight (swap dimensions)
    paddleHeight: 100,      // Was paddleWidth (swap dimensions)
    paddleSpeed: 10,
    boardWidth: 800,
    boardHeight: 600,
    scoreToWin: 10,
    FPS: 60
}
// Change from top/bottom to left/right paddle positions
defaultGameConfig.leftPaddleX = defaultGameConfig.boardWidth * 0.05;
defaultGameConfig.rightPaddleX = defaultGameConfig.boardWidth * 0.95 - defaultGameConfig.paddleWidth;

export const gameState = {
    ball: { x: defaultGameConfig.boardWidth/2, y: defaultGameConfig.boardHeight/2, xDir: 0, yDir: 0 }, 
    paddles: { left: defaultGameConfig.boardHeight/2, right: defaultGameConfig.boardHeight/2 }, // Change from up/down to left/right
    score: { mainPlayer: 0, secondPlayer: 0 },  
    boardWidth: defaultGameConfig.boardWidth,          
    boardHeight: defaultGameConfig.boardHeight,  
    inProgress: false,      
    winner: null,     
    ended: false,      
};