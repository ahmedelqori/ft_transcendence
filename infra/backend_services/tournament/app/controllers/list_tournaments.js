import { tournament ,tournament_players} from "../models.js";
import get_user from '../utils/whoThisGuy.js';

export default async function list_tournaments(req, res) {
    const records = await tournament.query().select();

    
    const tournaments = [];
    for (const r of records){
        if (req.query.me !== undefined){
            if (r.owner_id !== req.user.id){
                continue;
            }
        }
        const n = (await tournament_players.query().where('tournament_id', r.id)).length;
        const owner_user = (await get_user(req, r.owner_id, r.id));
        tournaments.push({
            id: r.id,
            name: r.tournament_name,
            owner: owner_user,
            total_places: r.players_number,
            total_players: n,
            status: r.status,
            created_at: r.created_at,
        });
    }

    res.send(tournaments);
}