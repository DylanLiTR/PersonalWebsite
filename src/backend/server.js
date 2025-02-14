// server.js
import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

let current_access_token = null;
let token_expiry = null;

// Function to get a new access token using refresh token
const getNewAccessToken = async () => {
  try {
    const response = await axios.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    current_access_token = response.data.access_token;
    token_expiry = Date.now() + (response.data.expires_in * 1000);
    return current_access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

// Middleware to ensure we have a valid access token
const ensureValidToken = async (req, res, next) => {
  try {
    if (!current_access_token || Date.now() >= token_expiry) {
      await getNewAccessToken();
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to get access token" });
  }
};

// Get currently playing track
app.get("/currently-playing", ensureValidToken, async (req, res) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { 'Authorization': `Bearer ${current_access_token}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currently playing track" });
  }
});

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
// Add this route temporarily to your server
app.get("/get-refresh-token", (req, res) => {
  const scope = "user-read-playback-state user-read-currently-playing playlist-read-private";
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authUrl);
});

// Handle Spotify callback to get refresh token
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange authorization code for access/refresh tokens
    const response = await axios.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const { access_token, refresh_token } = response.data;

    // Log the refresh token (store this in your .env file)
    console.log("NEW REFRESH TOKEN:", refresh_token);

    res.send(`Success! Replace the SPOTIFY_REFRESH_TOKEN in your .env file with: ${refresh_token}`);
  } catch (error) {
    console.error("Error during token exchange:", error.response.data);
    res.status(500).send("Failed to get tokens");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
