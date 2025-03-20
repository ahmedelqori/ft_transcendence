import Player from "../models.js";



export default async function twoFA(req, res) {
    
    if (req.headers.origin !== process.env.ORIGIN) {
        res.status(401).send({ message: 'unauthorized' });
    };

    const { status } = req.body || {};
    if (!(status === true || status === false)) {
        res.status(400).send({ message: 'status can be true/false' });
        return;
    }

    Player.query().findOne({ id: req.user.id }).patch({ two_FA: status }).then((result) => {
        if (!result) {
            res.status(400).send({ message: '2FA is already enabled' });
            return;
        }
    }).catch((err) => {
        console.error('Database insertion error:', err);
    });
}



