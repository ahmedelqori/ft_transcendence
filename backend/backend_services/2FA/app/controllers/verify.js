import db from '../models.js';
import speakeazy from 'speakeasy';
import axios from 'axios';


export default async function verify(req, res) {
    const { code } = req.body || {};
    if (!code) {
        res.status(400).send({ message: 'code is required' });
        return;
    }

    if (typeof code !== 'number')
        res.status(400).send({ message: 'code must be a number' });

    if (code > 999999 || code < 100000) {
        res.status(400).send({ message: 'code must be 6 digits long' });
        reutrn ;
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
            return ;
        }
        catch (err){
            console.error('Request to enable 2FA failed:', err);
            res.status(500).send({ message: 'Internal Server Error' });
            return;
        };
    }

    res.status(200).send({ verified: true });
}