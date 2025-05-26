import { tournament , tournament_players, tournament_settings} from '../models.js'
import notif from '../utils/send_notif.js';




export default async function invite_player(req, res) {
    const tournament_id = Number(req.params.id);
    const player_id = Number(req.body.player_id);

    if (isNaN(tournament_id) || tournament_id < 0 || isNaN(player_id) || player_id < 0){
        res.status(400).send({error: "Bad request"});
        return;
    }

    const t = await tournament_players.query().where({tournament_id, player_id: req.user.id});

    if (t.length > 0){
        try{
            const settings = await tournament_settings.query().where({ tournament_id }).select('code').first();
            if (!settings) {
                res.status(404).send({error: "Tournament does not exist"});
                return;
            }
            const invite_link =  `${process.env.DOMAIN}/api/tournament/${tournament_id}/join?code=${settings.code}`;
            await notif(req, player_id, "tournamentInvite", {invite_link, tournament_id});
        }
        catch (error) {
            console.error(error);
            res.status(500).send({error: "error to send invite"});
            return;
        }
        res.send({message: "Done"});
    }
    else{
        res
        .status(403)
        .send({error: "you cannot invite player to this tournament"});
    }

}
