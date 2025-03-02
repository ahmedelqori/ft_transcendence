import notif from '../models.js';


export default async function new_notif(req, res) {
    const {level, message} = req.body;

    if (!['info', 'warning', 'error'].includes(level)) {
        res.code(400).send({message: 'Invalid level'});
        return;
    };

    notif.query().insert({
        level: level,
        message: message,
        to: req.user.id
    });

    res.code(201).send({message: 'Created'});
};