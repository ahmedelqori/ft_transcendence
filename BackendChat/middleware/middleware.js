import axios from 'axios';
import {Agent} from "https"
export default async function auth(req, res) {
    const authorization = req.headers['authorization'];
    if (!authorization) {
        res.code(401).send({ message: 'Unauthorized' });
        return;
    };
    console.log('Authorization header:', authorization); 
    let response;
    try{
        response = await axios.get('https://64.23.191.17/api/account/whoami/', {
        headers: { 
            Authorization: authorization 
        },
        httpsAgent: new Agent({ 
            rejectUnauthorized: false // ⚠️ Disables SSL verification (INSECURE for production)
        })
        });
        if (response.status !== 200) {
            res.code(401).send({ message: 'Unauthorized' });
            return;
        }
    }
    catch(err){
        console.log(err)
        res.code(401).send({ message: 'Unauthorized' });
        return;
    };

    req.user = response.data;
};