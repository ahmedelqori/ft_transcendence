import { tournament, tournament_settings, tournament_players } from "../models.js";
import get_user from "../utils/whoThisGuy.js";

export default async function get_tournament(req, res) {
    const id = Number(req.params.id);

    if (isNaN(id) || id < 0) {
        return res.status(400).send({ message: "Invalid id" });
    }

    try {
        const t = await tournament.query().findById(id);

        if (!t) {
            return res.status(404).send({ message: "Tournament not found" });
        }

        let settings, invite_link;
        if (req.user && t.owner_id === req.user.id) {
            settings = await tournament_settings.query().where({ tournament_id: id }).select('code').first();
            invite_link =  `http://localhost:3004/api/tournament/${t.id}/join?code=${settings.code}`;
            // invite_link =  `${process.env.DOMAIN}/api/tournament/${t.id}/join?code=${settings.code}`;
        }

        const n = (await tournament_players.query().where('tournament_id', t.id)).length;
        const owner_user = await get_user(req, t.owner_id);
        const tr = {
            id: t.id,
            name: t.tournament_name,
            owner: owner_user,
            settings,
            invite_link,
            total_places: t.players_number,
            total_players: n,
            status: t.status,
            created_at: t.created_at,
        };

        res.send(tr);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
}
