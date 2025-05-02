import { Request, Response } from 'express';
import Character from '../models/characterModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';
import User from '../models/userModel';

// @desc    Get character by ID
// @route   GET /api/characters/:id
// @access  Private
export const getCharacterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    res.status(200).json(character);
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

// @desc    Update character profile (motto, stats, etc.)
// @route   PUT /api/characters/:id
// @access  Private
export const updateCharacterProfile = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is the owner of this character
    if (req.user && req.user._id.toString() !== character.userId.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to update this character', 401);
    }

    // Allow updating only specific fields
    const allowedFields = ['motto', 'x', 'y'];
    const updateData: any = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedCharacter);
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

// @desc    Update character HP and stamina
// @route   PUT /api/characters/:id/stats
// @access  Private
export const updateCharacterStats = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is the owner of this character
    if (req.user && req.user._id.toString() !== character.userId.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to update this character', 401);
    }

    const { hp, stamina } = req.body;

    const updateData: any = {};

    if (hp !== undefined) {
      updateData['hp.current'] = Math.max(0, Math.min(hp, character.hp.max));
    }

    if (stamina !== undefined) {
      updateData['stamina.current'] = Math.max(0, Math.min(stamina, character.stamina.max));
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedCharacter);
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

// @desc    Get all characters for leaderboard
// @route   GET /api/characters/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const characters = await Character.find()
      .select('name level race gender experience duelsWon duelsLost attack defense motto')
      .sort({ level: -1, 'experience.current': -1 });

    res.status(200).json(characters);
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

// @desc    Update character position
// @route   PUT /api/characters/:id/position
// @access  Private
export const updateCharacterPosition = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is the owner of this character
    if (req.user && req.user._id.toString() !== character.userId.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to update this character', 401);
    }

    const { x, y } = req.body;

    if (x === undefined || y === undefined) {
      throw new ApiError('Position coordinates are required', 400);
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: { x, y } },
      { new: true }
    );

    res.status(200).json(updatedCharacter);
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


// @desc    Update character money
// @route   PUT /api/characters/:id/money
// @access  Private
export const updateCharacterMoney = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is the owner of this character
    if (req.user && req.user._id.toString() !== character.userId.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to update this character', 401);
    }

    const { cash, bank } = req.body;
    const updateData: any = {};

    if (cash !== undefined) {
      updateData['money.cash'] = Math.max(0, cash);
    }

    if (bank !== undefined) {
      updateData['money.bank'] = Math.max(0, bank);
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedCharacter);
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



// @desc    Mark character creation complete
// @route   PUT /api/characters/:id/creation-complete
// @access  Private
export const markCharacterCreationComplete = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid character ID' });
      return;
    }

    // Get character
    const character = await Character.findById(id);

    if (!character) {
      res.status(404).json({ message: 'Character not found' });
      return;
    }

    // Check if user is authorized
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Get user and update hasCreatedCharacter
    const user = await User.findById(character.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.hasCreatedCharacter = true;
    await user.save();

    // Update character with the provided details
    const { race, gender, background, name } = req.body;

    if (race) character.race = race;
    if (gender) character.gender = gender;
    if (background) character.background = background;
    if (name) character.name = name;

    await character.save();

    res.status(200).json({
      _id: character._id,
      name: character.name,
      race: character.race,
      gender: character.gender,
      background: character.background,
      level: character.level,
      hasCreatedCharacter: user.hasCreatedCharacter
    });
  } catch (error) {
    console.error('Error in markCharacterCreationComplete:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
