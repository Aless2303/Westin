import { Request, Response } from 'express';
import Mob from '../models/mobModel';
import { ApiError } from '../middleware/errorMiddleware';

// @desc    Get all mobs
// @route   GET /api/mobs
// @access  Public
export const getMobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const mobs = await Mob.find({});
    res.status(200).json(mobs);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get mob by ID
// @route   GET /api/mobs/:id
// @access  Public
export const getMobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const mob = await Mob.findById(req.params.id);

    if (!mob) {
      throw new ApiError('Mob not found', 404);
    }

    res.status(200).json(mob);
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

// @desc    Get mobs by type
// @route   GET /api/mobs/type/:type
// @access  Public
export const getMobsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;

    if (!['boss', 'metin', 'Oras'].includes(type)) {
      throw new ApiError('Invalid mob type', 400);
    }

    const mobs = await Mob.find({ type });
    res.status(200).json(mobs);
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

// @desc    Get mobs by level range
// @route   GET /api/mobs/level
// @access  Public
export const getMobsByLevelRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { min, max } = req.query;
    
    const minLevel = min ? parseInt(min as string) : 1;
    const maxLevel = max ? parseInt(max as string) : 999;

    if (isNaN(minLevel) || isNaN(maxLevel) || minLevel < 1 || maxLevel < minLevel) {
      throw new ApiError('Invalid level range', 400);
    }

    const mobs = await Mob.find({
      level: { $gte: minLevel, $lte: maxLevel }
    }).sort({ level: 1 });

    res.status(200).json(mobs);
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

// @desc    Create a new mob (Admin only)
// @route   POST /api/mobs
// @access  Private/Admin
export const createMob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, x, y, type, level, hp, attack, exp, yang, image } = req.body;

    // Validate required fields
    if (!name || x === undefined || y === undefined || !type || !image) {
      throw new ApiError('Please provide all required fields', 400);
    }

    // Create new mob
    const mob = await Mob.create({
      name,
      x,
      y,
      type,
      level: level || 1,
      hp: hp || 100,
      attack: attack || 10,
      exp: exp || 10,
      yang: yang || 10,
      image
    });

    res.status(201).json(mob);
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

// @desc    Update a mob (Admin only)
// @route   PUT /api/mobs/:id
// @access  Private/Admin
export const updateMob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, x, y, type, level, hp, attack, exp, yang, image } = req.body;
    
    // Find mob by ID
    const mob = await Mob.findById(req.params.id);
    
    if (!mob) {
      throw new ApiError('Mob not found', 404);
    }
    
    // Update mob fields
    if (name) mob.name = name;
    if (x !== undefined) mob.x = x;
    if (y !== undefined) mob.y = y;
    if (type && ['boss', 'metin', 'Oras'].includes(type)) mob.type = type;
    if (level !== undefined) mob.level = level;
    if (hp !== undefined) mob.hp = hp;
    if (attack !== undefined) mob.attack = attack;
    if (exp !== undefined) mob.exp = exp;
    if (yang !== undefined) mob.yang = yang;
    if (image) mob.image = image;
    
    // Save updated mob
    const updatedMob = await mob.save();
    
    res.status(200).json(updatedMob);
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

// @desc    Delete a mob (Admin only)
// @route   DELETE /api/mobs/:id
// @access  Private/Admin
export const deleteMob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find mob by ID
    const mob = await Mob.findById(req.params.id);
    
    if (!mob) {
      throw new ApiError('Mob not found', 404);
    }
    
    // Delete mob
    await mob.deleteOne();
    
    res.status(200).json({ message: 'Mob removed' });
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

// @desc    Get nearby mobs based on character position
// @route   GET /api/mobs/nearby
// @access  Public
export const getNearbyMobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { x, y, radius } = req.query;
    
    const posX = x ? parseInt(x as string) : 0;
    const posY = y ? parseInt(y as string) : 0;
    const searchRadius = radius ? parseInt(radius as string) : 500;

    if (isNaN(posX) || isNaN(posY) || isNaN(searchRadius) || searchRadius <= 0) {
      throw new ApiError('Invalid search parameters', 400);
    }

    // Find mobs within the radius
    const mobs = await Mob.find({
      x: { $gte: posX - searchRadius, $lte: posX + searchRadius },
      y: { $gte: posY - searchRadius, $lte: posY + searchRadius }
    });

    // Calculate distance for each mob and filter
    const nearbyMobs = mobs
      .map(mob => {
        const distance = Math.sqrt(Math.pow(mob.x - posX, 2) + Math.pow(mob.y - posY, 2));
        return { ...mob.toObject(), distance };
      })
      .filter(mob => mob.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json(nearbyMobs);
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