import { Request, Response } from 'express';
import Character from '../models/characterModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';
import User from '../models/userModel';

// @desc    Get character by ID
// @route   GET /api/characters/:id
export const getCharacterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      res.status(404).json({ message: 'Character not found' });
      return;
    }

    res.status(200).json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Update character profile
// @route   PUT /api/characters/:id
// @access  Private
export const updateCharacterProfile = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Verifică dacă ID-ul este valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid character ID' });
      return;
    }
    
    // Găsește caracterul
    const character = await Character.findById(id);
    
    if (!character) {
      res.status(404).json({ message: 'Character not found' });
      return;
    }
    
    // Verifică dacă utilizatorul este autorizat să modifice acest caracter
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401).json({ message: 'Not authorized to update this character' });
      return;
    }
    
    // Verifică câmpurile permise pentru actualizare
    const allowedUpdates = ['motto', 'background'];
    const updates: any = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Actualizează caracterul
    const updatedCharacter = await Character.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    
    res.status(200).json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Server error' });
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
  // Remove session/transaction code
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

    // Initialize character inventory with race-specific starter items
    const Inventory = (await import('../models/inventoryModel')).default;
    const Item = (await import('../models/itemModel')).default;
    
    // Get race-specific level 1 starter items (weapon, armor, helmet)
    const raceSpecificItems = await Item.find({
      raceRestriction: character.race,
      requiredLevel: 1,
      type: { $in: ['weapon', 'armor', 'helmet'] }
    });

    // Get general items for the other slots (no race restriction)
    const generalItems = await Item.find({
      raceRestriction: { $exists: false },
      requiredLevel: 1,
      type: { $in: ['shield', 'earrings', 'bracelet', 'necklace', 'boots'] }
    });

    // If no general items found, try to get any items without race restriction
    const allItems = [...raceSpecificItems];
    
    for (const type of ['shield', 'earrings', 'bracelet', 'necklace', 'boots']) {
      const typeItems = generalItems.filter(item => item.type === type);
      
      if (typeItems.length > 0) {
        // Add the first item of this type
        allItems.push(typeItems[0]);
      } else {
        // Try to find any item of this type without race restriction
        const anyItem = await Item.findOne({
          type,
          requiredLevel: 1,
          $or: [
            { raceRestriction: { $exists: false } },
            { raceRestriction: null }
          ]
        });
        
        if (anyItem) {
          allItems.push(anyItem);
        }
      }
    }

    // Group items by type
    const itemsByType: Record<string, any> = {};
    allItems.forEach(item => {
      itemsByType[item.type] = item._id;
    });

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne({ characterId: character._id });
    
    if (existingInventory) {
      // Update existing inventory with race-specific equipment
      existingInventory.equippedItems = {
        weapon: itemsByType['weapon'] || null,
        armor: itemsByType['armor'] || null,
        helmet: itemsByType['helmet'] || null,
        shield: itemsByType['shield'] || null,
        earrings: itemsByType['earrings'] || null,
        bracelet: itemsByType['bracelet'] || null,
        necklace: itemsByType['necklace'] || null,
        boots: itemsByType['boots'] || null
      };
      
      await existingInventory.save();
    } else {
      // Create new inventory with equipped items
      await Inventory.create({
        characterId: character._id,
        equippedItems: {
          weapon: itemsByType['weapon'] || null,
          armor: itemsByType['armor'] || null,
          helmet: itemsByType['helmet'] || null,
          shield: itemsByType['shield'] || null,
          earrings: itemsByType['earrings'] || null,
          bracelet: itemsByType['bracelet'] || null,
          necklace: itemsByType['necklace'] || null,
          boots: itemsByType['boots'] || null
        },
        backpack: [], // Empty backpack
        maxSlots: 20
      });
    }

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

// @desc    Search characters by name
// @route   GET /api/characters/search
// @access  Public
export const searchCharacters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Find characters whose name contains the query string (case-insensitive)
    const characters = await Character.find({
      name: { $regex: query, $options: 'i' }
    })
    .select('_id name level race gender userId')
    .limit(10)
    .lean();

    // Map the result to a simpler format for the frontend
    const formattedResults = characters.map(character => ({
      id: character.userId.toString(), // We use userId as the player id for chat
      characterId: character._id.toString(),
      name: character.name,
      level: character.level,
      race: character.race,
      gender: character.gender,
      image: `/Races/${character.gender}/${character.race}.png`
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error searching characters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
