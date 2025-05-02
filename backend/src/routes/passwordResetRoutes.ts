// backend/src/routes/passwordResetRoutes.ts
import express from 'express';
import { 
  requestPasswordReset,
  validateResetToken,
  resetPassword
} from '../controllers/passwordResetController';

const router = express.Router();

// @route   POST /api/password/request-reset
// @desc    Request password reset
// @access  Public
router.post('/request-reset', requestPasswordReset);

// @route   GET /api/password/validate-token/:token
// @desc    Validate reset token
// @access  Public
router.get('/validate-token/:token', validateResetToken);

// @route   POST /api/password/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', resetPassword);

export default router;