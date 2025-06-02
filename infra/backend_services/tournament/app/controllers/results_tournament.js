import { tournament, tournament_games, tournament_players } from "../models.js";
import axios from "axios";
import get_user from "../utils/whoThisGuy.js";


export default async function results_tournament(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({error: 'Tournament ID is required'});
    }

    const t = await tournament.query().where({id}).first();
    const p = await tournament_players.query().where({tournament_id: id, player_id: req.user.id});
    console.log("tournament players: ", p);
    if (!t || !p.length){
        return res.status(404).send({error: 'Tournament ID is not exist'});
    }


    const games = await tournament_games.query().where({tournament_id: id});

    
    let winner;
    let round2 = [];
    let round4 = [];
    let round8 = [];
    let round16 = [];
    

    
    for (let i = 0; i < games.length; i++) {
        try {
            const game = await axios.get(process.env.GAME_URL + games[i].game_id, {
                headers: {
                    Authorization: req.headers.authorization
                }
            });

            if (games[i].round == 2) {
                const winnerRecord = await tournament_players.query().where({
                    tournament_id: id,
                    round: 1
                }).first().select('player_id');
                if (winnerRecord) {
                    winner = await get_user(req, winnerRecord.player_id, id);
                }
            }

            if (games[i].round == 2){
                round2.push(
                    {
                        // playerOne: await get_user(req, game.data.playerOneId, id),
                        // playerTwo: await get_user(req, game.data.playerTwoId, id)
                        game: game.data
                    }
                );
            }

            if (games[i].round == 4){
                round4.push(
                    {
                        // playerOne: await get_user(req, game.data.playerOneId, id),
                        // playerTwo: await get_user(req, game.data.playerTwoId, id)
                        game: game.data
                    }
                );
            }

            if (games[i].round == 8){
                round8.push(
                    {
                        // playerOne: await get_user(req, game.data.playerOneId, id),
                        // playerTwo: await get_user(req, game.data.playerTwoId, id)
                        game: game.data
                    }
                );
            }

            if (games[i].round == 16){
                round16.push(
                    {
                        // playerOne: await get_user(req, game.data.playerOneId, id),
                        // playerTwo: await get_user(req, game.data.playerTwoId, id)
                        game: game.data
                    }
                );
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send({error: 'Error getting game matches'});
        }
    }
    
    
    const aaa = await tournament_players.query().where({tournament_id: id}).select('player_id');
    const players = [];
    for (let i = 0; i < aaa.length; i++) {
        const user = await get_user(req, aaa[i].player_id, id);
        if (user) {
            players.push(user);
        }
    }
    
    const results = {
        name: t.tournament_name,
        first_round: t.players_number,
        players: players,
        status: t.status,
        rounds: {
            round16: round16,
            round8: round8,
            round4: round4,
            round2: round2,
            winner: winner,
        }
        
    };
    
    res.status(200).send(results);
    return;
}