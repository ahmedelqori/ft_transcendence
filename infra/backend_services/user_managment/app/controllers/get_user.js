import Player from '../models.js';

async function get_user_with_id(req, res) {
    const id = Number(req.params.identifier);

    if (isNaN(id) || id < 0) {
        res.status(400);
        res.send({'error': 'Invalid user id'});
        return;
    };

    try{
        const player = await Player.query().findById(id);
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


async function get_user_with_username(req, res) {
    const username = req.params.identifier;

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

export default async function get_user(req, res) {
    const { identifier } = req.params;
    if (!isNaN(parseInt(identifier))) {
        return get_user_with_id(req, res);
    } else {
        return get_user_with_username(req, res);
    }
}