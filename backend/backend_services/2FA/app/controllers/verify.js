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
        const access_token = jwt.sign({user_id: req.user.id}, privateKey, { algorithm: 'RS256', expiresIn: '5h' });
        const refresh_token = jwt.sign({user_id: req.user.id}, privateKey, { algorithm: 'RS256', expiresIn: '7d' });
        res.status(200).send({ access_token, refresh_token });
    }

}