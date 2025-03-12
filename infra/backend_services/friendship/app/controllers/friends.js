import fs from '../models.js';
import get_user from '../utils/whothisguy.js';


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
        arr.push(user);
    }

    arr = arr.slice(offset, offset + limit);
    res.send(arr);
};

