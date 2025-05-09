import express from 'express';
import { getAllPlayers, getPlayerById, updatePlayer, deletePlayer } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/admin/players
// @desc    Get all players (characters)
// @access  Admin
router.get('/players', protect, admin, getAllPlayers);

// @route   GET /api/admin/players/:id
// @desc    Get player by ID
// @access  Admin
router.get('/players/:id', protect, admin, getPlayerById);

// @route   PUT /api/admin/players/:id
// @desc    Update player
// @access  Admin
router.put('/players/:id', protect, admin, updatePlayer);

// @route   DELETE /api/admin/players/:id
// @desc    Delete player
// @access  Admin
router.delete('/players/:id', protect, admin, deletePlayer);

export default router; 