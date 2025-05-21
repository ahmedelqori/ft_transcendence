import crypto from 'crypto';
import {secrets} from '../server.js';
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

export const google_login = async (req, reply) => {
    const state = generateState();
    let url = "https://accounts.google.com/o/oauth2/auth";
    url += `?client_id=${secrets.ORIGIN_GOOGLE}`;
    url += `&redirect_uri=${process.env.SOCIAL_AUTH_REDIRECT_URI}`;
    url += "&response_type=code";
    url += "&scope=email profile";
    url += `&state=${state}`;

    reply.setCookie('oauth2_provider', 'google', { path: '/api/account'});
    reply.setCookie('state', state, { path: '/api/account', httpOnly: true });
    return reply.redirect(url);
};

export const login_42 = async (req, reply) => {
    const state = generateState()

    let url = "https://api.intra.42.fr/oauth/authorize";
    url += `?client_id=${secrets.ORIGIN_42}`;
    url += `&redirect_uri=${process.env.SOCIAL_AUTH_REDIRECT_URI}`;
    url += "&response_type=code";
    url += `&state=${state}`;
    
    reply.setCookie('oauth2_provider', '42',  { path: '/api/account'});
    reply.setCookie('state', state, { path: '/api/account', httpOnly: true });
    return reply.redirect(url);
}
