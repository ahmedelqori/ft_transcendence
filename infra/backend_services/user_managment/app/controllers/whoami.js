import axios from 'axios';



const whoami = async (req, reply) => {
    try{
        const r = await axios.get(`${process.env.TOURNAMENT_URL}${req.user.id}/wons`, {
            headers: {
                Authorization: req.headers.authorization,
            },
        })
        req.user.wons = r.data.wons;
    }catch{
        req.user.wons = 0;
    }
    reply.send( req.user );
};


export default whoami;