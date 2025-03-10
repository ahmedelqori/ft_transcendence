


export default async function search_validation(req, res) {
    let offset = req.query.offset || 0;
    let limit = req.query.limit || 10;
    let q = req.query.q || '';

    offset = Number(offset);
    limit = Number(limit);

    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit < 0 || limit > 100 || q.length > 100 || q.length < 1) {
        res.code(400).send({error: "Invalid parameters"});
        return;
    };

    req.query.offset = offset;
    req.query.limit = limit;
    req.query.q = q;
};