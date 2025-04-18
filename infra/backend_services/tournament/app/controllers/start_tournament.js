import { tournament, tournament_settings, tournament_players } from "../models.js";


export default async function start_tournament(req, res) {

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({error: 'Tournament ID is required'});
    }


    // get tournament players_number
    const record = await tournament.query().where({id}).first();
    if (!record || record.owner_id != req.user.id){
        return res.status(400).send({error: 'Tournament ID is not exist'});
    }

    console.log(record);

    // loop for all players, need to equal players_number
}


// 1)
// tournament players == ka3 players round
// create games and save ID's in db
// send notif to start this round






// 2)
// check if previous round is finished
// create games and save ID's in db
// send notif to start this round