import express from 'express';
import { ensureValidToken, getCurrentTrack, getRefreshToken, callback } from '../controllers/SpotifyController.js';

const router = express.Router();

// Get currently playing track
router.get("/currently-playing", ensureValidToken, getCurrentTrack);

// Add this route temporarily to your server
router.get("/get-refresh-token", getRefreshToken);;

// Handle Spotify callback to get refresh token
router.get("/callback", callback);

export default router;
