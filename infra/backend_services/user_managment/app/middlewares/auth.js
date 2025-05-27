import jwt from 'jsonwebtoken';
import fs from 'fs';
import Player from '../models.js';


const is_authenticated = async (req) => {
    if (!req.headers.authorization) {
        return undefined
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return undefined;
    }
    const publicKey = fs.readFileSync('./public.pem', 'utf8');
    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        if (decoded) {
            const user = await Player.query().findById(decoded.user_id);
            delete user.email;
            return user;
        }
    } catch (error) {
        return undefined;
    }
    return undefined;
}


export default async function auth(req, reply) {
    const user = await is_authenticated(req);
    if (!user) {
        return reply.status(401).send({ 'error': 'Unauthorized' });
    }
    req.user = user;
}


