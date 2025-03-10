import crypto from 'crypto';

function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

export const google_login = async (req, reply) => {
    const state = generateState();
    let url = "https://accounts.google.com/o/oauth2/auth";
    url += `?client_id=${process.env.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY}`;
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
    url +=  "?client_id=u-s4t2ud-781bcdee833b67dcbf0e446f5aa49447e19d1d252fdbb50fe06b618d4da10198";
    url += "&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Faccount%2Flogin%2Fcallback%2F";
    url += "&response_type=code";
    url += `&state=${state}`;
    
    reply.setCookie('oauth2_provider', '42',  { path: '/api/account'});
    reply.setCookie('state', state, { path: '/api/account', httpOnly: true });
    return reply.redirect(url);
}
