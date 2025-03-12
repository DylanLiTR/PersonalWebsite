import express from 'express';
import { fetchProfile } from '../controllers/DuolingoController.js';

const router = express.Router();

router.get("/:username", fetchProfile);

export default router;