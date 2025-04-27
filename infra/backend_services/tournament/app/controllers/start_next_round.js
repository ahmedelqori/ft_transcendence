import { tournament, tournament_games, tournament_players } from "../models.js";



export default function start_next_round(req, res) {
    const id = Number(req.params.id);
    console.log(id);
    res.send("DONE");
}

