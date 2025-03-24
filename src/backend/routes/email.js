import express from "express";
import rateLimit from 'express-rate-limit';
import "dotenv/config";
import { leaveMessage } from "../controllers/emailController.js"

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24hrs
  max: 2, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    // Calculate reset time
    res.status(429).json({
      status: 429,
      error: 'Too many requests',
      message: 'You can only leave 2 messages per day.',
      resetAt: req.rateLimit.resetTime,
      cooldown: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) // seconds until reset
    });
  }
});

router.use("/leave-message", apiLimiter);
router.post("/leave-message", leaveMessage);

export default router;
