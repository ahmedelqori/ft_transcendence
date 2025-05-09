import EventEmitter from "events";

export const connections = new Map();

export const ev = new EventEmitter();

ev.on('new_notif', (notif) => {
    const n = {type: notif.type, payload: JSON.parse(notif.payload)};
    console.log('New notification:', n);
    
    if (connections.has(notif.to)){
        connections.get(notif.to).send(JSON.stringify(n));
    }
});

