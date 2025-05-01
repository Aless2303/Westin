// src/routes/authRoutes.ts
import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user and character
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authUser);

// @route   GET /api/auth/profile
// @desc    Get user profile and character info
// @access  Private
router.get('/profile', protect, getUserProfile);

export default router;