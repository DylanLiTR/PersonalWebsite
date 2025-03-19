import express from 'express';
import rateLimit from 'express-rate-limit';
import { getResponse } from '../controllers/chatbotController.js';

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    // Calculate reset time
    res.status(429).json({
      status: 429,
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      resetAt: req.rateLimit.resetTime,
      cooldown: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) // seconds until reset
    });
  }
});

router.use((req, res, next) => {
  // Make rate limit headers accessible to the frontend
  res.header('Access-Control-Expose-Headers', 'X-RateLimit-Reset');
  next();
});

router.use('/chat', apiLimiter);

router.post('/chat', getResponse);

export default router;
