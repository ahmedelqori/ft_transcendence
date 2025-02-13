import friends from './controllers/friends.js';
import request from './controllers/request.js';
import auth from './middlewares/auth.js';


function not(req, res) {
    res.send({status: "Still Not Implemented"});
}


export default async function routes(fastify) {
    fastify.get('/', {preHandler: auth},not);
    fastify.get('/search', {preHandler: auth},not);
    fastify.get('/:user_id', {preHandler: auth},not);
    fastify.delete('/:user_id/friend', {preHandler: auth},not);
    fastify.post('/:user_id/block', {preHandler: auth},not);
    fastify.delete('/:user_id/block', {preHandler: auth},not);
    fastify.post('/:user_id/request', {preHandler: auth}, request);
    fastify.delete('/:user_id/request', {preHandler: auth},not);
    fastify.post('/:user_id/request/accept', {preHandler: auth},not);
    fastify.post('/:user_id/request/reject', {preHandler: auth},not);
};




// ROUTES (friendship service):
//     all GET request you can use parameter 'limit' and 'offset' for paginition (friends/?limit=10&offset=20)
    
//     # Friend List Management
//         /                                (GET)       : get all friends
//         /search?q=keyword&status=status  (GET)       : get all users match the keyword and match the status (online/offline/in-game/blocked/pending)
//         /{user_id}                       (GET)       : get all informations of this user and status (frined/blocked/pending/None)
//         /{user_id}/friend                (DELETE)    : unfriend

//     # Friend Actions
//         /{user_id}/block                 (POST)      : block user
//         /{user_id}/block                 (DELETE)    : unblock user
//         /{user_id}/request               (POST)      : send request  
//         /{user_id}/request               (DELETE)    : cancel request
//         /{user_id}/request/accept        (POST)      : accept request
//         /{user_id}/request/reject        (POST)      : reject request
    
//     # Notifications Managment
//         /notification                    (GET)       : get list if any user send request to you
//         /notification/{id}               (POST)      : mark it as read








