import { fastify } from "../server.js";
import axios from "axios";
import { Agent } from "https";
const vaultAgent = new Agent({
  rejectUnauthorized: false
});

export async function handleLocalGame(req, reply, playerOneId) {
  fastify.log.info(`Creating a local game for player ${playerOneId}`);
  try {
    const localGame = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId: 0,
        tournementId: 0,
        status: "ACCEPTED",
        startedAt: new Date(),
      },
    });
    fastify.log.info(`Local game ${localGame.id} created for player ${playerOneId}`);
    return reply.code(201).send(localGame);
  } catch (error) {
    fastify.log.error(`Error creating local game: ${error.message}`);
    throw error;
  }
}

export async function handleTournamentGame(req, reply) {
  const { playerOneId, playerTwoId, tournementId } = req.body;
  fastify.log.info(`Creating tournament game for players ${playerOneId} and ${playerTwoId} in tournament ${tournementId}`);
  const tournamentValid = await validateTournament(req, tournementId);
  if (!tournamentValid.ok) {
    fastify.log.warn(`Tournament validation failed: ${tournamentValid.message}`);
    return reply.code(403).send({error: tournamentValid.message || "Tournament validation failed",});
  }
  try {
    const tournamentGame = await req.server.prisma.game.create({data: {playerOneId, playerTwoId, tournementId, status: "ACCEPTED"}});
    try {
      await sendTournamentGameInvitation(req, tournamentGame);
      fastify.log.info(`Tournament game invitation ${tournamentGame.id} sent to players ${playerOneId} and ${playerTwoId}`);
      return reply.code(201).send({...tournamentGame, message: "Tournament game invitation sent successfully to both players",});
    } catch (notifError) {
      fastify.log.error(`Failed to send tournament game invitation: ${notifError.message}`);
      return reply.code(500).send({error: "Failed to send tournament game invitation",});
    }
  } catch (error) {
    fastify.log.error(`Error creating tournament game: ${error.message}`);
    reply.code(403).send({error: error});
    throw error;
  }
}

export async function handleRegularGame(req, reply, playerTwoId) {
  const playerOneId = req.user.id;
  fastify.log.info(`Creating regular game between players ${playerOneId} and ${playerTwoId}`);
  try {
    const areFriends = await checkFriendship(req, playerTwoId);
    if (areFriends.data.status != "friend") {
      fastify.log.warn(`Players ${playerOneId} and ${playerTwoId} are not friends`);
      return reply.code(403).send({error: "You can only invite friends to play non-tournament games"});
    }
  } catch (error) {
    fastify.log.error(`Error checking friendship: ${error.message}`);
    return reply.code(500).send({error: "Failed to validate friendship status",});
  }

  try {
    const game = await req.server.prisma.game.create({
      data: {
        playerOneId,
        playerTwoId,
        tournementId: 0,
        status: "PENDING",
      },
    });
    reply.code(201).send(game);
    sendGameInvitation(req, game);
  } catch (error) {
    fastify.log.error(`Error creating pending game: ${error.message}`);
    return reply.code(500).send({error: "Failed to create pending game"});
  }
}

async function validateTournament(req, tournamentId) {
  try {
    const response = await axios.get(`${TOURNAMENT_URL}${tournamentId}`,
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: vaultAgent
      }
    );
    if (!response) {
      return reply.code(403).send({error: "you can not create the Game without permissions"});
    }
    fastify.log.warn(response.data);
    if (response.data.id == tournamentId &&req.user.id == response.data.owner.id) {
      response.ok = true;
      console.log(response.ok);
    } else 
        response.message = "you can not create the Game without permissions";
    return response;
  } catch (error) {
    fastify.log.error(`Tournament validation error: ${error.message}`);
    throw new Error("Tournament service unavailable");
  }
}

async function checkFriendship(req, playerTwoId) {
  try {
    const response = await axios.get(`${FRIENDSHIP_URL}${playerTwoId}`,
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: vaultAgent
      }
    );
    return response;
  } catch (error) {
    fastify.log.error(`Friendship check error: ${error.message}`);
    throw new Error("Friendship service unavailable");
  }
}

async function sendGameInvitation(req, game) {
  fastify.log.info(`Sending regular game invitation for game ${game.id} from ${game.playerOneId} to ${game.playerTwoId}`);
  try {
    await axios.post(`${NOTIFICATION_URL}`,
      {
        to: game.playerTwoId,
        type: "inviteToMatch",
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: vaultAgent
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
    await axios.post(`${NOTIFICATION_URL}`,
      {
        to: game.playerOneId,
        type: "joinTournamentGame",
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: vaultAgent
      }
    );
    await axios.post(`${NOTIFICATION_URL}`,
      {
        to: game.playerTwoId,
        type: "joinTournamentGame",
        payload: game,
      },
      {
        headers: {
          Authorization: `${req.token}`,
        },
        httpsAgent: vaultAgent

      }
    );
  } catch (error) {
    fastify.log.error(`Error sending tournament game invitation notification to ${game.playerOneId} or ${game.playerTwoId} : ${error.message}`);
    throw error;
  }
}

export const acceptGameInvitation = async function (req, reply) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const gameId = parseInt(id);
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!game) return reply.code(404).send({ error: "Game not found" });
    if (game.playerTwoId !== userId)
      return reply.code(403).send({ error: "You can only accept games you are invited to" });
    if (game.status !== "PENDING")
      return reply.code(400).send({ error: "This game is not pending acceptance" });
    const updatedGame = await req.server.prisma.game.update({
      where: { id: game.id },
      data: {
        status: "ACCEPTED",
        startedAt: new Date(),
      },
    });
    try {
      await axios.post(`${NOTIFICATION_URL}`,
        {
          to: updatedGame.playerOneId,
          type: "gameAccepted",
          payload: updatedGame,
        },
        {
          headers: {
            Authorization: `${req.token}`,
          },
          httpsAgent: vaultAgent
        }
      );
    } catch (error) {
      fastify.log.error(`Error sending regular game Accept invitation notification: ${error.message}`);
      throw error;
    }
    return reply.code(200).send({...updatedGame, message: "Game accepted successfully",});
  } catch (error) {
    fastify.log.error(`Error accepting game: ${error.message}`);
    return reply.code(500).send({ error: "Error accepting game" });
  }
};

export const declineGameInvitation = async function (req, reply) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const gameId = parseInt(id);
    const game = await req.server.prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!game) return reply.code(404).send({ error: "Game not found" });
    if (game.playerTwoId !== userId)
      return reply.code(403).send({ error: "You can only decline games you are invited to" });
    if (game.status !== "PENDING")
      return reply.code(400).send({ error: "This game is not pending acceptance" });
    await req.server.prisma.game.delete({
      where: { id: game.id },
    });
    try {
      await axios.post(`${NOTIFICATION_URL}`,
        {
          to: game.playerOneId,
          type: "gameDeclined",
          payload: game,
        },
        {
          headers: {
            Authorization: `${req.token}`,
          },
          httpsAgent: vaultAgent
        }
      );
    } catch (error) {
      fastify.log.error(`Error sending regular game decline invitation notification: ${error.message}`);
      throw error;
    }
    return reply.code(200).send({game, message: "Game invitation declined successfully",});
  } catch (error) {
    fastify.log.error(`Error declining game: ${error.message}`);
    return reply.code(500).send({ error: "Error declining game" });
  }
};
