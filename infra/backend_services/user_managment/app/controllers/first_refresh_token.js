import {secrets} from '../server.js';
import jwt from 'jsonwebtoken';

export default async function first_refresh_token(req, res) {

    // this endpoint can only be called once
    const decode = jwt.decode(req.headers.authorization.split(' ')[1]);

    if (decode.refresh_token == undefined){
        res.status(403);
        return ;
    }

    const privateKey =secrets.JWT_PRIVATE;
    const payload = { user_id: req.user.id };

    const jwt_access_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
    const jwt_refresh_token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '7d' });

    res
        .setCookie('refresh_token', jwt_refresh_token, {
            // secure: true,
            // sameSite: 'None',
	    	// path: '/',
        })
        .status(200)
        .send({
            access_token: jwt_access_token,
        });

    return res;
}


