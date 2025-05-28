import { tournament, tournament_settings, tournament_players } from "../models.js";
import notif from '../utils/send_notif.js'

async function reload_tournament(req, id) {
    const players = await tournament_players.query()
        .where('tournament_id', id)
        .select('player_id');
    console.log("Joined player: ", req.user.id);
    players.forEach(async (e) => {
        if (e.player_id != req.user.id) {
            console.log(`Reloading tournament for player ${e.player_id}`);
            try{
                await notif(req, e.player_id, 'reloadTournament', {});
            }
            catch (error) {
                console.error(`Failed to notify player ${e.player_id}:`, error);
            }
        }
    });
}

export default async function leave_tournament(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id < 0){
        res.status(400).send({error: "Bad request"});
        return;
    }
    

    const t = await tournament.query().findById(id);
    if (t.owner_id === req.user.id) {
        try {
            await tournament.query().where({
                id,
                owner_id: req.user.id
            }).delete();
        }
        catch (error) {
            console.error("Error deleting tournament:", error);
            res.status(500).send({error: "Failed to delete tournament"});
            return;
        }
        await reload_tournament(req, id);
        res.send({message: "deleted"});
        return;
    }


    const tp = await tournament_players.query().where({'tournament_id': id, 'player_id': req.user.id}).delete();
    if (tp === 0){
        res.status(400).send({error: "not joined"});
        return;
    }

    await tournament.query().findById(id).patch({ status: 'CREATED' });

    await reload_tournament(req, id);

    res.send({message: "left"});
}