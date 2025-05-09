import { connections} from './config.js';

export default async function notification(connection, req) {

    console.log('New connection:');
    connections.set(req.user.id, connection);

    connection.on('close', () => {
        console.log('Connection closed');
        connections.delete(req.user.id);
    });

    connection.on('error', (error) => {
        console.error('Connection error:', error);
        connections.delete(req.user.id);
    });
};