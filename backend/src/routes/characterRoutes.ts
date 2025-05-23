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
  searchCharacters,
  getPlayerData,
  getNearbyPlayers,
  updateCharacterHp,
  getCharacterRequiredExp
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

// @route   GET /api/characters/nearby
// @desc    Get nearby players for duels
// @access  Private
router.get('/nearby', protect, getNearbyPlayers);

// @route   GET /api/characters/player/:userId
// @desc    Get player data by user ID for chat
// @access  Private
router.get('/player/:userId', protect, getPlayerData);

// @route   GET /api/characters/:id
// @desc    Get character by ID
// @access  Private
router.get('/:id', protect, getCharacterById);

// @route   GET /api/characters/:id/required-exp
// @desc    Get required experience for character level up
// @access  Private
router.get('/:id/required-exp', protect, getCharacterRequiredExp);

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

// @route   PUT /api/characters/:id/hp
// @desc    Update character HP
// @access  Private
router.put('/:id/hp', protect, updateCharacterHp);

export default router;