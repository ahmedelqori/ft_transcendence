import auth from './middlewares/auth.js';
import create_tournament from './controllers/create_tournament.js';
import body_validation from './middlewares/body_validation.js';

export default function routes(fastify) {
    fastify.addHook('preHandler', auth);

    fastify.post('/', {preValidation: body_validation}, create_tournament);
}
