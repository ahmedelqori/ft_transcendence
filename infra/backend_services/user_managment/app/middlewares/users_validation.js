




export default async function users(req, res) {
    
    const n = Number(req.query.n);
    
    if (isNaN(n) || n < 0) {
        res.status(400);
        res.send({'error': 'Invalid number of users'});
        return;
    };
    
    const valide_choices = ['newest', 'oldest'];
    const sort = req.query.sort;
    if (!valide_choices.includes(sort)) {
        res.status(400);
        res.send({'error': 'Invalid sort parameter'});
        return;
    };

    req.query.n = n;
    req.query.sort = sort;
};