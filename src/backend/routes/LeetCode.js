import express from 'express';
import { getProfile, refreshProfile } from '../controllers/LeetCodeController.js';

const router = express.Router();

// API endpoint to fetch LeetCode profile data
router.get('/profile', getProfile);

// Add a refresh endpoint to force a cache refresh
router.post('/refresh-profile', refreshProfile);

export default router;