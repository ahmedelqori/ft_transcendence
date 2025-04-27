import jwt from 'jsonwebtoken';
import fs from 'fs';

export default async function refresh(req, res) {
    const refresh_token = req.body.refresh_token;
    if (!refresh_token) {
        return res.status(400).send({ error: "refresh is required" });

    }

    const privateKey = fs.readFileSync('./private.pem', 'utf8'); // here
    const publicKey = fs.readFileSync('./public.pem', 'utf8'); // here

    try {


        const decoded = jwt.verify(refresh_token, publicKey);
        if (!decoded) {
            return res.status(400).send({ error: "invalid refresh token" });
        }

        const payload = { user_id: decoded.user_id };
        const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });

        res.status(200).send({ access_token: jwt_access_token });
    } catch (error) {
        return res.status(400).send({ error: "invalid refresh token" });
    }
};
