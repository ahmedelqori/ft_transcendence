import notif from '../models.js';


export default async function get_notif(req, res) {

    try{
        const records = await notif.query()
            .where({to: req.user.id})
            .select('id', 'level', 'message');
        res.status(201).send({result: records});
    }catch (err){
        console.log.err(err);
        res.status(500).send({error: err.message});
    }
};

