import db from '../models.js';
import axios from 'axios';


export default async function disable(req, res) {
    if (!req.user.two_FA) {
        res.status(400).send({ message: '2FA is not enabled' });
        return;
    }
    try {
        await db.query().findOne({ user_id: req.user.id }).delete();
    } catch (err) {
        console.error('Database deletion error:', err);
        res.status(500).send({ message: 'Internal Server Error' });
        return;
    }

    try{
        const r = await axios.post(process.env.TWOFA_URL,{status: false}, {
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
            .send({ message: '2FA disabled' });
        return ;
    }
    catch (err){
        console.error('Request to disable 2FA failed:', err);
        res.status(500).send({ message: 'Internal Server Error' });
        return;
    };


    res.status(200).send({ message: '2FA disabled' });
}

