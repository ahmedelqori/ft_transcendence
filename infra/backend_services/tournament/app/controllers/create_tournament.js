import { tournament, tournament_players, tournament_settings} from '../models.js'
import random from 'random';

export default async function create_tournament(req, res) {
    const {tournament_name, nickname, players_number} = req.body;

    const tournament_records = await tournament.query().where('tournament_name', tournament_name) ;
    if (tournament_records.length > 0) {
        res
        .status(400)
        .send({message: 'Tournament already exists'});
        return res;
    };

    tournament.query().insert({
        owner_id: req.user.id,
        tournament_name,
        players_number
    }).then((tournament) => {
        console.log(`Tournament ${tournament_name} created successfully`);
        console.log(tournament);
        tournament_settings.query().insert({
            tournament_id: tournament.id,
            code: random.int(0, 9999)
        }).then((tournament_settings) => {
            tournament_players.query().insert({
                tournament_id: tournament.id,
                player_id: req.user.id,
                nickname
            }).catch((err) => {
                console.error(err.message);
                res.code(500).send({message: 'Internal Server Error'});
                return ;
            });
        }).catch((err) => {
            console.error(err.message);
            res.code(500).send({message: 'Internal Server Error'});
            return ;
        });
    }).catch((err) => {
        console.error(err.message);
        res.code(500).send({message: 'Internal Server Error'});
        return res;
    });

    res
        .status(201)
        .send({message: 'Tournament created successfully'});
}

