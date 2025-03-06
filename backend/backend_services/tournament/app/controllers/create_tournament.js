import { tournament, tournament_players} from '../models.js'

export default async function create_tournament(req, res) {
    const {tournament_name, nickname, players_number} = req.body;

    const tournament_records = await tournament.query().where('tournament_name', tournament_name) ;
    if (tournament_records.length > 0) {
        res
        .status(400)
        .send({message: 'Tournament already exists'});
        return res;
    };

    const players_record = await tournament_players.query().where({nickname});
    if (players_record.length > 0) {
        res
        .status(400)
        .send({message: 'Nickname already exists'});
        return res;
    };

    tournament.query().insert({
        owner_id: req.user.id,
        tournament_name,
        players_number
    }).then((tournament) => {
        tournament_players.query().insert({
            tournament_id: tournament.id,
            player_id: req.user.id,
            nickname
        }).then((tournament_player) => {
            res
            .status(201)
            .send({message: 'Tournament created', tournament, tournament_player});
        }).catch((err) => {
            console.error(err.message);
            res.code(500).send({message: 'Internal Server Error'});
        });
    }).catch((err) => {
        console.error(err.message);
        res.code(500).send({message: 'Internal Server Error'});
    });



}

