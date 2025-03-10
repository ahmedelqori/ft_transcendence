import fs from '../models.js';



export default async function cancel_request(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const record = await fs.query()
            .where({sender_id: req.user.id, received_id: user_id, status: "PN"})
            .delete();

    if (!record) {
        res.code(404).send({message: "Request not found"});
        return;
    }

    res.send({success: "Request canceled"});
};