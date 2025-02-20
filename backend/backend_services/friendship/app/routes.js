import friends from './controllers/friends.js';
import request from './controllers/request.js';
import auth from './middlewares/auth.js';
import accept from './controllers/accept.js';
import reject from './controllers/reject.js';
import unfriend from './controllers/unfriend.js';
import cancel_request from './controllers/cancel_request.js';
import block from './controllers/block.js';
import unblock from './controllers/unblock.js';
import relation_with_user from './controllers/relation_with_user.js';
import paginition_validation from './middlewares/paginetion_validition.js';
import search from './controllers/search.js';


export default async function routes(fastify) {
    fastify.post('/:user_id/request', {preHandler: auth}, request);
    fastify.post('/:user_id/request/accept', {preHandler: auth}, accept);
    fastify.post('/:user_id/request/reject', {preHandler: auth}, reject);
    fastify.delete('/:user_id/friend', {preHandler: auth}, unfriend);
    fastify.delete('/:user_id/request', {preHandler: auth}, cancel_request);
    fastify.post('/:user_id/block', {preHandler: auth},block);
    fastify.delete('/:user_id/block', {preHandler: auth},unblock);
    fastify.get('/:user_id', {preHandler: auth, preValidation: paginition_validation}, relation_with_user);
    fastify.get('/', {preHandler: auth},friends);
    fastify.get('/search', {preHandler: auth, preValidation: paginition_validation}, search);
};


//     # Notifications Managment
//         /notification                    (GET)       : get list if any user send request to you
//         /notification/{id}               (POST)      : mark it as read








