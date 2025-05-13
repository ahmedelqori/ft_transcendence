import { SendMessage } from '../controllers/SendmessageController.js';
import { GetMessage } from '../controllers/GetMessageController.js';
import auth from '../middleware/middleware.js'
async function messageRoutes(fastify, options) {
    fastify.addHook('preHandler',auth);
    fastify.post('/send/:id', SendMessage(fastify));
    fastify.get('/:id', GetMessage(fastify));
}
  

/*
must be fastify.get('/send/:id',protectRoute, getMessageById);
protectRoute function check if user login or not !! middleware -> youssed

*/
export default messageRoutes;
  