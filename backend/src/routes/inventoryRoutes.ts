// src/routes/inventoryRoutes.ts
import express from 'express';
import { 
  getInventory, 
  equipItem, 
  unequipItem, 
  addItemToInventory 
} from '../controllers/inventoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/inventory/:characterId
// @desc    Get character inventory
// @access  Private
router.get('/:characterId', protect, getInventory);

// @route   PUT /api/inventory/:characterId/equip
// @desc    Equip item
// @access  Private
router.put('/:characterId/equip', protect, equipItem);

// @route   PUT /api/inventory/:characterId/unequip
// @desc    Unequip item
// @access  Private
router.put('/:characterId/unequip', protect, unequipItem);

// @route   POST /api/inventory/:characterId/items
// @desc    Add item to inventory
// @access  Private
router.post('/:characterId/items', protect, addItemToInventory);

export default router;