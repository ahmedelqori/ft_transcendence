import { fastify } from "../server.js";
import axios from 'axios';

export async function handleLocalGame(req, reply, playerOneId) {
  fastify.log.info(`Creating a local game for player ${playerOneId}`);
  
  try {
    const localGame = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId: 0,
        tournementId: 0,
        status: "ACCEPTED",
        startedAt: new Date()
      }
    });
    fastify.log.info(`Local game ${localGame.id} created for player ${playerOneId}`);
    return reply.code(201).send(localGame);
  } catch (error) {
    fastify.log.error(`Error creating local game: ${error.message}`);
    throw error;
  }
}

export async function handleTournamentGame(req, reply, playerOneId, playerTwoId, tournementId, adminId) {
  fastify.log.info(`Creating tournament game for players ${playerOneId} and ${playerTwoId} in tournament ${tournementId}`);
  
  const tournamentValid = await validateTournament(tournementId, adminId, playerOneId, playerTwoId);
  //wait for response
  if (!tournamentValid) {
    fastify.log.warn(`Tournament validation failed: ${tournamentValid.message}`);
    return reply.code(403).send({ 
      error: tournamentValid.message || "Tournament validation failed" 
    });
  }
  
  try {
    const tournamentGame = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId,
        tournementId,
        status: "PENDING",
        createdAt: Date.now(),
      }
    });
    
    try {
      await sendTournamentGameInvitation(
        tournamentGame.id,
        adminId,
        playerOneId,
        playerTwoId,
        tournementId
      );
      
      fastify.log.info(`Tournament game invitation ${tournamentGame.id} sent to players ${playerOneId} and ${playerTwoId}`);
      
      return reply.code(201).send({
        ...tournamentGame,
        message: "Tournament game invitation sent successfully to both players"
      });
    } catch (notifError) {
      fastify.log.error(`Failed to send tournament game invitation: ${notifError.message}`);
      await req.server.prisma.game.delete({
        where: { id: tournamentGame.id }
      });
      return reply.code(500).send({ 
        error: "Failed to send tournament game invitation" 
      });
    }
  } catch (error) {
    fastify.log.error(`Error creating tournament game: ${error.message}`);
    throw error;
  }
}

export async function handleRegularGame(req, reply, playerOneId, playerTwoId) {
  fastify.log.info(`Creating regular game between players ${playerOneId} and ${playerTwoId}`);
  
  try {
    const areFriends = await checkFriendship(playerOneId, playerTwoId);
    if (!areFriends) {
      fastify.log.warn(`Players ${playerOneId} and ${playerTwoId} are not friends`);
      return reply.code(403).send({ 
        error: "You can only invite friends to play non-tournament games" 
      });
    }
  } catch (error) {
    fastify.log.error(`Error checking friendship: ${error.message}`);
    return reply.code(500).send({ 
      error: "Failed to validate friendship status" 
    });
  }

  try {
    const game = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId,
        tournementId: 0,
        status: "PENDING"
      }
    });
    
    try {
      await sendGameInvitation(
        game.id,
        playerOneId,
        playerTwoId
      );
      
      fastify.log.info(`Game invitation for game ${game.id} sent to player ${playerTwoId}`);
      
      return reply.code(202).send({
        ...game,
        message: "Game invitation sent successfully. Waiting for acceptance."
      });
    } catch (notifError) {
      fastify.log.error(`Failed to send game invitation: ${notifError.message}`);
      // Delete the game if notification fails
      await req.server.prisma.game.delete({
        where: { id: game.id }
      });
      return reply.code(500).send({ 
        error: "Failed to send game invitation" 
      });
    }
  } catch (error) {
    fastify.log.error(`Error creating pending game: ${error.message}`);
    return reply.code(500).send({ 
      error: "Failed to create pending game" 
    });
  }
}

async function validateTournament(tournamentId, adminId, playerOneId, playerTwoId) {
  try {
    const response = await axios.get(`${process.env.TOURNAMENT_SERVICE_URL}/validate/tournamentId`, {
      // tournamentId, 
      // adminId,
      // playerOneId,
      // playerTwoId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Tournament validation error:', error.message);
    throw new Error('Tournament service unavailable');
  }
}

async function checkFriendship(playerOneId, playerTwoId) {
  try {
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/friendship`, { 
      userOneId: playerOneId, 
      userTwoId: playerTwoId 
    });
    
    return response.data;
  } catch (error) {
    console.error('Friendship check error:', error.message);
    throw new Error('Friendship service unavailable');
  }
}

async function sendGameInvitation(gameId, senderId, recipientId) {
  fastify.log.info(`Sending regular game invitation for game ${gameId} from ${senderId} to ${recipientId}`);
  
  try {
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
      type: 'GAME_INVITATION',
      gameId,
      senderId,
      recipientId,
      message: 'You have been invited to a game'
    });
    
    return true;
  } catch (error) {
    fastify.log.error(`Error sending regular game invitation notification: ${error.message}`);
    throw error;
  }
}

async function sendTournamentGameInvitation(gameId, senderId, playerOneId, playerTwoId, tournamentId) {
  fastify.log.info(`Sending tournament game invitation for game ${gameId} from admin ${senderId} to players ${playerOneId} and ${playerTwoId}`);
  
  try {
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'TOURNAMENT_GAME_INVITATION',
        tournamentId,
        gameId,
        senderId,
        recipientId: playerOneId,
        opponentId: playerTwoId,
        message: `You have been assigned to a tournament game in tournament ${tournamentId}`
    });
    
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'TOURNAMENT_GAME_INVITATION',
        tournamentId,
        gameId,
        senderId,
        recipientId: playerTwoId,
        opponentId: playerOneId,
        message: `You have been assigned to a tournament game in tournament ${tournamentId}`
    });
    return true;
  } catch (error) {
    fastify.log.error(`Error sending tournament game invitation notifications: ${error.message}`);
    throw error;
  }
}

export async function notifyGameStatus(gameId, recipientId, accepted) {
    fastify.log.info(`Sending game status notification for game ${gameId} to ${recipientId}`);
    const type = accepted ? 'GAME_ACCEPTED' : 'GAME_DECLINED'
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
        type: type,
        gameId,
        recipientId,
        actedID,
      });
      
      return true;
    } catch (error) {
      fastify.log.error(`Error sending game acceptance notification: ${error.message}`);
      throw error;
    }
}
