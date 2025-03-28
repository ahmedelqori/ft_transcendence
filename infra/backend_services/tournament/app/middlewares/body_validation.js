


export default async function body_validation(req, res) {
    const tournament_name = req.body.tournament_name;
    const players_number = req.body.players_number;
    const nickname = req.body.nickname;
    if (!tournament_name || !nickname || !players_number) {
        res.status(400).send({ message: 'Bad Request1' });
        return;
    }

    const players_number_list = [4, 8, 16];

    if (!players_number_list.includes(players_number) || nickname.length < 3 || nickname.length > 20 || tournament_name.length < 3 || tournament_name.length > 20) {
        res.code(400).send({ message: 'You can only create a tournament with 4, 8, or 16 players.' });   return;
    }

    if (tournament_name.match(/[^a-zA-Z0-9-_]/) || nickname.match(/[^a-zA-Z0-9-_]/)) {
        res.code(400).send({ message: 'Tournament name and nickname can only contain letters, numbers, and underscores.' });
        return;
    }
}
