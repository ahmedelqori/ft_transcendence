import { tournament } from '../models.js'


export default async function get_tournaments(req, res) {
    const records = await tournament.query().where('owner_id', req.user.id);

    return res
        .status(200)
        .send(records);
}