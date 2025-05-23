import new_notif from "./controllers/new_notif.js";
import markAsRead from "./controllers/markAsRead.js";
import get_notif from "./controllers/get_notif.js";
import auth from "./middlewares/auth.js";
import notification from "./controllers/notification.js";
import wsAuth from "./middlewares/wsAuth.js";


export default async function routes(fastify) {
    // Register auth as a preHandler hook for all routes except /ws using route-level options
    fastify.post('/', { preHandler: auth }, new_notif);
    fastify.get('/', { preHandler: auth }, get_notif);
    fastify.delete('/', { preHandler: auth }, markAsRead);    
    fastify.delete('/:id', { preHandler: auth }, markAsRead);
    fastify.get('/ws', { websocket: true, preHandler: wsAuth }, notification);
}


