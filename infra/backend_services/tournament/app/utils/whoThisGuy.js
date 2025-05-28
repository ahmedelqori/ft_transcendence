import axios from 'axios';
import https from 'https'; // just temporarily to accept self-signed certificates
import { tournament, tournament_games, tournament_players } from "../models.js";

export default async function get_user(req, user_id, tournament_id) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return null;
    };

    // { just temporarily to accept self-signed certificates
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false, // Accept self-signed certificates
        });
    // }



    let response;
    try{
        response = await axios.get(process.env.WHO_THIS_GUY_URL + String(user_id), {headers:{
            authorization: authorization
        },
        httpsAgent: httpsAgent // just temporarily to accept self-signed certificates
        });
        if (response.status !== 200) {
            return null;
        }
    }
    catch(err){
        console.log(err.message);
        return null;
    };
    
    let user = response.data;
    user.nickname = (await tournament_players.query().where({'tournament_id': tournament_id, player_id: user_id}).first().select('nickname')).nickname;

    return user;
};