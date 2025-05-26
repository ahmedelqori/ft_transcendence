import { tournament, tournament_settings, tournament_players } from "../models.js";

async function reload_tournament(req, id) {
    const players = await tournament_players.query()
        .where('tournament_id', id)
        .select('player_id');
    console.log("Joined player: ", req.user.id);
    players.forEach(async (e) => {
        if (e.player_id != req.user.id) {
            console.log(`Reloading tournament for player ${e.player_id}`);
            await notif(req, e.player_id, 'reloadTournament', {});
        }
    });
}

export default async function leave_tournament(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id < 0){
        res.status(400).send({error: "Bad request"});
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