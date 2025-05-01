import { Request, Response } from 'express';
import Item from '../models/ItemModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get query parameters for filtering
    const { type, category, minLevel, maxLevel } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minLevel || maxLevel) {
      filter.requiredLevel = {};
      
      if (minLevel) {
        filter.requiredLevel.$gte = parseInt(minLevel as string);
      }
      
      if (maxLevel) {
        filter.requiredLevel.$lte = parseInt(maxLevel as string);
      }
    }
    
    // Get items based on filter
    const items = await Item.find(filter).sort({ requiredLevel: 1, name: 1 });
    
    res.status(200).json(items);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      throw new ApiError('Item not found', 404);
    }
    
    res.status(200).json(item);
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

// @desc    Create new item (Admin only)
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      type,
      category,
      subcategory,
      imagePath,
      stackable = false,
      quantity = 1,
      requiredLevel = 1,
      price = 0,
      stats = {},
      description
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !category || !imagePath || !description) {
      throw new ApiError('Please provide all required fields', 400);
    }
    
    // Create new item
    const item = await Item.create({
      name,
      type,
      category,
      subcategory,
      imagePath,
      stackable,
      quantity,
      requiredLevel,
      price,
      stats,
      description
    });
    
    res.status(201).json(item);
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

// @desc    Update item (Admin only)
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      type,
      category,
      subcategory,
      imagePath,
      stackable,
      requiredLevel,
      price,
      stats,
      description
    } = req.body;
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      throw new ApiError('Item not found', 404);
    }
    
    // Update fields
    if (name !== undefined) item.name = name;
    if (type !== undefined) item.type = type;
    if (category !== undefined) item.category = category;
    if (subcategory !== undefined) item.subcategory = subcategory;
    if (imagePath !== undefined) item.imagePath = imagePath;
    if (stackable !== undefined) item.stackable = stackable;
    if (requiredLevel !== undefined) item.requiredLevel = requiredLevel;
    if (price !== undefined) item.price = price;
    if (stats !== undefined) item.stats = stats;
    if (description !== undefined) item.description = description;
    
    const updatedItem = await item.save();
    
    res.status(200).json(updatedItem);
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

// @desc    Delete item (Admin only)
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      throw new ApiError('Item not found', 404);
    }
    
    await item.deleteOne();
    
    res.status(200).json({ message: 'Item deleted successfully' });
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

// @desc    Get items by category and subcategory
// @route   GET /api/items/category/:category
// @access  Public
export const getItemsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { subcategory } = req.query;
    
    const filter: any = { category };
    
    if (subcategory) {
      filter.subcategory = subcategory;
    }
    
    const items = await Item.find(filter).sort({ requiredLevel: 1, name: 1 });
    
    res.status(200).json(items);
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

// @desc    Get items by type (weapon, armor, etc.)
// @route   GET /api/items/type/:type
// @access  Public
export const getItemsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    
    // Validate type
    const validTypes = ['weapon', 'armor', 'helmet', 'shield', 'earrings', 'bracelet', 'necklace', 'boots', 'consumable', 'quest', 'material'];
    if (!validTypes.includes(type)) {
      throw new ApiError('Invalid item type', 400);
    }
    
    const items = await Item.find({ type }).sort({ requiredLevel: 1, name: 1 });
    
    res.status(200).json(items);
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

// @desc    Get market items (grouped by category)
// @route   GET /api/items/market
// @access  Public
export const getMarketItems = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all items with a price greater than 0
    const items = await Item.find({ price: { $gt: 0 } }).sort({ category: 1, subcategory: 1, requiredLevel: 1 });
    
    // Group items by category and subcategory
    const groupedItems: Record<string, any[]> = {};
    
    items.forEach(item => {
      const key = item.subcategory 
        ? `${item.category}-${item.subcategory}` 
        : item.category;
        
      if (!groupedItems[key]) {
        groupedItems[key] = [];
      }
      
      groupedItems[key].push(item);
    });
    
    // Get all categories
    const categories = [...new Set(items.map(item => item.category))];
    
    res.status(200).json({
      items: groupedItems,
      categories
    });
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