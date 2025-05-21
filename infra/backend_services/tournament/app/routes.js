import auth from './middlewares/auth.js';
import body_validation from './middlewares/body_validation.js';
import create_tournament from './controllers/create_tournament.js';
import join_tournament from './controllers/join_tournament.js';
import leave_tournament from './controllers/leave_tournament.js';
import delete_tournament from './controllers/delete_tournament.js';
import list_tournaments from './controllers/list_tournaments.js';
import get_tournament from './controllers/get_tournament.js';
import start_tournament from './controllers/start_tournament.js';
import next_round from './controllers/start_next_round.js';
import results_tournament from './controllers/results_tournament.js';
import player_won from './controllers/player_won.js';


export default function routes(fastify) {
    fastify.post('/', { preValidation: [auth, body_validation] }, create_tournament);
    fastify.delete('/:id', { preHandler: auth }, delete_tournament);
    fastify.get('/list', { preHandler: auth }, list_tournaments);
    fastify.post('/:id/join', { preHandler: auth }, join_tournament);
    fastify.post('/:id/leave', { preHandler: auth }, leave_tournament);
    fastify.post('/:id/start', { preHandler: auth }, start_tournament);
    fastify.get('/:id', { preHandler: auth }, get_tournament);
    fastify.post('/next-round', { preHandler: auth }, next_round);
    fastify.get('/:id/results', { preHandler: auth }, results_tournament);
    fastify.get('/:id/wons', player_won);


}





