import axios from 'axios'; 
import { tournament, tournament_games, tournament_players } from "../models.js";

export default async function get_user(req, user_id, tournament_id) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return null;
    };




    let response;
    try{
        response = await axios.get(process.env.WHO_THIS_GUY_URL + String(user_id), {headers:{
            authorization: authorization
        }
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
    // user.nickname = (await tournament_players.query().where({'tournament_id': tournament_id, player_id: user_id}).first().select('nickname')).nickname;
    const player = await tournament_players.query().where({'tournament_id': tournament_id, player_id: user_id}).first().select('nickname');

    user.nickname = player?.nickname;
    return user;
};