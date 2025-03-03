import {getAllGames, getGameById, createGame, cancelGame, updateGame} from "../controllers/controller.game.js"
import {liveGame, validateGameId} from "../controllers/controller.liveGame.js"
export const gameRoutes = function(fastify, options, done){
    fastify.get('/', getAllGames),
    fastify.get('/:id', getGameById),
    fastify.post('/', createGame),
    fastify.put('/:id', updateGame),
    fastify.delete('/:id', cancelGame)
    done()
}
