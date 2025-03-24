import axios from "axios";

export const fetchProfile = async (req, res) => {
    const username = req.params.username;
    const url = `https://www.duolingo.com/2017-06-30/users?username=${username}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0", // Mimic browser request to avoid blocking
            },
        });
    
        if (!response.data.users || response.data.users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
    
        const user = response.data.users[0]; // Extract the first user
    
        res.json(user); // Send the whole user object to the frontend
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Duolingo data" });
    }
}