import { fastify } from "../server.js";
import axios from 'axios';
import { Agent } from "https";
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

export async function handleTournamentGame(req, reply, playerOneId, playerTwoId, tournementId) {
  fastify.log.info(`Creating tournament game for players ${playerOneId} and ${playerTwoId} in tournament ${tournementId}`);
  
  const tournamentValid = await validateTournament(req, tournementId);
  if (!tournamentValid.ok) {
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
        status: "ACCEPTED",
      }
    });
    try {
      await sendTournamentGameInvitation(req, tournamentGame);
      fastify.log.info(`Tournament game invitation ${tournamentGame.id} sent to players ${playerOneId} and ${playerTwoId}`);      
      return reply.code(201).send({
        ...tournamentGame,
        message: "Tournament game invitation sent successfully to both players"
      });
    } catch (notifError) {
      fastify.log.error(`Failed to send tournament game invitation: ${notifError.message}`);
      return reply.code(500).send({ 
        error: "Failed to send tournament game invitation" 
      });
    }
  } catch (error) {
    fastify.log.error(`Error creating tournament game: ${error.message}`);
    reply.code(403).send({ 
      error: error 
    });
    throw error;
  }
}

export async function handleRegularGame(req, reply, playerTwoId) {
  const playerOneId = req.user.id
  fastify.log.info(`Creating regular game between players ${playerOneId} and ${playerTwoId}`);
  try {
    const areFriends = await checkFriendship(req, playerTwoId);
    if (areFriends.data.status != "friend") {
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
    reply.code(201).send(game)
    sendGameInvitation(req, game)
  } catch (error) {
    fastify.log.error(`Error creating pending game: ${error.message}`);
    return reply.code(500).send({ 
      error: "Failed to create pending game" 
    });
  }
}

async function validateTournament(tournamentId, req) {
  try {
    fastify.log.warn(`in handle tournamenet game$`)
    const response = await axios.get(`https://64.23.191.17/api/tournament/${tournamentId}`, {
      "Authorization": `Bearer ${req.token}`
    });
    if (!response) {
      return reply.code(403).send({ 
        error: "you can not create the Game without permissions" 
      });
    }
    if (response.id == tournamentId && req.user.id == response.owner.id)
      response.ok = true
    else
      response.message = "you can not create the Game without permissions"
    return response
  } catch (error) {
    fastify.log.error(`Tournament validation error: ${error.message}`);
    throw new Error('Tournament service unavailable');
  }
}

async function checkFriendship(req, playerTwoId) {
  try {
    const response = await axios.get(
      `https://64.23.191.17/api/friends/${playerTwoId}`,
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    return response;
  } catch (error) {
    fastify.log.error(`Friendship check error: ${error.message}`);
    throw new Error('Friendship service unavailable');
  }
}

// export default async (req, to, type, payload) => {

//   const token = req.headers.authorization;
//   if (!token) {
//     throw new Error('No token provided');
//   }

//   try {
//     await axios.post(process.env.NOTIFICATION_URL, {
//         to,
//         type,
//         payload
//     }, {
//       headers: {
//         Authorization: token
//       }
//     });
//   } catch (err) {
//     console.error(`Error sending notification: ${err.message}`);
//   }
// };

async function sendGameInvitation(req, game) {
  fastify.log.info(`Sending regular game invitation for game ${game.id} from ${game.playerOneId} to ${game.playerTwoId}`);
  try {
    await axios.post(
      `https://64.23.191.17/api/notif/`,
      {
        to: game.playerTwoId,
        type: "inviteToMatch",
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    return true;
  } catch (error) {
    fastify.log.error(`Error sending regular send game invitation notification: ${error.message}`);
    throw error;
  }
}

async function sendTournamentGameInvitation(req, game) {
  try {
    await axios.post(
      `https://64.23.191.17/api/notif/`,
      {
        to: game.playerOneId,
        type: "joinTournamentGame",
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    await axios.post(
      `https://64.23.191.17/api/notif/`,
      {
        to: game.playerTwoId,
        type: "joinTournamentGame", // to change
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    } catch (error) {
      fastify.log.error(`Error sending tournament game invitation notification to ${game.playerOneId} or ${game.playerTwoId} : ${error.message}`);
      throw error;
    }
}

// export async function notifyGameStatus(gameId, recipientId, accepted) {
//     fastify.log.info(`Sending game status notification for game ${gameId} to ${recipientId}`);
//     const type = accepted ? 'GAME_ACCEPTED' : 'GAME_DECLINED'
//     try {
//       await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
//         type: type,
//         gameId,
//         recipientId,
//         actedID,
//       });
      
//       return true;
//     } catch (error) {
//       fastify.log.error(`Error sending game acceptance notification: ${error.message}`);
//       throw error;
//     }
// }

export const acceptGameInvitation = async function(req, reply) {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const gameId = parseInt(id);
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
    try {
    await axios.post(
      `https://64.23.191.17/api/notif/`,
      {
        to: updatedGame.playerOneId,
        type: "gameAccepted",
        payload: updatedGame,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    } catch (error) {
      fastify.log.error(`Error sending regular game Accept invitation notification: ${error.message}`);
      throw error;
    }
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
  const userId = req.user.id;
  
  try {
    const gameId = parseInt(id);
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
    try {
          await axios.post(
            `https://64.23.191.17/api/notif/`,
            {
              to: game.playerOneId,
              type: "gameDeclined",
              payload: game,
            },
            {
              headers: {
                Authorization: `${req.token}`,
              },
              httpsAgent: new Agent({
                rejectUnauthorized: false,
              }),
            }
          );
    } catch (error) {
      fastify.log.error(`Error sending regular game decline invitation notification: ${error.message}`);
      throw error;
    }
    return reply.code(200).send({
      game,
      message: "Game invitation declined successfully"
    });
  } catch (error) {
    fastify.log.error(`Error declining game: ${error.message}`);
    return reply.code(500).send({ error: "Error declining game" });
  }
};