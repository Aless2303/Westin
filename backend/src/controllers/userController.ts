// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import User from '../models/userModel';
import { ApiError } from '../middleware/errorMiddleware';
import bcrypt from 'bcrypt';

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updateUserPassword = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError('Not authorized', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError('Both current and new password are required', 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      throw new ApiError('Current password is incorrect', 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};