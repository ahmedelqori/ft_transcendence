import { tournament, tournament_games, tournament_players } from "../models.js";
import axios from "axios";


async function already_started(id, round) {
    // const games = await tournament_games.query().where({
    //     tournament_id: id,
    //     round: round
    // });
    // return games.length > 0;
    return false;
}

export default async function start_tournament(req, res) {

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({error: 'Tournament ID is required'});
    }

    const t = await tournament.query().where({id}).first();
    if (!t || t.owner_id != req.user.id){
        return res.status(400).send({error: 'Tournament ID is not exist'});
    }

    if (t.status == 'STARTED'){

        // get last round
        const records = await tournament_players.query().where({tournament_id: id}).orderBy('round', '');
        const round = records[0].round;

        const players = await tournament_players.query().where({
            tournament_id: id,
            round: round
        });
        // console.log("Players in round: ", players.length, "Round: ", round, "aaaa: ", !already_started(id, round));

        if (round == players.length && players.length > 1) {
            console.log("should create new round");
            for (let i = 0; i < players.length; i+=2) {
                console.log("Create game: ", players[i].player_id, "Vs", players[i+ 1].player_id);
                const response = await axios.post(process.env.GAME_URL, {
                    playerOneId: players[i].player_id,
                    playerTwoId: players[i + 1].player_id,
                    // tournamentId: tournementId
                    tournementId: id
                    }, {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                    }
                );
                try {
                    await tournament_games.query().insert({
                        tournament_id: id,
                        round: round,
                        game_id: response.data.id,
                    });
                    console.log("Game created: ", response.data.id);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        else {
            return res.status(400).send({error: 'Not enough players to create next round or already started'});
        }
        return res.send({message: 'tournament create next round successfully'});
    }
    else if (t.status != 'READY'){
        return res.status(400).send({error: 'Tournament is not ready'});
    }

    const players = await tournament_players.query().where({tournament_id: id});
    for (let i = 0; i < players.length; i++) {
        if (players[i].round != t.players_number) {
            return res.status(400).send({error: 'tournament already started'});
        }
    }
    for (let i = 0; i < players.length; i+=2) {
        console.log("Create game: ", players[i].player_id, "Vs", players[i+ 1].player_id);
        let r;
        try {
            try{
                    r = await axios.post(process.env.GAME_URL, {
                    playerOneId: players[i].player_id,
                    playerTwoId: players[i + 1].player_id,
                    // tournamentId: id
                    tournementId: id
                    }, {
                    headers: {
                        Authorization: req.headers.authorization
                    },
                }
                );
            } catch (error) {
                console.log("Error creating game: ", error.data);
                return res.status(500).send({error: 'Error creating game'});
            }
            await tournament_games.query().insert({
                tournament_id: id,
                round: t.players_number,
                game_id: r.data.id,
            });
            console.log("Game created: ", r.data.id);
        } catch (error) {
            console.log(error);
        }
    }


    await tournament.query().patchAndFetchById(id, {
        status: 'STARTED'
    });
    
    res.status(200).send({message: 'Tournament started'});
}

