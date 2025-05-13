import axios from "axios"
import Player from "../models.js"
import fs from 'fs';
import jwt from 'jsonwebtoken'
import sharp from 'sharp';
import crypto from 'crypto';

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

    const privateKey = fs.readFileSync('./private.pem', 'utf8');
    
    if (player.two_FA){
        const payload = { unverified_user_id: player.id };
        const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '5m' });
        
        // redirect to verify page
        reply
            .redirect(process.env.FRONTEND_2FA_VERIFY_URL + jwt_access_token);
        return ;
    }
    
    const payload = {
        user_id: player.id,
        refresh_token: 0
    };
    const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '5m' });
    console.log('login in User:', player);
   
    reply
        .redirect(process.env.FRONTEND_HOME_URL + jwt_access_token);
    
    return reply;
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
        'image/webp': '.webp',
    }
    
    const avatar_name = crypto.randomBytes(8).toString('hex') + '.webp';
    try {
        const res = await axios.get(image_url, { responseType: 'arraybuffer' });
        if (res.status !== 200 || !extensions[res.headers['content-type']]) {
            throw new Error('Invalid image response');
        }
        const buffer = res.data;
        const webpbuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();
        fs.writeFileSync(process.env.PROFILE_IMAGE_PATH + avatar_name, webpbuffer, 'binary');
    } catch (error) {create_userrror fetching image:', error.message);
        avatar_name = process.env.PROFILE_IMAGE_PATH + process.env.DEFAULT_IMAGE;
    }
    
    return process.env.DOMAIN + '/static/' + avatar_name;
}

const create_user = async (user_info, provider) => {
    try {
        const existingPlayer = await Player.query().findOne({ email: user_info.email });

        if (existingPlayer) {
            console.log('Player already exists:');
            return existingPlayer;
        }


        let userInfo = {};
        if (provider === '42') {
            userInfo = {
                username: user_info.login.replace(' ', '_'),
                email: user_info.email,
                first_name: user_info.first_name,
                last_name: user_info.last_name,
                avatar_url: await image_url(user_info.image.versions.large, user_info.login),
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


        const newPlayer = await Player.query().insert(userInfo);
        console.log('New player created:', newPlayer);
        return newPlayer;
    } catch (error) {
        console.error('Error inserting player:', error.message);
        return undefined;
    }

}
