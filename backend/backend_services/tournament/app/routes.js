import auth from './middlewares/auth.js';
import body_validation from './middlewares/body_validation.js';
import create_tournament from './controllers/create_tournament.js';
import get_tournaments from './controllers/get_tournaments.js';
import delete_tournament from './controllers/delete_tournament.js';
import list_tournaments from './controllers/list_tournaments.js';


export default function routes(fastify) {
    fastify.addHook('preHandler', auth);

    fastify.post('/', {preValidation: body_validation}, create_tournament);
    fastify.get('/', get_tournaments);
    fastify.delete('/:id', delete_tournament);
    fastify.get('/list', list_tournaments);


    // fastify.get('/:id/results', {preValidation: body_validation}, results_tournament);
    // fastify.post('/:id/join', {preValidation: body_validation}, join_tournament);
    // fastify.post('/:id/leave', {preValidation: body_validation}, leave_tournament);
    // fastify.post('/:id/start', {preValidation: body_validation}, start_tournament);
    // fastify.patch('/:id', {preValidation: body_validation}, update_tournament);
    

}
