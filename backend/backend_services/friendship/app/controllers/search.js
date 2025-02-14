import fs from '../models.js';
import get_user from './whothisguy.js';


export default async function search(req, res) {
    const { limit, offset } = req.query;
    const { status } = req.query;

    const fr_status = ['online', 'offline', 'in-game']
    const relation_status = ['blocked', 'pending'];

    const STATUS = { online: "ON", offline: "OF", "in-game": "IG", blocked: "BL", pending: "PN" };

    let arr = [];
    if (fr_status.includes(status)) {
        const records = await fs.query()
            .where({sender_id: req.user.id, status: "FR"})
            .orWhere({received_id: req.user.id, status: "FR"});
        for (const record of records) {
            let id = 0;
            if (record.received_id == req.user.id)
                id = record.sender_id;
            else
                id = record.received_id;
            const user = await get_user(req, id);
            if (user.status === STATUS[status])
                arr.push(user);
        }
    } else if (relation_status.includes(status)) {};



    arr = arr.slice(offset, offset + limit);
    res.send(arr);
};
