import new_notif from "./controllers/new_notif.js";
import markAsRead from "./controllers/markAsRead.js";
import get_notif from "./controllers/get_notif.js";
import auth from "./middlewares/auth.js";
import notification from "./controllers/notification.js";


export default async function routes(fastify) {
    fastify.addHook('preHandler', auth);

    fastify.post('/', new_notif);
    fastify.get('/', get_notif);
    fastify.delete('/', markAsRead);    
    fastify.delete('/:id', markAsRead);
    fastify.get('/ws', { websocket: true}, notification);
}


