import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  cancelGame,
  getUserGames,
  getCurrentGame
} from "../controllers/game.controller.js";
import {
  acceptGameInvitation,
  declineGameInvitation,
} from "../controllers/createGame.utils.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const idSchema = {
  schema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9]+$" },
      },
    },
  },
};

const responseGameSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    playerOneId: { type: "integer" },
    playerTwoId: { type: "integer" },
    playerOneScore: { type: "integer" },
    playerTwoScore: { type: "integer" },
    winnerId: { type: "integer" },
    startedAt: { type: "string", format: "date-time" },
    endedAt: { type: ["string", "null"], format: "date-time" },
    status: {
      type: "string",
      enum: ["PENDING", "ACCEPTED", "IN_PROGRESS", "FINISHED", "CANCELED"],
    },
    tournementId: { type: "integer" },
  },
};

const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
};

export const websocketRouteSchema = {
  params: {
    type: "object",
    required: ["gameId"],
    properties: {
      gameId: {
        type: "string",
        pattern: "^[1-9][0-9]*$",
        description: "Game ID",
      },
    },
  },
  querystring: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "Authentication token",
      },
    },
  },
};

export const gameRoutes = function (fastify, options, done) {
  fastify.addHook('preHandler', authenticate);
  fastify.get(
    "/",
    {
      schema: {
        tags: ["games"],
        summary: "Get all games",
        description: "Returns a list of all games",
        response: {
          200: {
            description: "Successful response",
            type: "array",
            items: responseGameSchema,
          },
          503: {
            description: "Service unavailable",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    getAllGames
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["games"],
        summary: "Get game by ID",
        description: "Returns a single game by ID",
        params: idSchema.schema.params,
        response: {
          200: responseGameSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    getGameById
  );
  fastify.get(
    "/current_game",
    {
      schema: {
        tags: ["current game"],
        summary: "Get the active Game",
        description: "Returns a single game that is Started State",
        response: {
          200: responseGameSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    getCurrentGame
  );
  fastify.get(
    "/user/:userId",
    {
      schema: {
        tags: ["games"],
        summary: "Get all non-tournament games for a user",
        description:
          "Returns all games where the user is playerOne or playerTwo and not part of a tournament",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", pattern: "^[0-9]+$" },
          },
        },
        response: {
          200: {
            type: "array",
            items: responseGameSchema,
          },
          400: errorSchema,
          500: errorSchema,
        },
      },
    },
    getUserGames
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["games"],
        summary: "Create a new game",
        description: "Creates a new game with specified players",
        body: {
          type: "object",
          properties: {
            playerTwoId: {
              type: "integer",
              description: "ID of the opponent (0 if no specific opponent yet)",
            },
            tournementId: {
              type: "integer",
              description:
                "ID of the tournament if this game is part of one(0 if it is not part of a tournament)",
            },
          },
        },
        response: {
          201: responseGameSchema,
          400: errorSchema,
          403: errorSchema,
        },
      },
    },
    createGame
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["games"],
        summary: "Update game",
        description: "Update game details like scores or status",
        params: idSchema.schema.params,
        body: {
          type: "object",
          properties: {
            playerOneScore: { type: "integer" },
            playerTwoScore: { type: "integer" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "ACCEPTED",
                "IN_PROGRESS",
                "FINISHED",
                "CANCELED",
              ],
            },
            winnerId: { type: "integer" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              game: responseGameSchema,
            },
          },
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    updateGame
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["games"],
        summary: "Cancel game",
        description: "Cancel an ongoing game",
        params: idSchema.schema.params,
        response: {
          200: responseGameSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    cancelGame
  );

  fastify.put(
    "/accept/:id",
    {
      schema: {
        tags: ["games"],
        summary: "Accept game invitation",
        description: "Accept an invitation to join a game",
        params: idSchema.schema.params,
        response: {
          200: responseGameSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    acceptGameInvitation
  );

  fastify.put(
    "/decline/:id",
    {
      schema: {
        tags: ["games"],
        summary: "Decline game invitation",
        description: "Decline an invitation to join a game",
        params: idSchema.schema.params,
        response: {
          200: responseGameSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    declineGameInvitation
  );

  // fastify.delete(
  //   "/delete/:id",
  //   {
  //     schema: {
  //       tags: ["games"],
  //       summary: "Delete game",
  //       description: "Delete a game completely from the system",
  //       params: idSchema.schema.params,
  //       response: {
  //         200: responseGameSchema,
  //         500: errorSchema,
  //       },
  //     },
  //   },
  //   deleteGame
  // );

  done();
};
