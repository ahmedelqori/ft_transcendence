import fs from '../models.js';



export default async function unblock(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const record = await fs.query()
            .where({sender_id: req.user.id, received_id: user_id, status: "BL"})
            .delete();
    
    if (!record) {
        res.code(404).send({message: "User not blocked"});
        return;
    }

    res.send({success: "User unblocked"});
};