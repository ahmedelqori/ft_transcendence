import fs from '../models.js';


export default async function unfriend(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const record = await fs.query()
            .where({sender_id: req.user.id, received_id: user_id, status: "FR"})
            .orWhere({sender_id: user_id, received_id: req.user.id, status: "FR"})
            .delete();

    if (!record) {
        res.code(404).send({message: "you are not friend with this user"});
        return;
    }

    res.send({success: "Unfriend success"});
};