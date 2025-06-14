import { tournament, tournament_games, tournament_players } from "../models.js";
import jwt from 'jsonwebtoken';
import {secrets} from '../server.js';


const is_authenticated = async (req) => {
    if (!req.headers.authorization) {
        return undefined
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return undefined;
    }
    const publicKey = secrets.JWT_PUBLIC;
    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        if (decoded) {
            return decoded.user_id;
        }
    } catch (error) {
        return undefined;
    }
}


export default async function player_won(req, res) {
    const user = await is_authenticated(req);
    if (!user) {
        return res.status(401).send({ 'error': 'Unauthorized' });
    }

    const player_id = Number(req.params?.id);
    if (!player_id || isNaN(player_id) || player_id < 0) {
        res.status(400).send({
            error: "Invalid player id",
        });
        return ;
    }

    const records = await tournament_players.query().where({
            player_id,
            round: 1,
        });
    res.send({wons: records.length});
}