import db from '../models.js';
import speakeazy from 'speakeasy';
import axios from 'axios';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import notif from '../utils/send_notif.js';


export default async function verify(req, res) {
    let { code } = req.body || {};
    if (!code) {
        res.status(400).send({ message: 'code is required' });
        return;
    }

    if (typeof code !== 'string' || code.length !== 6)
        res.status(400).send({ message: 'code must be like:', code: '123456' });

    code = parseInt(code);
    if (isNaN(code)) {
        res.status(400).send({ message: 'code must be a number' });
        return;
    }
    

    const secret = await db.query().findOne({ user_id: req.user.id }).select('secret');
    if (!secret && !req.user.two_FA) {
        res.status(400).send({ message: '2FA is not enabled' });
        return;
    }


    const verified = speakeazy.totp.verify({
        secret: secret.secret,
        encoding: 'base32',
        token: code,
    });

    if (!verified) {
        res.status(400).send({ verified: false });
        return;
    }

    if (!req.user.two_FA) {
        try{
            const r = await axios.post(process.env.TWOFA_URL,{status: true}, {
                headers: {
                    Authorization: req.headers.authorization,
                    origin: process.env.ACCEPTED_ORIGIN,
                },
            });
            if (r.status !== 200) {
                console.log(r);
                res.status(500).send({ message: 'Internal Server Error' });
                return;
            }
            res
                .status(200)
                .send({ message: '2FA enabled' });
            notif(req, 'info', '2FA enabled');
            return ;
        }
        catch (err){
            console.error('Request to enable 2FA failed:', err);
            res.status(500).send({ message: 'Internal Server Error' });
            return;
        };
    }else {
        const privateKey = fs.readFileSync('./private.pem', 'utf8');
        const payload = { user_id: req.user.id };

        const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
        const jwt_refresh_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '7d' });
    
        res
            .setCookie('refresh_token', jwt_refresh_token, {
                // secure: true,   // Ensure the cookie is sent over HTTPS
                // sameSite: 'Strict', // Restrict cross-site requests
                path: '/',      // Cookie is valid for the entire domain
            })
            .status(200)
            .send({
                access_token: jwt_access_token,
            });
        return res;
    }
}