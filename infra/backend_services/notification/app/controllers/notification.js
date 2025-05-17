import { connections} from './config.js';
import axios from 'axios';


async function update_user_status(req, status) {
    try {
        await axios.patch(process.env.UPDATE_USER_STATUS, {
            status,
        }, {
            headers: {
                Authorization: `Bearer ${req.query.authorization}`,
            },
        });
    }
    catch (err) {
        console.error('Request to update user status failed:', err);
        return;
    }
}

export default async function notification(connection, req) {

    console.log('New connection:');
    connections.set(req.user.id, connection);


    console.log('User ID:', req.user.id, " are online");
    update_user_status(req, "ON");

    connection.on('close', (event) => {
        console.log('Connection closed', event);
        connections.delete(req.user.id);

        console.log('User ID:', req.user.id, " are offline");
        update_user_status(req, "OF");
});

    connection.on('error', (error) => {
        console.error('Connection error:', error);
        connections.delete(req.user.id);
    });
};