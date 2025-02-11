import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = 3001; // Backend runs on port 3001

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Spotify API credentials
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Generates a random string for authentication
const generateRandomString = length => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => possible[Math.floor(Math.random() * possible.length)]).join("");
};

// Spotify login route
app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie("spotify_auth_state", state);

  // In server.js, update the scope in the login route
  const scope = [
    'streaming',              // Required for playback
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'user-read-private'       // Required to check premium status
  ].join(' ');
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
  res.redirect(authUrl);
});

// Spotify callback route
app.post("/callback", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const response = await axios.post("https://accounts.spotify.com/api/token", 
      new URLSearchParams({
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }), {
        headers: {
          Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    res.json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify" });
  }
});

app.get("/callback", async (req, res) => {
  console.log('Received callback request');
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies["spotify_auth_state"] : null;

  console.log('Code:', code);
  console.log('State:', state);
  console.log('Stored State:', storedState);

  if (state === null || state !== storedState) {
    console.error('State mismatch or null');
    return res.status(400).send("State mismatch");
  }

  res.clearCookie("spotify_auth_state");

  try {
    console.log('Requesting access token from Spotify');
    const response = await axios.post("https://accounts.spotify.com/api/token", 
      new URLSearchParams({
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }), {
        headers: {
          Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log('Received token response');
    const { access_token, refresh_token, expires_in } = response.data;
    
    // Instead of sending JSON, redirect back to the frontend with the token
    const redirectUrl = `http://localhost:5173?access_token=${access_token}&refresh_token=${refresh_token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify" });
  }
});

// Refresh token route
app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;

  try {
    const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
