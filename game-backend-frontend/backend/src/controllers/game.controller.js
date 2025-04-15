import { fastify } from "../server.js";
import { areFriends } from "../middlewares/user.data.js";
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
  fastify.log.info(`Creating game for players ${playerOneId} and ${playerTwoId}`);
  if (req.user?.id !== playerOneId) {
    fastify.log.warn(`User ${req.user?.id} cannot create game as ${playerOneId}`);
    return reply.code(403).send({ 
      error: "You can only create games as yourself"
    });
  }
// NEED TO ADD FRIENDSHIP CHECK
  // if ((playerTwoId != 0 && !areFriends(playerOneId, playerTwoId) && !tournementId) || (playerOneId === playerTwoId)){
  //   fastify.log.warn(`you can not create a non tournement game with players that are not friends`)
  //   return reply.code(403).send({error: "you can only create a game with your friend"})
  // }
  try {
    const game = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId,
        tournementId,
      }
    });
    // NEED TO send notification to the other player !!!!!!
    return reply.code(201).send(game);
  } catch (error) {
    fastify.log.error(`Error creating game between : ${playerOneId} and ${playerTwoId}, ${error.message}`);
    return reply.code(400).send({ error: "Invalid data or missing fields" });
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
      // fastify.io.to(`game_${gameId}`).emit('gameEnded', {
      //   gameId,
      //   status: updatedGame.status,
      //   winner: updatedGame.winnerId
      // });
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
    // if (otherPlayerId !== 0) {
    //   fastify.io.to(`user_${otherPlayerId}`).emit('gameCanceled', {
    //     gameId: game.id,
    //     canceledBy: userId
    //   });
    // }

    return reply.code(200).send(updatedGame);
  } catch (error) {
    fastify.log.error(`Error canceling game ${id}: ${error.message}`);
    return reply.code(500).send({ error: "Error canceling game" });
  }
};

export const acceptGameInvitation = async function(req, reply) {
  const gameId = parseInt(req.params.id);
  const userId = req?.user.id;
  fastify.log.info(`Accepting game ${gameId} request by user ${userId}`);
  try {
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) {
      fastify.log.warn(`Game ${gameId} not found`);
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (game.playerTwoId !== userId) {
      fastify.log.warn(`User ${userId} cannot accept game ${gameId}`);
      return reply.code(403).send({ error: "Not authorized to accept this game" });
    }
    
    if (game.status !== "PENDING") {
      fastify.log.warn(`Cannot accept a ${game.status} game`);
      return reply.code(400).send({ error: `Cannot accept a ${game.status} game` });
    }
    
    const updatedGame = await req.server.prisma.game.update({
      where: { id: gameId },
      data: { 
              status: "ACCEPTED",
              startedAt: new Date()
            }
    });
    
    // fastify.io.to(`user_${game.playerOneId}`).emit('gameAccepted', {
    //   gameId: game.id,
    //   acceptedBy: userId
    // });
    
    return reply.code(200).send(updatedGame);
  } catch (error) {
    fastify.log.error(`Error accepting game ${gameId}: ${error.message}`);
    return reply.code(500).send({ error: "Error accepting game invitation" });
  }
};

export const declineGameInvitation = async function(req, reply) {
  const gameId = parseInt(req.params.id);
  const userId = req?.user.id;
  fastify.log.info(`Declining game ${gameId} request by user ${userId}`);
  try {
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId }

    });
    
    if (!game) {
      fastify.log.warn(`Game ${gameId} not found`);
      return reply.code(404).send({ error: "Game not found" });
    }
    
    if (game.playerTwoId !== userId) {
      fastify.log.warn(`User ${userId} cannot decline game ${gameId}`);
      return reply.code(403).send({ error: "Not authorized to decline this game" });
    }

    if (game.status !== "PENDING") {
      fastify.log.warn(`Cannot decline a ${game.status} game`);
      return reply.code(400).send({ error: `Cannot decline a ${game.status} game` });
    }
    
    const updatedGame = await req.server.prisma.game.update({
      where: { id: gameId },
      data: { status: "DECLINED" }
    });
    
    // fastify.io.to(`user_${game.playerOneId}`).emit('gameDeclined', {
    //   gameId: game.id,
    //   declinedBy: userId
    // });
    
    return reply.code(200).send(updatedGame);
  } catch (error) {
    fastify.log.error(`Error declining game ${gameId}: ${error.message}`);
    return reply.code(500).send({ error: "Error declining game invitation" });
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