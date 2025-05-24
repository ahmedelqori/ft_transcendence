import notif from '../models.js';
import { ev } from './config.js';

const TYPE = [
    'friendRequest', // friendship service
    'directMessage', // chat service
    'inviteToMatch', // game service
    'gameAccepted', // game service
    'gameDeclined', // game service
    'tournamentInvite', // tournament service
    'info', // others service
];

export default async function new_notif(req, res) {
    const {to, type, payload} = req.body;

    if (!TYPE.includes(type)) {
        res.status(400).send({message: 'Invalid level'});
        return;
    };

    try{
        notif.query().insert({
            to,
            type,
            payload: JSON.stringify(payload),
        }).then((notif) => {
            notif.user = req.user;
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