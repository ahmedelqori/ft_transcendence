import { tournament , tournament_players, tournament_settings} from '../models.js'
import notif from '../utils/send_notif.js';

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

export default async function join_tournament(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id < 0){
        res.status(400).send({error: "Bad request"});
        return;
    }

    const t = await tournament.query().findById(id);
    if (t === undefined){
        res.status(404).send({error: "tournament not found"});
        return;
    }

    const tp = await tournament_players.query().where({'tournament_id': id, 'player_id': req.user.id});
    if (tp.length > 0){
        res.status(200).send({message: "already joined"});
        return;
    }


    const code = Number(req.query.code);
    if (isNaN(code) || code < 0){
        res.status(400).send({error: "Bad request"});
        return;
    }
    const settings = await tournament_settings.query()
        .where({tournament_id: id})
        .select('code')
        .first();
    
    if (code !== settings.code){
        res.status(400).send({error: "wrong code"});
        return;
    }

    const n = (await tournament_players.query().where('tournament_id', id)).length;
    if (t.players_number <= n){
        res.status(400).send({error: "tournament is full"});
        return;
    }

    let nickname;
    try {
        nickname = req.body.nickname;
    }catch(e){
        res.status(400).send({error: "nickname is required"}); return;
    }

    if (nickname && typeof nickname === 'string'){
        if (nickname.length < 3 || nickname.length > 20){
            res.status(400).send({error: "nickname must be between 3 and 20 characters"});
            return;
        }
        const tp = await tournament_players.query().where({'nickname': nickname});
        if (tp.length > 0){
            res.status(400).send({error: "nickname already taken"});
            return;
        }
    } else {
        res.status(400).send({error: "nickname is required"});
        return;
    }

    await tournament_players.query().insert({
        tournament_id: id,
        player_id: req.user.id,
        round: t.players_number,
        nickname
    });
    
    {
        const t = await tournament.query().findById(id);
        const n = (await tournament_players.query().where('tournament_id', t.id)).length;

        if (t.players_number == n){
            await tournament.query().findById(id).patch({ status: 'READY' });
        }
        console.log(`Player ${req.user.id} joined tournament ${id}`);
        reload_tournament(req, id);
        res.send(t);
    }

}