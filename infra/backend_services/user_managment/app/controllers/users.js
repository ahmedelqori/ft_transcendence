import Player from '../models.js';



export default async function users(req, res) {
    const {n, sort} = req.query;
    const type = {
        'newest': 'desc',
        'oldest': 'asc'
    };

    try{
        const users = await Player.query().orderBy('created_at', type[sort]).limit(n);
        res
            .status(200)
            .send(users);
    }
    catch (e) {
        console.log(e);
        res.status(500);
        res.send({'error': 'An error occured'});
    }

}