export const boardCenter = 50
export const gameRooms = new Map(); //gameRooms = Map<gameId, defaultGameRoom>
export const connections = new Map(); //connections = Map<gameId, Map<userId, socket>>
export const Game = Object.freeze({
    START : 0,
    JOINED: 1,
    IN_PLAY : 2,
    PAUSED : 3,
    CANCELED : 4,
    FINISHED : 5,
  });

export const defaultGameConfig = {
    playersNumber: 2,
    ballSpeed: 0.1,
    maxBallSpeed: 2,
    ballSize: 2,
    paddleWidth: 1.5,
    paddleHeight: 15,
    paddleSpeed: 2,
    leftPaddleX: 5,
    rightPaddleX: 95,
    scoreToWin: 10,
    FPS: 60,
    ratio: 4/3
}

export function createGameState() {
  return {
    ball: { x: boardCenter, y: boardCenter, xDir: 0, yDir: 0 }, 
    paddles: { left: boardCenter, right: boardCenter },
    score: { mainPlayer: 0, secondPlayer: 0 },  
    boardWidth: 100,
    boardHeight: 100,
    state: Game.START,
    winner: null,
  };
}

export function createGameRoom(gameId) {
  return {
    gameId: gameId,
    players: {},
    disconnectedPlayers: {},
    gameState: createGameState(),
    maxReconnectTime: 100000,
    intentionalDisconnectTime: 1000,
    disconnectTimer: null,
    
    endedAt: null
  };
}

export const WS_CLOSE = {
    NORMAL: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    ABNORMAL_CLOSURE: 1006,
    POLICY_VIOLATION: 1008,
    TOO_LARGE: 1009,
    INTERNAL_ERROR: 1011
};

export function createGameLoop(gameState, callback){
  return ({
    running: true,
    gameState: gameState,
    callback: callback,
    interval: null
  })
}