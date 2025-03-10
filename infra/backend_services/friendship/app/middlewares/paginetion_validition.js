

export default async function paginition_validation(req, res) {
    let offset = req.query.offset || 0;
    let limit = req.query.limit || 10;
    const status = req.query.status;

    const valide_status = ['online', 'offline', 'in-game', 'blocked', 'pending'];
    if (status && !valide_status.includes(status)) {
        res.code(400).send({message: "Invalid status"});
        return;
    }

    offset = Number(offset);
    limit = Number(limit);

    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit < 0 || limit > 100) {
        res.code(400).send({error: "Invalid parameters"});
        return;
    };

    req.query.offset = offset;
    req.query.limit = limit;
};