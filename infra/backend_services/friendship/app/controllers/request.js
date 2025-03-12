import fs from "../models.js";
import get_user from "../utils/whothisguy.js";



export default async function request(req, res) {

    const user_id  =  Number(req.params.user_id);
    if (isNaN(user_id)) {
        res.status(400).send({error: "Invalid user_id"});
        return;
    }

    if (req.user.id === user_id) {
        res.status(400).send({error: "You can't send request to yourself"});
        return;
    }

    const user = await get_user(req, user_id);
    if (!user) {
        res.status(404).send({error: "User not found"});
        return;
    }

    const records = await fs.query()
            .where({sender_id: req.user.id, received_id: user_id})
            .orWhere({sender_id: user_id, received_id: req.user.id});

    if (records.length > 0) {

        records.filter((record) => {
            if (record.status === "BL") {
                res.status(400).send({error: "You can't send request to " + user.username});
                return;
            }
        });

        records.filter((record) => {
            if (record.status === "FR") {
                res.status(400).send({error: "You are already friend with " + user.username});
                return;
            }
        });

        records.filter((record) => {
            if (record.status === "PN") {
                res.status(400).send({error: "Request already sent to " + user.username});
                return;
            }
        });
        return ;
    };



    await fs.query().insert({
        sender_id: req.user.id,
        received_id: user_id,
    })
    .then(() => {
        res.send({success: "Request Sent Successfully to " + user.username});
    }).catch((err) => {
        res.status(500).send({error: err});
    });
};