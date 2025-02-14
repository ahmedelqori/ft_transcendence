import fs from '../models.js';



export default async function friends(req, res) {

    const records = await fs.query()
                .where({sender_id: req.user.id, status: "FR"})
                .orWhere({received_id: req.user.id, status: "FR"});

    records.forEach(record => {
        const 
    });
    res.send(records);
};

