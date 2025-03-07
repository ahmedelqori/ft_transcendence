import { tournament } from "../models.js";

export default async function delete_tournament(req, res) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res
            .status(400)
            .send({message: 'Invalid id'});
    }

    const n = await tournament.query().where({
        id,
        owner_id: req.user.id
    }).delete();
    console.log(n);
    if (n === 0) {
        return res
            .status(404)
            .send({message: 'Tournament not found'});
    }
    return res
        .status(200)
        .send({message: 'Tournament deleted successfully'});
}

