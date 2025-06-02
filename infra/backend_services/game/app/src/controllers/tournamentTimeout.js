import { fastify } from "../server.js";
import { gameRooms } from "../gameLogic/gameConfig.js";
import axios from "axios";

const TOURNAMENT_GAME_TIMEOUT = 1 * 60 * 1000;
const tournamentGameTimers = new Map();

export function startTournamentGameTimeout(token, gameId) {
  if (gameRooms.has(gameId)) return;
  if (tournamentGameTimers.has(gameId))
    clearTimeout(tournamentGameTimers.get(gameId));
  fastify.log.info(`Starting tournament game timeout timer for game ${gameId} (${TOURNAMENT_GAME_TIMEOUT / 1000} seconds)`);
  const timeoutId = setTimeout(async () => {
    await handleTournamentGameTimeout(token, gameId);
  }, TOURNAMENT_GAME_TIMEOUT);
  tournamentGameTimers.set(gameId, timeoutId);
}

export function clearTournamentGameTimeout(gameId) {
  if (tournamentGameTimers.has(gameId)) {
    clearTimeout(tournamentGameTimers.get(gameId));
    tournamentGameTimers.delete(gameId);
    fastify.log.debug(`Cleared tournament game timeout for game ${gameId}`);
  }
}

async function handleTournamentGameTimeout(token, gameId) {
  try {
    fastify.log.info(`Tournament game timeout triggered for game ${gameId}`);    
    tournamentGameTimers.delete(gameId);
    if (gameRooms.has(gameId)) return;
    const game = await fastify.prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!game || game.status !== "ACCEPTED") return;
    fastify.log.info(`Timing out tournament game ${gameId} - no players connected within ${TOURNAMENT_GAME_TIMEOUT / 1000} seconds`);
    const updateData = {
      endedAt: new Date(),
      playerOneScore: 10,
      playerTwoScore: 0,
      status: "FINISHED",
      winnerId: game.playerOneId
    };

    const updatedGame = await fastify.prisma.game.update({
      where: { id: gameId },
      data: updateData
    });
    fastify.log.info(`Tournament game ${gameId} timed out - defaulting to player ${game.playerOneId} as winner`);
    if (updatedGame.tournementId) {
      try {
        await notifyTournamentGameFinished(token, {...game, ...updatedGame});
        fastify.log.info(`Tournament ${updatedGame.tournementId} notified about timeout in game ${gameId}`);
      } catch (error) {
        fastify.log.error(`Failed to notify tournament service about timeout: ${error.message}`);
      }
    }

  } catch (error) {
    fastify.log.error(`Error handling tournament game timeout for game ${gameId}: ${error.message}`);
  }
}

async function notifyTournamentGameFinished(token, game) {
  try {
    await axios.post(`${process.env.TOURNAMENT_URL}game/finished`, {
      game: game
    }, {
      headers: {
        Authorization: `${token}`,
        // Origin: process.env.ORIGIN
      }
    });
  } catch (error) {
    fastify.log.error(`Error notifying tournament about finished game: ${error.message}`);
    throw error;
  }
}

export function cleanupTournamentGameTimers() {
  for (const [gameId, timerId] of tournamentGameTimers.entries()) {
    clearTimeout(timerId);
    fastify.log.debug(`Cleaned up tournament game timer for game ${gameId}`);
  }
  tournamentGameTimers.clear();
}