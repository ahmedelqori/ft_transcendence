import { fastify } from "../server.js";
import {handleTournamentGame, handleRegularGame, handleLocalGame} from "./createGame.utils.js";

export const getAllGames = async function(req, reply) {
  fastify.log.info("Fetching all games");
  try {
    const games = await req.server.prisma.game.findMany({
      orderBy: { startedAt: 'desc' }
    });
    return reply.code(200).send(games);
  } catch (error) {
    fastify.log.error(`Error fetching games: ${error.message}`);
    return reply.code(503).send({ error: "Failed to fetch games" });
  }
};


export const getGameById = async function(req, reply) {
  const { id } = req.params;
  fastify.log.info(`Fetching game by ID: ${id}`);
  try {
    const game = await req.server.prisma.game.findUnique({
      where: { id: parseInt(id) }
    });

    if (!game) {
      fastify.log.warn(`Game ${id} not found`);
      return reply.code(404).send({ error: "Game not found" });
    }
    return reply.code(200).send(game);
  } catch (error) {
    fastify.log.error(`Error retrieving game ${id}: ${error.message}`);
    return reply.code(500).send({ error: "Error retrieving game" });
  }
};


export const createGame = async function(req, reply) {
  const { playerOneId, playerTwoId = 0, tournementId = 0 } = req.body;
  // const adminId = req.user?.id;
  // const token = req.token
  
  try {
    if (tournementId != 0)
      return await handleTournamentGame(req, reply, playerOneId, playerTwoId, tournementId);
    
    if (userId !== playerOneId) {
      fastify.log.warn(`User ${userId} cannot create local game as ${playerOneId}`);
      return reply.code(403).send({ 
        error: "You can only create local games as yourself"
      });
    }
    if (playerTwoId == 0)
      return await handleLocalGame(req, reply, playerOneId);
    else {  
      if (playerOneId === playerTwoId) {
        fastify.log.warn(`Player ${playerOneId} cannot play against themselves`);
        return reply.code(400).send({ 
          error: "Player cannot play against themselves" 
        });
      }
      return await handleRegularGame(req, reply, playerOneId, playerTwoId);
    }
  } catch (error) {
    fastify.log.error(`Error in game creation process: ${error.message}`);
    return reply.code(500).send({ error: "Game creation failed" });
  }
};


export const updateGame = async function(req, reply) {
  const gameId = parseInt(req.params.id);
  const updatedData = req.body;
  const userId = req.user.id;
  fastify.log.info(`Updating game ${gameId}`);
  try {
    const currentGame = await req.server.prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!currentGame) {
      fastify.log.warn(`Game ${gameId} not found`);
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (userId !== currentGame.playerOneId && userId !== currentGame.playerTwoId) {
      fastify.log.warn(`User ${userId} cannot update game ${gameId}`);
      return reply.code(403).send({ error: "Not authorized to update this game" });
    }

    if (["FINISHED", "CANCELED"].includes(currentGame.status)) {
      fastify.log.warn(`Cannot modify a ${currentGame.status} game`);
      return reply.code(400).send({
        error: `Cannot modify a ${currentGame.status} game`
      });
    }

    const gameUpdate = {
      ...currentGame,
      ...updatedData
    };
    
    if (["FINISHED", "CANCELED"].includes(gameUpdate.status)) {
      const playerOneScore = parseInt(gameUpdate.playerOneScore);
      const playerTwoScore = parseInt(gameUpdate.playerTwoScore);
      
      if (
        isNaN(playerOneScore) || 
        isNaN(playerTwoScore) || 
        playerOneScore < 0 || 
        playerTwoScore < 0 || 
        (playerOneScore === 0 && playerTwoScore === 0 && gameUpdate.status === "FINISHED")
      ) {
        fastify.log.warn(`Invalid scores for game completion`);
        return reply.code(400).send({
          error: "Invalid scores for game completion"
        });
      }

      if (!gameUpdate.endedAt) {
        gameUpdate.endedAt = new Date();
      }

      gameUpdate.winnerId = 
        gameUpdate.status === "CANCELED" 
          ? -1 
          : (gameUpdate.playerOneScore > gameUpdate.playerTwoScore 
              ? currentGame.playerOneId 
              : currentGame.playerTwoId);
    } 
    else if (gameUpdate.winnerId !== -1) {
      fastify.log.warn(`Cannot set winner for in-progress game`);
      return reply.code(400).send({
        error: "Cannot set winner for in-progress game"
      });
    }

    if (gameUpdate.playerTwoId !== 0 && gameUpdate.playerTwoId === gameUpdate.playerOneId) {
      fastify.log.warn(`Player cannot play against themselves`);
      return reply.code(400).send({ 
        error: "Player cannot play against themselves" 
      });
    }

    const dataToUpdate = {
      playerOneScore: Math.max(gameUpdate.playerOneScore, currentGame.playerOneScore),
      playerTwoScore: Math.max(gameUpdate.playerTwoScore, currentGame.playerTwoScore),
      winnerId: gameUpdate.winnerId,
      endedAt: gameUpdate.endedAt,
      status: gameUpdate.status
    };

    const updatedGame = await req.server.prisma.game.update({
      where: { id: gameId },
      data: dataToUpdate
    });

    if (["FINISHED", "CANCELED"].includes(updatedGame.status)) {
      fastify.log.info(`Game ${gameId} has ended`);
    }

    return reply.code(200).send({ game: updatedGame });
  } catch (error) {
    fastify.log.error(`Error updating game ${gameId}: ${error.message}`);
    return reply.code(500).send({ error: "Error updating game" });
  }
};


export const cancelGame = async function(req, reply) {
  const { id } = req.params;
  const userId = req.user.id;
  fastify.log.info(`Canceling game ${id}`);
  try {
    const game = await req.server.prisma.game.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!game) {
      fastify.log.warn(`Game ${id} not found`);
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (userId !== game.playerOneId && userId !== game.playerTwoId) {
      fastify.log.warn(`User ${userId} cannot cancel game ${id}`);
      return reply.code(403).send({ error: "Not authorized to cancel this game" });
    }
    
    if (["FINISHED", "CANCELED"].includes(game.status)) {
      fastify.log.warn(`Cannot cancel the ${game.id} it is a ${game.status} game`);
      return reply.code(400).send({
        error: `Cannot cancel a ${game.status} game`
      });
    }

    const updatedGame = await req.server.prisma.game.update({
      where: { id: parseInt(id) },
      data: { 
        status: "CANCELED", 
        endedAt: new Date(), 
        winnerId: -1 
      }
    });

    const otherPlayerId = userId === game.playerOneId ? game.playerTwoId : game.playerOneId;

    return reply.code(200).send(updatedGame);
  } catch (error) {
    fastify.log.error(`Error canceling game ${id}: ${error.message}`);
    return reply.code(500).send({ error: "Error canceling game" });
  }
};


export const deleteGame = async function(req, reply) {
  const { id } = req.params;
  fastify.log.info(`Deleting game ${id}`);
  try {
    const game = await req.server.prisma.game.delete({
      where: { id: parseInt(id) }
    });

    return reply.code(200).send(game);
  } catch (error) {
    fastify.log.error(`Error deleting game ${id}: ${error.message}`);
    return reply.code(500).send({ error: "Error deleting game" });
  }
};

export const acceptGameInvitation = async function(req, reply) {
  const { id } = req.params;
  const userId = req?.user.id;
  
  try {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return reply.code(400).send({ error: "Invalid game ID" });
    }
    
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) {
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (game.playerTwoId !== userId) {
      return reply.code(403).send({ error: "You can only accept games you are invited to" });
    }
    
    if (game.status !== "PENDING") {
      return reply.code(400).send({ error: "This game is not pending acceptance" });
    }
    
    const updatedGame = await req.server.prisma.game.update({
      where: { id: game.id },
      data: {
        status: "ACCEPTED",
        startedAt: new Date()
      }
    });
    
    // try {
    //   await notifyGameStatus(
    //     game.id,
    //     game.playerOneId,
    //     userId,
    //     true
    //   );
      
    //   fastify.log.info(`Game ${game.id} accepted by player ${userId}, notified player ${game.playerOneId}`);
    // } catch (notifError) {
    //   fastify.log.error(`Failed to send game acceptance notification: ${notifError.message}`);
    // }
    
    return reply.code(200).send({
      ...updatedGame,
      message: "Game accepted successfully"
    });
  } catch (error) {
    fastify.log.error(`Error accepting game: ${error.message}`);
    return reply.code(500).send({ error: "Error accepting game" });
  }
};

export const declineGameInvitation = async function(req, reply) {
  const { id } = req.params;
  const userId = req?.user.id;
  
  try {
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return reply.code(400).send({ error: "Invalid game ID" });
    }
    
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) {
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (game.playerTwoId !== userId) {
      return reply.code(403).send({ error: "You can only decline games you are invited to" });
    }
    
    if (game.status !== "PENDING") {
      return reply.code(400).send({ error: "This game is not pending acceptance" });
    }
    
    await req.server.prisma.game.delete({
      where: { id: game.id }
    });
    
    // try {
    //   await notifyGameStatus(
    //     game.id,
    //     game.playerOneId,
    //     userId,
    //     false
    //   );
      
    //   fastify.log.info(`Game ${game.id} declined by player ${userId}, notified player ${game.playerOneId}`);
    // } catch (notifError) {
    //   fastify.log.error(`Failed to send game decline notification: ${notifError.message}`);
    // }
    return reply.code(200).send({
      message: "Game invitation declined successfully"
    });
  } catch (error) {
    fastify.log.error(`Error declining game: ${error.message}`);
    return reply.code(500).send({ error: "Error declining game" });
  }
};