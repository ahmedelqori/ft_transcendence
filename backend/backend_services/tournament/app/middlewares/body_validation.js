


export default async function body_validation(req, res) {
    const {tournament_name, nickname, players_number} = req.body;
    if (!tournament_name || !nickname || !players_number) {
        res.code(400).send({ message: 'Bad Request' });
        return;
    }

    const players_number_list = [4, 8, 16];

    if (!players_number_list.includes(players_number) || nickname.length < 3 || nickname.length > 20 || tournament_name.length < 3 || tournament_name.length > 20) {
        res.code(400).send({ message: 'Bad Request' });
        return;
    }

    if (tournament_name.match(/[^a-zA-Z0-9-_]/) || nickname.match(/[^a-zA-Z0-9-_]/)) {
        res.code(400).send({ message: 'Bad Request' });
        return;
    }
}
