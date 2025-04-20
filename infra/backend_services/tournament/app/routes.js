import auth from './middlewares/auth.js';
import body_validation from './middlewares/body_validation.js';
import create_tournament from './controllers/create_tournament.js';
import join_tournament from './controllers/join_tournament.js';
import leave_tournament from './controllers/leave_tournament.js';
import delete_tournament from './controllers/delete_tournament.js';
import list_tournaments from './controllers/list_tournaments.js';
import get_tournament from './controllers/get_tournament.js';
import start_tournament from './controllers/start_tournament.js';


export default function routes(fastify) {
    fastify.addHook('preHandler', auth);

    fastify.post('/', {preValidation: body_validation}, create_tournament);
    fastify.delete('/:id', delete_tournament);
    fastify.get('/list', list_tournaments);
    fastify.post('/:id/join', join_tournament);
    fastify.post('/:id/leave', leave_tournament);


    fastify.post('/:id/start', start_tournament);


    // DONE
    fastify.get('/:id', get_tournament);
    // add on the response
    // 
    
    
    
    // invite player to tournament by send a link in the chat

    // fastify.get('/:id/results', results_tournament);
    // fastify.post('/:id/start', start_tournament);
    

}


// user can create a tournament
// user can delete a tournament
// user can list all tournaments
// user can join a tournament
// user can leave a tournament

// user can get a tournament (5sek tkon already in the tournament)
// user can invite a player to a tournament (means send (message or notifaication) to the player to join the tournament)
// user can start a tournament







