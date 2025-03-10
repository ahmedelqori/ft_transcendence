import { tournament_players } from '../models.js'


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

    res.send({message: "left"});
}