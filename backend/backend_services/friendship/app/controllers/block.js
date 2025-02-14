import fs from '../models.js';



export default async function block(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };


    const record = await fs.query()
            .where({sender_id: req.user.id, received_id: user_id, status: "BL"});

    if (record.length) {
        res.code(404).send({message: "User already blocked"});
        return;
    }

    await fs.query().insert({sender_id: req.user.id, received_id: user_id, status: "BL"});
    res.send({success: "User blocked"});
    
};