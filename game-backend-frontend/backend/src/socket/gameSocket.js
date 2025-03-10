import { Server } from "socket.io";
import { defaultGameConfig, gameState } from "../gameLogic/gameConfig.js";
import {
  startGameLoop,
  updatePaddlePosition,
  resetBallAndPaddles,
  stopGameLoop,
} from "../gameLogic/gameplay.js";

export default function setupGameSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/games/live",
  });

  const gameNamespace = io.of("/socket/game");

  // Store game sessions
  const gameSessions = new Map();

  gameNamespace.on("connection", (socket) => {
    console.log("New connection:", socket.id);
    const { gameId, token } = socket.handshake.auth;

    if (!gameId) {
      console.log("Connection rejected: No game ID");
      socket.disconnect(true);
      return;
    }

    console.log(`Player ${socket.id} connecting to game ${gameId}`);

    // Join the game room
    socket.join(`game:${gameId}`);

    // Create or get game session
    if (!gameSessions.has(gameId)) {
      console.log(`Creating new game session for ${gameId}`);
      gameSessions.set(gameId, {
        players: new Map(),
        gameState: {
          ...JSON.parse(JSON.stringify(gameState)), // Deep clone
          boardWidth: defaultGameConfig.boardWidth,
          boardHeight: defaultGameConfig.boardHeight,
        },
        inProgress: false,
      });
    }

    const session = gameSessions.get(gameId);
    console.log(`Game ${gameId} has ${session.players.size} connected players`);

    // Handle joinGame event
    socket.on("joinGame", () => {
      // Assign player role
      let playerType;

      if (session.players.size === 0) {
        playerType = "mainPlayer";
      } else if (
        session.players.size === 1 &&
        !Array.from(session.players.keys()).includes("secondPlayer")
      ) {
        playerType = "secondPlayer";
      } else {
        socket.emit("error", { message: "Game is full" });
        return;
      }

      // Store player info
      session.players.set(playerType, socket.id);
      socket.data.playerType = playerType;
      socket.data.gameId = gameId;

      console.log(
        `Player ${socket.id} joined as ${playerType} for game ${gameId}`
      );

      // Notify player of successful join
      socket.emit("joinedGame", { playerType });

      // Notify other players
      socket.to(`game:${gameId}`).emit("playerJoined", { playerType });

      // If both players are connected, notify that game is ready to start
      if (session.players.size === 2) {
        console.log(
          `Both players connected for game ${gameId}, ready to start`
        );
        gameNamespace.to(`game:${gameId}`).emit("readyToStart");
      }
    });

    // Handle paddle movement
    socket.on("paddleMove", (position) => {
      if (!socket.data.playerType || !session.inProgress) return;

      // Convert position to number if necessary
      const paddlePos =
        typeof position === "number" ? position : parseFloat(position);
      if (isNaN(paddlePos)) return;

      updatePaddlePosition(socket.data.playerType, paddlePos);
    });

    // Handle game start
    socket.on("startGame", () => {
      if (session.players.size !== 2 || session.inProgress) {
        console.log(
          `Cannot start game ${gameId}: players=${session.players.size}, inProgress=${session.inProgress}`
        );
        return;
      }

      console.log(`Starting game ${gameId}`);
      session.inProgress = true;

      // Reset game state before starting
      resetBallAndPaddles();

      // Notify all players that game has started
      gameNamespace.to(`game:${gameId}`).emit("gameStarted");

      // Start the game loop
      startGameLoop(60, (gameState) => {
        // Send updated game state to all players in the room
        gameNamespace.to(`game:${gameId}`).emit("gameStateUpdate", gameState);

        // Check if game has ended
        if (gameState.ended) {
          stopGameLoop();
          session.inProgress = false;
          gameNamespace.to(`game:${gameId}`).emit("gameOver", {
            winner: gameState.winner,
            score: gameState.score,
          });
        }
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      if (!socket.data.gameId) return;

      const gameSession = gameSessions.get(socket.data.gameId);
      if (!gameSession) return;

      // Remove player from game
      if (socket.data.playerType) {
        gameSession.players.delete(socket.data.playerType);
      }

      // Notify other players
      socket.to(`game:${socket.data.gameId}`).emit("playerDisconnected", {
        playerType: socket.data.playerType,
      });

      // If game was in progress, stop it
      if (gameSession.inProgress) {
        stopGameLoop();
        gameSession.inProgress = false;
      }

      // Clean up empty game sessions after a delay
      setTimeout(() => {
        const session = gameSessions.get(socket.data.gameId);
        if (session && session.players.size === 0) {
          console.log(`Removing empty game session: ${socket.data.gameId}`);
          gameSessions.delete(socket.data.gameId);
        }
      }, 5000);
    });
  });

  return io;
}
