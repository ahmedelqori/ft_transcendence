import axios from 'axios';
import jwt from 'jsonwebtoken';
// import { secrets } from '../server.js';
import fs from 'fs';

export default async function auth(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.code(401).send({ message: 'Unauthorized' });
        return;
    };

    const publicKey = fs.readFileSync('./public.pem', 'utf8');
    let decode;
    try {
        decode = jwt.verify(authorization.split(' ')[1], publicKey, { algorithms: ['RS256'] });
    } catch (err) {
        res.code(401).send({ message: 'Unauthorized' });
        return;
    }
    if (!decode) {
        res.code(401).send({ message: 'Unauthorized' });
        return
    }else if (decode.unverified_user_id !== undefined){
        req.unverified_user = true;
        req.user = {
            two_FA: true, 
            id: decode.unverified_user_id
        };
        return;
    }else {
        let response;
        try{
            response = await axios.get(process.env.WHOAMI_URL, {headers:{
                authorization: authorization
            }});
            if (response.status !== 200) {
                res.code(401).send({ message: 'Unauthorized' });
                return;
            }
        }
        catch(err){
            res.code(401).send({ message: 'Unauthorized' });
            return;
        };
        req.user = response.data;
    }
};


