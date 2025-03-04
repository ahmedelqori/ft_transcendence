import ev from './event.js';

export default async function notification(connection, req) {
    console.log('Client connected to WebSocket');

    ev.on('new_notif', (notif) => {
        const n = {level: notif.level, message: notif.message};
        connection.send(JSON.stringify(n));
    });
};


