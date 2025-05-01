// src/routes/userRoutes.ts
import express from 'express';
import { getUserById, updateUserPassword } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', protect, updateUserPassword);

export default router;