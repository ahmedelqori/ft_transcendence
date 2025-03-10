import axios from 'axios';

export default async function get_user(req, user_id) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return null;
    };

    let response;
    try{
        response = await axios.get(process.env.WHO_THIS_GUY_URL + String(user_id), {headers:{
            authorization: authorization
        }});
        if (response.status !== 200) {
            return null;
        }
    }
    catch(err){
        console.log(err.status);
        return null;
    };

    return response.data;
};