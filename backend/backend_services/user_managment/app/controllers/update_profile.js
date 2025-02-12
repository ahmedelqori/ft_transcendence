import Player  from '../models.js'

const validateField = (value, type) => {
    if (value.length < 3) {
        throw new Error(`${type} too short`);
    }
    if (value.length > 30) {
        throw new Error(`${type} too long`);
    }
    for (const c of value) {
        if (!c.match(/[a-zA-Z0-9_-]/)) {
            throw new Error(`${type} should only contain letters, numbers, underscores, and hyphens`);
        }
    }
};

const check_body = async (req, body) => {
    const newProfileData = {};

    if (body.username) {
        validateField(body.username, 'Username');
        const player = await Player.query().where('username', body.username).first();
        if (player && player.id !== req.user.id) {
            throw new Error('Username already taken');
        }
        newProfileData.username = body.username;
    }
    if (body.first_name) {
        validateField(body.first_name, 'First name');
        newProfileData.first_name = body.first_name;
    }
    if (body.last_name) {
        validateField(body.last_name, 'Last name');
        newProfileData.last_name = body.last_name;
    }
    if (body.bio) {
        newProfileData.bio = body.bio;
    }
    if (body.status) {
        newProfileData.status = body.status;
    }
    return newProfileData;  
};


const update_profile = async (req, reply) => {
    try {
        const newProfileData = await check_body(req, req.body);
        const player = await Player.query().findById(req.user.id);
        if (!player) {
            return reply.status(500).send('Tell the devs to fix this \'9a2sd86fg35\'');
        }
        
        await Player.query().patchAndFetchById(req.user.id, newProfileData);
        const updatedPlayer = await Player.query().findById(req.user.id);
        reply.send(updatedPlayer);
    } catch (error) {
        reply.status(400).send({ 'error': error.message });
    }
}

export default update_profile;