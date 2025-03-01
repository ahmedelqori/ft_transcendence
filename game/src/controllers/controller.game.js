// import Game from "../models/model.game"

export const getAllGames = async function (req, reply) {
    try {
      const games = await req.server.prisma.game.findMany();
      return reply.code(200).send(games);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: 'Failed to fetch games' });
    }
  };
  
  export const getGameById = async function (req, reply) {
    const { id } = req.params;
  
    try {
      const game = await req.server.prisma.game.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!game) {
        return reply.code(404).send({ error: 'Game not found' });
      }
  
      return reply.code(200).send(game);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: 'Error retrieving game' });
    }
  };
  
  export const createGame = async function (req, reply) {
    const { playerOneId, gameMode } = req.body;
  
    try {
      const game = await req.server.prisma.game.create({
        data: {
          playerOneId,
          gameMode: gameMode.toUpperCase(), // Ensure enum match
        },
      });
  
      return reply.code(201).send(game);
    } catch (error) {
      console.error(error);
      return reply.code(400).send({ error: 'Invalid gameMode or missing fields' });
    }
  };
  
  export const cancelGame = async function (req, reply) {
    const { id } = req.params;
  
    try {
      const game = await req.server.prisma.game.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELED' },
      });
  
      return reply.code(200).send(game);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ error: 'Error canceling game' });
    }
  };
  