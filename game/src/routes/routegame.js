import {getAllGames, getGameById, createGame, cancelGame} from "../controllers/controller.game.js"

export const gameRoutes = function(fastify, options){
    fastify.get('/', getAllGames),
    fastify.get('/:id', getGameById),
    fastify.post('/', createGame),
    fastify.delete('/:id', cancelGame)
}
