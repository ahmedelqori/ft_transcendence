import notif from '../models.js';


export default async function markAsRead(req, res) {
    const { id } = req.params;
    let records;

    try{
        if (id) {
            records = await notif.query().where({id, to: req.user.id}).delete();
        }else{
            records = await notif.query().where({to: req.user.id}).delete();
        }
        if (!records){
            res.status(404).send({message: 'Notification not found'});
            return;
        }
    }catch (err){
        console.log(err.message);
        res.status(500).send({message: 'Error marking as read'});
        return;
    }

    res.send({message: `Marked ${records} notifications as read`});
};