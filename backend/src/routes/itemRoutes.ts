// src/routes/itemRoutes.ts
import express from 'express';
import { 
  getItems, 
  getItemById, 
  createItem, 
  updateItem,
  deleteItem,
  getItemsByCategory,
  getItemsByType,
  getMarketItems
} from '../controllers/itemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', getItems);

// @route   GET /api/items/market
// @desc    Get market items
// @access  Public
router.get('/market', getMarketItems);

// @route   GET /api/items/category/:category
// @desc    Get items by category
// @access  Public
router.get('/category/:category', getItemsByCategory);

// @route   GET /api/items/type/:type
// @desc    Get items by type
// @access  Public
router.get('/type/:type', getItemsByType);

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', getItemById);

// @route   POST /api/items
// @desc    Create a new item
// @access  Private/Admin
router.post('/', protect, admin, createItem);

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private/Admin
router.put('/:id', protect, admin, updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteItem);

export default router;