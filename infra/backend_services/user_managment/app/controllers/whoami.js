import axios from 'axios';



const whoami = async (req, reply) => {
    const r = await axios.get(`${process.env.TOURNAMENT_URL}${req.user.id}/wons`, {
        headers: {
            Authorization: req.headers.authorization,
        },
    })
    req.user.wons = r.data.wons;
    reply.send( req.user );
};


export default whoami;