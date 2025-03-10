import { google_login, login_42 } from "./controllers/login_redirection.js";
import callback from "./controllers/callback.js";
import whoami from "./controllers/whoami.js";
import update_profile from './controllers/update_profile.js'
import avatar from './controllers/avatar.js';
import fileValidation from './middlewares/avatar_validation.js';
import auth from './middlewares/auth.js';
import search from './controllers/search.js';
import searchValidation from './middlewares/search_validation.js';
import who_this_guy from './controllers/who_this_guy.js';
import users from './controllers/users.js';
import users_validation from './middlewares/users_validation.js';
import refresh from './controllers/refresh_token.js';
import twoFA from './controllers/twofa.js';

function not_yet(req, res) {
    console.log(req.headers.host);
}


// Declare a route
export default async function routes(fastify) {
    fastify.get('/login/google/', google_login);
    fastify.get('/login/42/', login_42);
    fastify.get('/login/callback/', callback);
    fastify.post('/login/refresh/', {preHandler: auth},refresh);
    fastify.get('/whoami/', {preHandler: auth}, whoami);
    fastify.patch('/update-profile/', {preHandler: auth}, update_profile);
    fastify.post('/avatar/', { preHandler: auth, preValidation: fileValidation }, avatar);
    fastify.get('/search/', {preHandler: auth, preValidation: searchValidation}, search);
    fastify.get('/:id', {preHandler: auth}, who_this_guy);
    fastify.get('/users/', {preHandler: auth, preValidation: users_validation}, users);
    fastify.post('/twoFA', {preHandler: auth}, twoFA);
}
