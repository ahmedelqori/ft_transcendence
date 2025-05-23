import Player from "../models.js";
import { secrets } from "../server.js";


export default async function twoFA(req, res) {
    
    console.log('req.headers.origin', req.headers.origin);
    console.log('process.env.ORIGIN', secrets.ORIGIN_S2S);

    if (req.headers.origin !== secrets.ORIGIN_S2S) {
        res.status(401).send({ message: 'unauthorized' });
        return ;
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
    }).then(() => {
        res.status(200).send({ message: '2FA status updated' });
    }).catch((err) => {
        console.error('Database insertion error:', err);
        res.status(500).send({ message: 'Internal server error' });
    });
}



