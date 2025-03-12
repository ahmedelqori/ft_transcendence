
import auth from './middlewares/auth.js';
import enable from './controllers/enable.js';
import is_enable from './controllers/is_enable.js';
import verify from './controllers/verify.js';
import disable from './controllers/disable.js';




export default async function routes(fastify) {
    fastify.post('/enable', {preHandler: auth}, enable);
    fastify.post('/verify', {preHandler: auth}, verify);
    fastify.get('/is-enable', {preHandler: auth}, is_enable);
    fastify.delete('/disable', {preHandler: auth}, disable);
}












