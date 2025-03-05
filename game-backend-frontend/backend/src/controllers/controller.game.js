// import Game from "../models/model.game"

export const getAllGames = async function (req, reply) {
  try {
    const games = await req.server.prisma.game.findMany();
    return reply.code(200).send(games);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: "Failed to fetch games" });
  }
};

export const getGameById = async function (req, reply) {
  const { id } = req.params;

  try {
    const game = await req.server.prisma.game.findUnique({
      where: { id: parseInt(id) },
    });

    if (!game) {
      return reply.code(404).send({ error: "Game not found" });
    }

    return reply.code(200).send(game);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: "Error retrieving game" });
  }
};

export const createGame = async function (req, reply) {
  const postedData = req.body;
  // i should validate the players and the tournement IDS from the coresponding services

  const validData = {
    playerOneId: postedData.playerOneId,
    playerTwoId: postedData.playerTwoId || 0,
    tournementId: postedData.tournementId || 0,
  };
  try {
    const game = await req.server.prisma.game.create({
      data: validData,
    });

    return reply.code(201).send(game);
  } catch (error) {
    console.error(error);
    return reply
      .code(400)
      .send({ error: "Invalid data to post or missing fields" });
  }
};

export const updateGame = async (req, reply) => {
  const gameId = parseInt(req.params.id);
  const updatedData = req.body;

  try {
    const currentGame = await req.server.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!currentGame) {
      return reply.code(404).send({ error: "Game not found" });
    }

    if (
      currentGame.status === "FINISHED" ||
      currentGame.status === "CANCELED"
    ) {
      return reply.code(400).send({
        error: `you cannot make changes to a ${currentGame.status} game`,
      });
    }

    const gameUpdate = {
      ...currentGame,
      ...updatedData,
    };
    if (gameUpdate.status === "FINISHED" || gameUpdate.status === "CANCELED") {
      const playerOneScore = parseInt(gameUpdate.playerOneScore);
      const playerTwoScore = parseInt(gameUpdate.playerTwoScore);
      if (
        isNaN(playerOneScore) ||
        isNaN(playerTwoScore) ||
        playerOneScore < 0 ||
        playerTwoScore < 0 ||
        (playerOneScore === 0 &&
          playerTwoScore === 0 &&
          gameUpdate.status === "FINISHED")
      ) {
        return reply.code(400).send({
          error:
            "Scores must be valid integers, positive integers, Both scores cannot be zero",
        });
      }

      if (!gameUpdate.endedAt) {
        gameUpdate.endedAt = new Date();
      }

      gameUpdate.winnerId =
        gameUpdate.playerOneScore > gameUpdate.playerTwoScore &&
        gameUpdate.status === "FINISHED"
          ? currentGame.playerOneId
          : gameUpdate.status === "CANCELED"
          ? -1
          : gameUpdate.playerTwoId;
    } else {
      if (gameUpdate.status !== "FINISHED" && gameUpdate.winnerId !== -1) {
        return reply.code(400).send({
          error:
            "Cannot set a winner for a game that is not finished or canceled",
        });
      }
    }

    if (
      gameUpdate.playerTwoId !== 0 &&
      gameUpdate.playerTwoId === gameUpdate.playerOneId
    ) {
      return reply
        .code(400)
        .send({ error: "Player two cannot be the same as player one" });
    }

    const dataToUpdate = {
      id: currentGame.id,
      playerOneId: currentGame.playerOneId,
      playerTwoId: currentGame.playerTwoId,
      playerOneScore:
        gameUpdate.playerOneScore > currentGame.playerOneScore
          ? gameUpdate.playerOneScore
          : currentGame.playerOneScore,
      playerTwoScore:
        gameUpdate.playerTwoScore > currentGame.playerTwoScore
          ? gameUpdate.playerTwoScore
          : currentGame.playerTwoScore,
      winnerId: gameUpdate.winnerId,
      startedAt: gameUpdate.startedAt,
      endedAt: gameUpdate.endedAt,
      status: gameUpdate.status,
      tournementId: currentGame.tournementId,
    };

    const updatedGame = await req.server.prisma.game.update({
      where: { id: gameId },
      data: dataToUpdate,
    });
    console.log("------------", dataToUpdate);

    return reply.code(200).send({ game: updatedGame });
  } catch (error) {
    console.error("Stack trace:", error.stack); // Log the stack trace
    return reply.code(500).send({ error: "Error updating game:" });
  }
};

export const cancelGame = async function (req, reply) {
  const { id } = req.params;

  try {
    const game = await req.server.prisma.game.update({
      where: { id: parseInt(id) },
      data: { status: "CANCELED", endedAt: new Date() },
    });

    return reply.code(200).send(game);
  } catch (error) {
    return reply.code(500).send({ error: "Error canceling game" });
  }
};
