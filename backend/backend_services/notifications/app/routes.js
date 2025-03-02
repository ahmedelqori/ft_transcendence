import new_notif from "./controllers/new_notif.js";
import markAsRead from "./controllers/markAsRead.js";
import auth from "./middlewares/auth.js";


export default async function routes(fastify) {
    fastify.post('/', {preHandler: auth}, new_notif);
    fastify.delete('/', {preHandler: auth}, markAsRead);    
    fastify.delete('/:id', {preHandler: auth}, markAsRead);
}


