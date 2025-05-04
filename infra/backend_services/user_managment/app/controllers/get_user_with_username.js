import Player from '../models.js';

export default async function get_user_with_username(req, res) {
    const {username} = req.params;

    try{
        const player = await Player.query().where({username}).first();
        if (!player) {
            res.status(404);
            res.send({'error': 'User not found'});
            return;
        }
        delete player.email;
        delete player.two_FA;
        res
            .status(200)
            .send(player);
    }
    catch (e) {
        console.log(e);
        res.status(500);
        res.send({'error': 'An error occured'});
    }
};