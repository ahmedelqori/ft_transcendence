import notif from '../models.js';
import get_user from '../utils/whoThisGuy.js';


export default async function get_notif(req, res) {

    try{
        const records = await notif.query()
            .where('to', req.user.id)
            .whereIn('type', ['friendRequest', 'inviteToMatch', 'tournamentInvite'])
            .select('id', 'type', 'payload');
        for (let i = 0; i < records.length; i++) {
            records[i].payload = JSON.parse(records[i].payload);
            records[i].Sender = await get_user(req, records[i].payload.senderId);
        }
        res.status(200).send({result: records});
    }catch (err){
        console.log(err);
        res.status(500).send({error: err.message});
    }
};

