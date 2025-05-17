import fs from '../models.js';
import get_user from '../utils/whothisguy.js';

async function relation_with_user(my_id, user_id) {

    const records = await fs.query()
                .where({sender_id: my_id, received_id: user_id})
                .orWhere({sender_id: user_id, received_id: my_id});
    
    if (records.filter(record => record.status === "BL").length > 0){
        return "blocked";
    }
    else if (records.filter(record => record.status === "FR").length > 0){
        return "friend";
    }
    else if (records.filter(record => record.status === "PN").length > 0){
        return "pending";
    }
    else {
        return "none";
    }
};


export default async function friends(req, res) {
    const { limit, offset } = req.query;
    const records = await fs.query()
                .where({sender_id: req.user.id, status: "FR"})
                .orWhere({received_id: req.user.id, status: "FR"});

    let arr = [];
    for (const record of records) {
        let id = 0;
        if (record.received_id == req.user.id)
            id = record.sender_id;
        else
            id = record.received_id;

        const user = await get_user(req, id);
        user.relation = await relation_with_user(req.user.id, id);
        arr.push(user);
    }

    arr = arr.slice(offset, offset + limit);
    res.send(arr);
};

