import { tournament, tournament_settings, tournament_players } from "../models.js";


export default async function start_tournament(req, res) {

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({error: 'Tournament ID is required'});
    }

    const t = await tournament.query().where({id}).first();
    if (!t || t.owner_id != req.user.id){
        return res.status(400).send({error: 'Tournament ID is not exist'});
    }

    if (t.status != 'READY'){
        return res.status(400).send({error: 'Tournament is not ready'});
    }

    const players = await tournament_players.query().where({tournament_id: id});
    for (let i = 0; i < players.length; i++) {
        if (players[i].round != t.players_number) {
            return res.status(400).send({error: 'tournament already started'});
        }
    }

    // all good so need to create games
}


// 1)
// tournament players == ka3 players round
// create games and save ID's in db
// send notif to start this round






// 2)
// check if previous round is finished
// create games and save ID's in db
// send notif to start this round