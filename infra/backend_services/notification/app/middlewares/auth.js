import axios from 'axios';

export default async function auth(req, res) {
    const authorization = req.headers.authorization || req.query.authorization;
    if (!authorization) {
        res.code(401).send({ message: 'Unauthorized' });
        return;
    };

    let response;
    try{
        response = await axios.get(process.env.WHOAMI_URL, {headers:{
            authorization: authorization
        }});
        if (response.status !== 200) {
            res.code(401).send({ message: 'Unauthorized' });
            return;
        }
    }catch(err){
        res.code(401).send({ message: 'Unauthorized' });
        return;
    };

    req.user = response.data;
};


