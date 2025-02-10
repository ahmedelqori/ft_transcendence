import { google_login, login_42 } from "./controllers/login_redirection.js";
import callback from "./controllers/callback.js";

// Declare a route
export default async function routes(fastify, options) {
    fastify.get('/login/google/', google_login);
    fastify.get('/login/42/', login_42);
    fastify.get('/login/callback/', callback);
}

/*
    /api/account/login/google/
    /api/account/login/42/
    /api/account/login/callback/
    /api/account/login/refresh/
    /api/account/logout/
    /api/account/whoami/
    /api/account/update-profile/
    /api/account/delete/user/
    /api/account/avatar/
    /api/account/search/
    /api/account/<int:user_id>
    /api/account/users/
*/