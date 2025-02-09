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
    let url = "https://api.intra.42.fr/oauth/authorize"
    url += `?client_id=${process.env.SOCIAL_AUTH_42_OAUTH2_KEY}`
    url += `&redirect_uri=${process.env.SOCIAL_AUTH_REDIRECT_URI}`
    url += "&response_type=code"
    url += "&scope=email profile"
    url += `&state=${state}`
    
    reply.setCookie('oauth2_provider', '42',  { path: '/api/account'});
    reply.setCookie('state', state, { path: '/api/account', httpOnly: true });
    return reply.send(url);
}



// def login_42(req):
//     state = secrets.token_urlsafe(16)
//     url = "https://api.intra.42.fr/oauth/authorize"
//     url += f"?client_id={ os.environ.get('SOCIAL_AUTH_42_OAUTH2_KEY')}"
//     url += f"&redirect_uri={os.environ.get('DOMAIN')}/account/login/callback/"
//     url += "&response_type=code"
//     url += f"&state={state}"
//     response = redirect(url)
//     response.set_cookie('state', state, httponly=True, path='/account') # add secure=True 
//     response.set_cookie('oauth2_provider', '42') # add secure=True 
//     logging.info('New request to create new user using 42 OAuth2 provider')
//     return response

// def google_login(req):
//     state = secrets.token_urlsafe(16)
//     url = "https://accounts.google.com/o/oauth2/auth"
//     url += f"?client_id={os.environ.get('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')}"
//     url += f"&redirect_uri={os.environ.get('DOMAIN')}/account/login/callback/"
//     url += "&response_type=code"
//     url += "&scope=email profile"
//     url += f"&state={state}"
//     response = redirect(url)
//     response.set_cookie('state', state, httponly=True, path='/account') # add secure=True 
//     response.set_cookie('oauth2_provider', 'google') # add secure=True 
//     logging.info('New request to create new user using google OAuth2 provider')
//     return response
