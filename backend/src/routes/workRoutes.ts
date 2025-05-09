// src/routes/workRoutes.ts
import express from 'express';
import { 
  getWorks,
  createWork,
  deleteWork,
  updateWork
} from '../controllers/workController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/works/:characterId
// @desc    Get works for a character
// @access  Private
router.get('/:characterId', protect, getWorks);

// @route   POST /api/works/:characterId
// @desc    Create a new work
// @access  Private
router.post('/:characterId', protect, createWork);

// @route   DELETE /api/works/:characterId/:workId
// @desc    Delete a work
// @access  Private
router.delete('/:characterId/:workId', protect, deleteWork);

// @route   PUT /api/works/:characterId/:workId
// @desc    Update a work
// @access  Private
router.put('/:characterId/:workId', protect, updateWork);

export default router; 