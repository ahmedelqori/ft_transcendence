import EventEmitter from "events";

export const connections = new Map();

export const ev = new EventEmitter();

ev.on('new_notif', (notif) => {
    // 
    const n = {id: notif.id, Sender: notif.user, type: notif.type, payload: JSON.parse(notif.payload)};
    console.log('New notification:', n);
    
    console.log('To:', notif.to);

    if (connections.has(notif.to)){
        connections.get(notif.to).send(JSON.stringify(n));
    }
});

