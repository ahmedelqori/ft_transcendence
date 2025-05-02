import fs from 'fs';
import jwt from 'jsonwebtoken';

export default async function first_refresh_token(req, res) {

    // this endpoint can only be called once
    const decode = jwt.decode(req.headers.authorization.split(' ')[1]);

    if (decode.refresh_token == undefined){
        res.status(403);
        return ;
    }

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


