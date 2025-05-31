import { tournament, tournament_games, tournament_players } from "../models.js";
import notif from '../utils/send_notif.js';
import axios from "axios";


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

export default async function start_next_round(req, res) {
    if (req.headers.origin !== process.env.ORIGIN) {
        res.status(401).send({ message: 'unauthorized' });
        return ;
    }

    const { tournementId, winnerId } = req.body.game;
    console.log('req body :',req.body);
    
    if (!tournementId || !winnerId) {
        res.status(400).send("Missing required fields");
        return;
    }
    // update winner round of the game
    const r = await tournament_players.query().where({
        tournament_id: tournementId,
        player_id: winnerId
    }).first();

    if (!r || r.round / 2 == r.round) {
        res.status(500).send({error: "Player not found or lose or already win the tournament"});
        return;
    }
    if (r.round < 2){
        res.send({message: "Tournament are finished"});
        return;
    }
    await tournament_players.query().where({
        tournament_id: tournementId,
        player_id: winnerId
    }).first().patch({round: r.round / 2});

    if (r.round / 2 == 1) {
        await tournament.query().patchAndFetchById(tournementId, {
            status: 'COMPLETE'
            // status: 'FINISHED'
        });
        reload_tournament(req, tournementId);
        res.status(200);
        return;
    }

    // check if all games are finished start createing the next round
    // const players = await tournament_players.query().where({
    //     tournament_id: tournementId,
    //     round: r.round / 2
    // });

    // if (r.round / 2 == players.length && players.length > 1) {
    //     console.log("should create new round");
    //     for (let i = 0; i < players.length; i+=2) {
    //         console.log("Create game: ", players[i].player_id, "Vs", players[i+ 1].player_id);
    //         const response = await axios.post(process.env.GAME_URL, {
    //             playerOneId: players[i].player_id,
    //             playerTwoId: players[i + 1].player_id,
    //             // tournamentId: tournementId
    //             tournementId: tournementId
    //             }, {
    //             headers: {
    //                 Authorization: req.headers.authorization
    //             }
    //             }
    //         );
    //         try {
    //             await tournament_games.query().insert({
    //                 tournament_id: tournementId,
    //                 round: r.round / 2,
    //                 game_id: response.data.id,
    //             });
    //             console.log("Game created: ", response.data.id);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    // }

    res.send({message: 'tournament started successfully'});
}

