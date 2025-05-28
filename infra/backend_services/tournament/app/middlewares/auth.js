import axios from 'axios';
import https from 'https'; // just temporarily to accept self-signed certificates

export default async function auth(req, res) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.code(401).send({ message: 'Unauthorized' });
        return;
    }

    let response;
    try {
        response = await axios.get(process.env.WHOAMI_URL, {
            headers: {
                authorization: authorization,
            }
        });
        if (response.status !== 200) {
            console.log("Error: ", response.status);
            res.code(401).send({ message: 'Unauthorized' });
            return;
        }
    } catch (err) {
        console.log("Error:", err.message, process.env.WHOAMI_URL);
        res.code(401).send({ message: 'Unauthorized' });
        return;
    }

    req.user = response.data;
}


