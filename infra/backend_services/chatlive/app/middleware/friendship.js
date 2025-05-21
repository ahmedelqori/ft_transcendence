import { Agent } from 'https';
import axios from 'axios';
export async function checkFriendship(friendId, authToken) {
    try {
        const response = await axios.get(`${process.env.FRIENDSHIP_URL}${friendId}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
        });
        if (response.data.status === "friend")
            return true;
        return false;
    } catch (error) {
        return false;
    }
}

// import { Agent } from 'https';
// import axios from 'axios';
// export async function checkFriendship(friendId, authToken) {
//     try {
//         const DOMAIN = process.env.DOMAIN ;
//         const response = await axios.get(`${DOMAIN}/api/friends/${friendId}`, {
//         headers: {
//             'Authorization': `Bearer ${authToken}`
//         },
//         httpsAgent: new Agent({ 
//             rejectUnauthorized: false // Dev only - remove in production
//         })
//         });
//         if (response.data.status === "friend")
//             return true;
//         return false;
//     } catch (error) {
//         return false;
//     }
// }