import fs from '../models.js';


export default async function reject(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const records = await fs.query().where({sender_id: user_id, received_id: req.user.id}).delete();
    if (!records){
        res.code(404).send({message: "Request not found"});
        return;
    }
    res.send({success: "Request rejected"});
};




