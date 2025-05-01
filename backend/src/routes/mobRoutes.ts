// src/routes/mobRoutes.ts
import express from 'express';
import { 
  getMobs, 
  getMobById, 
  getMobsByType, 
  getMobsByLevelRange,
  createMob,
  getNearbyMobs
} from '../controllers/mobController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/mobs
// @desc    Get all mobs
// @access  Public
router.get('/', getMobs);

// @route   GET /api/mobs/nearby
// @desc    Get nearby mobs
// @access  Public
router.get('/nearby', getNearbyMobs);

// @route   GET /api/mobs/type/:type
// @desc    Get mobs by type
// @access  Public
router.get('/type/:type', getMobsByType);

// @route   GET /api/mobs/level
// @desc    Get mobs by level range
// @access  Public
router.get('/level', getMobsByLevelRange);

// @route   GET /api/mobs/:id
// @desc    Get mob by ID
// @access  Public
router.get('/:id', getMobById);

// @route   POST /api/mobs
// @desc    Create a new mob
// @access  Private/Admin
router.post('/', protect, admin, createMob);

export default router;