import { Request, Response } from 'express';
import User from '../models/userModel';
import Character from '../models/characterModel';
import Inventory from '../models/inventoryModel';
import { generateToken } from '../middleware/authMiddleware';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// Helper function to generate a unique character name
async function generateUniqueCharacterName(baseName: string): Promise<string> {
  // Check if the base name already exists
  const baseNameExists = await Character.findOne({ name: baseName });
  
  if (!baseNameExists) {
    return baseName; // Base name is available
  }
  
  // Base name exists, try adding numbers
  let counter = 1;
  let candidateName = '';
  
  while (counter < 100) {
    candidateName = `${baseName}${counter}`;
    // Check if this name exists
    const characterExists = await Character.findOne({ name: candidateName });
    
    if (!characterExists) {
      return candidateName;
    }
    
    counter++;
  }
  
  // If we get here, we need a more random approach
  return `${baseName}_${Math.floor(Math.random() * 10000)}`;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, characterName, race, gender } = req.body;

    console.log(`Trying to register user: ${username}`); // Pentru debugging

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    
    // Generate a unique character name
    const uniqueCharacterName = await generateUniqueCharacterName(characterName || username);

    // Create user first
    const user = await User.create({
      username,
      email,
      password,
      isAdmin: false,
      hasCreatedCharacter: false
    });

    // Then create character with userId
    const character = await Character.create({
      name: uniqueCharacterName,
      race: race || 'Warrior',
      gender: gender || 'Masculin',
      level: 1,
      hp: { current: 100, max: 100 },
      stamina: { current: 100, max: 100 },
      experience: { current: 0, percentage: 0 },
      money: { cash: 1000, bank: 0 },
      x: 350,
      y: 611,
      attack: race === 'Warrior' ? 12 : race === 'Ninja' ? 10 : race === 'Sura' ? 15 : 8,
      defense: race === 'Warrior' ? 10 : race === 'Ninja' ? 8 : race === 'Sura' ? 5 : 12,
      userId: user._id,
    });

    // Update user with characterId
    user.characterId = character._id as unknown as mongoose.Types.ObjectId;
    await user.save();

    // Create empty inventory for the character (without items)
    await Inventory.create({
      characterId: character._id,
      equippedItems: {
        weapon: null,
        helmet: null,
        armor: null,
        shield: null,
        earrings: null,
        bracelet: null,
        necklace: null,
        boots: null
      },
      backpack: [],
      maxSlots: 20,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      characterId: character._id,
      hasCreatedCharacter: user.hasCreatedCharacter,
      token: generateToken((user._id as mongoose.Types.ObjectId).toString()),
    });
  } catch (error) {
    console.error('Error in registerUser:', error); // Pentru debugging
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    console.log(`Trying to authenticate user: ${username}`); // Pentru debugging

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log('User not found'); // Pentru debugging
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Check if user is banned
    if (user.isBanned) {
      console.log('User is banned'); // Pentru debugging
      res.status(403).json({ 
        message: 'Acest cont a fost blocat. Pentru detalii, contactați milea84.am@gmail.com',
        isBanned: true 
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Password does not match'); // Pentru debugging
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Get character info
    const character = await Character.findById(user.characterId);

    if (!character) {
      console.log('Character not found'); // Pentru debugging
      res.status(404).json({ message: 'Character not found' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      characterId: user.characterId,
      hasCreatedCharacter: user.hasCreatedCharacter,
      character: {
        _id: character._id,
        name: character.name,
        level: character.level,
        race: character.race,
        gender: character.gender,
      },
      token: generateToken((user._id as mongoose.Types.ObjectId).toString()),
    });
  } catch (error) {
    console.error('Error in authUser:', error); // Pentru debugging
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError('Not authorized', 401);
    }

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Get character info
    const character = await Character.findById(user.characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      characterId: user.characterId,
      hasCreatedCharacter: user.hasCreatedCharacter,
      character: {
        _id: character._id,
        name: character.name,
        level: character.level,
        race: character.race,
        gender: character.gender,
        hp: character.hp,
        stamina: character.stamina,
        experience: character.experience,
        money: character.money,
        x: character.x,
        y: character.y,
        attack: character.attack,
        defense: character.defense,
        duelsWon: character.duelsWon,
        duelsLost: character.duelsLost,
        motto: character.motto,
      }
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