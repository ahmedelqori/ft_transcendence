import fs from '../models.js';


export default async function accept(req, res) {
    const user_id = Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.code(400).send({message: "Invalid user_id"});
        return;
    };

    const record = await fs.query().where({sender_id: user_id, received_id: req.user.id, status: "PN"}).first();

    if (record) {
        await fs.query().patchAndFetchById(record.id, {status: "FR"});
        res.send({success: "Request accepted"});
    } else {
        res.code(404).send({message: "Request not found"});
        return;
    }
};




