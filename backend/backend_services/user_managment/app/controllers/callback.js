import axios from "axios"
import Player from "../models.js"
import fs from 'fs';
import jwt from 'jsonwebtoken'

export default async function callback(req, reply) {
    const state = req.cookies.state;
    if (state != req.query.state){
        console.log('Invalid state, The state parameter does not match')
        return reply.status(400).send({'error': 'Invalid state', 'error_description': 'The state parameter does not match'})
    }

    const code = req.query.code;
    if (!code){
        console.log('No code provided')
        return reply.status(400).send({'error': 'No code provided', 'error_description': 'Authorization code is missing from the request'})
    }


    const oauth2_urls = get_oauth2_urls(req.cookies.oauth2_provider);
    if (oauth2_urls == undefined){
        console.log('Invalid OAuth2 provider')
        return reply.status(400).send({'error': 'Invalid OAuth2 provider', 'error_description': 'The OAuth2 provider is not set in the cookie or it has been edited'})
    }

    if (req.query.error){
        console.log(`Error: ${req.query.error}, Description: ${req.query.error_description}`)
        return reply.status(400).send({'error': req.query.error, 'error_description': req.query.error_description})
    }

    const body = {
        "grant_type": "authorization_code",
        "client_id": oauth2_urls.client_id,
        "client_secret": oauth2_urls.client_secret,
        'code': code,
        "redirect_uri": process.env.SOCIAL_AUTH_REDIRECT_URI
    }

    const response = await axios.post(oauth2_urls.token_url, body)
    if (response.status != 200){
        console.log(`Failed to obtain token: ${response.data.error}, Description: ${response.data.error_description}`)
        return reply.status(response.status).send({'error': response.data.error, 'error_description': response.data.error_description})
    }
    
    const access_token = response.data.access_token;
    if (!access_token){
        console.log('No access token provided')
        return reply.status(400).send({'error': 'No access token provided', 'error_description': 'The access token is missing from the token response'})
    }
    
    const res = await axios.get(oauth2_urls.userinfo_url, {headers: {'Authorization': `Bearer ${access_token}`}})
    if (res.status != 200){
        console.log('Failed to obtain user info')
        return reply.status(error.res.status).send({'error': 'Failed to obtain user info', 'error_description': error.res.data.error_description})
    }
    
    const user_info = res.data;

    const player = await create_user(user_info, req.cookies.oauth2_provider);
    if (!player){
        console.log('Error inserting player')
        return reply.status(500).send({'error': 'Error inserting player'})
    }

    if (player.two_FA){
        
    }
    
    console.log('login in User:', player);

    const privateKey = fs.readFileSync('./private.pem', 'utf8');

    const payload = { user_id: player.id };
    const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '5h' });
    const jwt_refresh_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '7d' });


    reply
        .status(200)
        .send({ access_token: jwt_access_token, refresh_token: jwt_refresh_token });
}


const get_oauth2_urls = (provider) => {
    if (provider == '42'){
        return {
            token_url: 'https://api.intra.42.fr/oauth/token',
            userinfo_url: 'https://api.intra.42.fr/v2/me',
            client_id: `${process.env.SOCIAL_AUTH_42_OAUTH2_KEY}`,
            client_secret: `${process.env.SOCIAL_AUTH_42_OAUTH2_SECRET}`,
        }
    }
    else if (provider == 'google') {
        return {
            token_url: 'https://oauth2.googleapis.com/token',
            userinfo_url: 'https://www.googleapis.com/oauth2/v1/userinfo',
            client_id: `${process.env.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY}`,
            client_secret: `${process.env.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET}`
        }
    }
    else{
        return undefined;
    }
}

const image_url = async (image_url, username) => {
    const extensions = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
    }
    
    let path = '';
    try {
        const res = await axios.get(image_url, { responseType: 'arraybuffer' });
        if (res.status !== 200 || !extensions[res.headers['content-type']]) {
            throw new Error('Invalid image response');
        }
        path = process.env.PROFILE_IMAGE_PATH + username.replace(' ', '_') + extensions[res.headers['content-type']];
        fs.writeFileSync(path, res.data, 'binary');
    } catch (error) {
        console.error('Error fetching image:', error.message);
        path = process.env.PROFILE_IMAGE_PATH + 'default.jpg';
    }
    
    return process.env.DOMAIN + '/' + path;
}

const create_user = async (user_info, provider) => {
    let userInfo = {};
    if (provider === '42') {
        userInfo = {
            username: user_info.login.replace(' ', '_'),
            email: user_info.email,
            first_name: user_info.first_name,
            last_name: user_info.last_name,
            avatar_url: await image_url(user_info.image.versions.small, user_info.login),
        }
    }
    else if (provider === 'google') {
        userInfo = {
            username: user_info.name.replace(' ', '_'),
            email: user_info.email,
            first_name: user_info.given_name,
            last_name: user_info.family_name,
            avatar_url: await image_url(user_info.picture, user_info.name),
        };
    }
    else {
        return undefined;
    }


    try {
        const existingPlayer = await Player.query().findOne({ email: userInfo.email });

        if (existingPlayer) {
            console.log('Player already exists:');
            return existingPlayer;
        }

        const newPlayer = await Player.query().insert(userInfo);
        console.log('New player created:', newPlayer);
        return newPlayer;
    } catch (error) {
        console.error('Error inserting player:', error.message);
        return undefined;
    }

}
