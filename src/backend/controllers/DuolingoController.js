export const fetchProfile = async (req, res) => {
  const username = req.params.username;
  const url = `https://www.duolingo.com/2017-06-30/users?username=${username}`;

  try {
      const response = await fetch(url, {
          headers: {
              "User-Agent": "Mozilla/5.0" // Mimic browser request to avoid blocking
          }
      });
      if (!response.ok) throw new Error("User not found or API blocked");

      const data = await response.json();
        if (!data.users || data.users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = data.users[0]; // Extract the first user

        res.json(user); // Send the whole user object to the frontend
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch Duolingo data" });
  }
}