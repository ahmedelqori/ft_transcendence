export async function checkFriendship(friendId, authToken) {
    try {
        const response = await axios.get(`https://64.23.191.17/api/friends/${friendId}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
        });

        // Handle different response cases
        if (response.data.error) {
        if (response.data.error === "Unauthorized") {
            console.error("Unauthorized to check friendship status");
        } else if (response.data.error === "Invalid user_id") {
            console.error("Invalid user ID provided");
        }
        return false;
        }
        return response.data.state === "friend";
    } catch (error) {
        console.error("Error checking friendship:", error);
        return false;
    }
}