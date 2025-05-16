import { Agent } from 'https';
import axios from 'axios';
export async function checkFriendship(friendId, authToken) {
    try {
        const response = await axios.get(`https://64.23.191.17/api/friends/${friendId}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        httpsAgent: new Agent({ 
            rejectUnauthorized: false // Dev only - remove in production
        })
        });
        if (response.data.status === "friend")
            return true;
        return false;
    } catch (error) {
        return false;
    }
}

