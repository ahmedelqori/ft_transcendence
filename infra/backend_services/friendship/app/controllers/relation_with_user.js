import fs from '../models.js';



export default async function relation_with_user(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const records = await fs.query()
                .where({sender_id: req.user.id, received_id: user_id})
                .orWhere({sender_id: user_id, received_id: req.user.id});
    
    if (records.filter(record => record.status === "BL").length > 0){
        res.send({status: "blocked"});
        return;
    }
    else if (records.filter(record => record.status === "FR").length > 0){
        res.send({status: "friend"});
        return;
    }
    else if (records.filter(record => record.status === "PN").length > 0){
        res.send({status: "pending"});
        return;
    }
    else {
        res.send({status: "none"});
        return;
    }
};