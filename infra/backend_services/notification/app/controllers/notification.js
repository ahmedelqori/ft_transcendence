import { connections} from './config.js';
import axios from 'axios';


async function update_user_status(req, status) {
    const authorization = req.query?.authorization;
    try {
        await axios.patch(process.env.UPDATE_USER_STATUS, {
            status,
        }, {
            headers: {
                Authorization: `Bearer ${authorization}`,
            },
        });
    }
    catch (err) {
        console.error('Request to update user status failed:', err);
        return;
    }
}

export function runHeartBeatMechanism(id, socket) {
  socket.isAlive = true;
  const pingInterval = setInterval(() => {
    if (socket.isAlive === false) {
      if (connections.has(id))
          connections.delete(id);
      clearInterval(pingInterval);
      socket.terminate();
      return;
    }
    socket.isAlive = false;
    try {
      socket.ping();
    } catch (err) {
      console.error(`${err.message}`);
    }
  }, 5000);

  if (!socket.pongActive) {
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.pongActive = true;
  }
  return pingInterval;
}

export default async function notification(connection, req) {
    console.log('New connection:');
    connections.set(req.user.id, connection);
    const heartbeat = runHeartBeatMechanism(req.user.id, connection)
    console.log('User ID:', req.user.id, " are online");
    update_user_status(req, "ON");

    connection.on('close', (event) => {
        console.log('Connection closed', event);
        clearInterval(heartbeat)
        if (connections.has(req.user.id))
            connections.delete(req.user.id);
        console.log('User ID:', req.user.id, " are offline");
        update_user_status(req, "OF");
});

    connection.on('error', (error) => {
        console.error('Connection error:', error);
        connections.delete(req.user.id);
    });
};