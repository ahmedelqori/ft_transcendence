import { 
    getAllGames,
    getGameById,
    createGame, 
    updateGame,
    cancelGame,
    acceptGameInvitation,
    deleteGame,
    declineGameInvitation
  } from "../controllers/game.controller.js";
  
  const idSchema = {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        }
      }
    }
  };
  const responseGameSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      playerOneId: { type: 'integer' },
      playerTwoId: { type: 'integer' },
      playerOneScore: { type: 'integer' },
      playerTwoScore: { type: 'integer' },
      winnerId: { type: 'integer' },
      startedAt: { type: 'string', format: 'date-time' },
      endedAt: { type: ['string', 'null'], format: 'date-time' },
      status: { type: 'string' },
      tournementId: { type: 'integer' }
    }
  };
  
  export const gameRoutes = function(fastify, options, done) {
    fastify.get('/', {
      schema: {
        response: {
          200: {
            type: 'array',
            items: responseGameSchema
          }
        }
      }
    }, getAllGames);
    
    fastify.get('/:id', {...idSchema,
      schema:{
        response: {
          200: responseGameSchema
        }
      }
    }, getGameById);
    
    fastify.post('/', {
      schema: {
        body: {
          type: 'object',
          required: ['playerOneId'],
          properties: {
            playerOneId: { type: 'integer' },
            playerTwoId: { type: 'integer' },
            tournementId: { type: 'integer' }
          }
        },
      }
    }, createGame);
    
    fastify.put('/:id',idSchema, updateGame);
    fastify.delete('/:id',idSchema, cancelGame);
    fastify.put('/accept/:id',idSchema, acceptGameInvitation);
    fastify.delete('/delete/:id',idSchema, deleteGame);
    fastify.put('/decline/:id',idSchema, declineGameInvitation);
    
    done();
  };