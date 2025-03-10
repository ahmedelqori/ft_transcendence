



const whoami = async (req, reply) => {
    reply.send( req.user );
};


export default whoami;