import Player from "../models.js";



export default async function search(req, res) {
    const {q, offset, limit} = req.query;

    try {
        const players = await Player.query()
            .where('username', 'like', `%${q}%`)
            .orWhere('first_name', 'like', `%${q}%`)
            .orWhere('last_name', 'like', `%${q}%`)
            .offset(offset)
            .limit(limit);

        for (const player of players) {
            delete player.email;
            delete player.two_FA;
        }

        res.status(200).send({ result: players });
    } catch (error) {
        console.error('Error searching players:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};