


export default async function start_tournament(req, res) {

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({error: 'Tournament ID is required'});
    }

    // tournament players == ka3 players round
    // or
    // 




    // check if previous round is finished
    // create games and save ID's in db
}


