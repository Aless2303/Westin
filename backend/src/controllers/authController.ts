import { Request, Response } from 'express';
import User from '../models/userModel';
import Character from '../models/characterModel';
import Inventory from '../models/inventoryModel';
import { generateToken } from '../middleware/authMiddleware';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, characterName, race, gender } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      throw new ApiError('User already exists', 400);
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create character first
      const character = await Character.create(
        [
          {
            name: characterName,
            race,
            gender,
            level: 1,
            hp: { current: 100, max: 100 },
            stamina: { current: 100, max: 100 },
            experience: { current: 0, percentage: 0 },
            money: { cash: 1000, bank: 0 },
            x: 350,
            y: 611,
            attack: race === 'Warrior' ? 12 : race === 'Ninja' ? 10 : race === 'Sura' ? 15 : 8,
            defense: race === 'Warrior' ? 10 : race === 'Ninja' ? 8 : race === 'Sura' ? 5 : 12,
          },
        ],
        { session }
      );

      // Create a new user with the character id
      const user = await User.create(
        [
          {
            username,
            email,
            password,
            characterId: character[0]._id,
            isAdmin: false,
          },
        ],
        { session }
      );

      // Update character with userId
      await Character.findByIdAndUpdate(
        character[0]._id,
        { userId: user[0]._id },
        { session }
      );

      // Create empty inventory for the character
      await Inventory.create(
        [
          {
            characterId: character[0]._id,
            equippedItems: {},
            backpack: [],
            maxSlots: 20,
          },
        ],
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        _id: user[0]._id,
        username: user[0].username,
        email: user[0].email,
        isAdmin: user[0].isAdmin,
        characterId: character[0]._id,
        token: generateToken(user[0]._id.toString()),
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      throw new ApiError('Invalid username or password', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new ApiError('Invalid username or password', 401);
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
      character: {
        _id: character._id,
        name: character.name,
        level: character.level,
        race: character.race,
        gender: character.gender,
      },
      token: generateToken(user._id.toString()),
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