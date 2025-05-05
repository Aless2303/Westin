// src/routes/characterRoutes.ts
import express from 'express';
import { 
  getCharacterById, 
  updateCharacterProfile, 
  updateCharacterStats, 
  getLeaderboard,
  updateCharacterPosition,
  updateCharacterMoney,
  markCharacterCreationComplete,
  searchCharacters
} from '../controllers/characterController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/characters/search
// @desc    Search characters by name
// @access  Public
router.get('/search', searchCharacters);

// @route   GET /api/characters/leaderboard
// @desc    Get all characters for leaderboard
// @access  Public
router.get('/leaderboard', getLeaderboard);

// @route   GET /api/characters/:id
// @desc    Get character by ID
// @access  Private
router.get('/:id', protect, getCharacterById);

// @route   PUT /api/characters/:id
// @desc    Update character profile
// @access  Private
router.put('/:id', protect, updateCharacterProfile);

// @route   PUT /api/characters/:id/stats
// @desc    Update character HP and stamina
// @access  Private
router.put('/:id/stats', protect, updateCharacterStats);

// @route   PUT /api/characters/:id/position
// @desc    Update character position
// @access  Private
router.put('/:id/position', protect, updateCharacterPosition);

// @route   PUT /api/characters/:id/money
// @desc    Update character money
// @access  Private
router.put('/:id/money', protect, updateCharacterMoney);

// @route   PUT /api/characters/:id/creation-complete
// @desc    Mark character creation complete and update character details
// @access  Private
router.put('/:id/creation-complete', protect, markCharacterCreationComplete);

export default router;