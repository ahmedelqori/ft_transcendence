import notif from '../models.js';
import ev from './event.js';


export default async function new_notif(req, res) {
    const {level, message} = req.body;


    if (!['info', 'warning', 'error'].includes(level)) {
        res.status(400).send({message: 'Invalid level'});
        return;
    };

    try{
        await notif.query().insert({
            to: req.user.id,
            level,
            message
        })
        .then((notif) => {
            ev.emit('new_notif', notif);
        });
    }catch (err){
        console.log(err.message);
        res
            .status(400)
            .send({message: 'Error creating notification'});
        return ;
    }
    
    res.status(201).send({message: 'Created'});
};