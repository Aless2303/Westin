import { Request, Response } from 'express';
import Character from '../models/characterModel';
import User from '../models/userModel';
import Inventory from '../models/inventoryModel';
import { StatusCodes } from 'http-status-codes';

/**
 * @desc    Obține toți jucătorii (personajele)
 * @route   GET /api/admin/players
 * @access  Admin
 */
export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const characters = await Character.find().sort({ createdAt: -1 });
    
    // Adaugă informații despre ban din colecția User
    const extendedCharacters = await Promise.all(
      characters.map(async (character) => {
        const user = await User.findById(character.userId).select('isBanned');
        return {
          ...character.toObject(),
          isBanned: user?.isBanned || false
        };
      })
    );
    
    res.status(StatusCodes.OK).json(extendedCharacters);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'A apărut o eroare la obținerea jucătorilor.'
    });
  }
};

/**
 * @desc    Obține un jucător specific după ID
 * @route   GET /api/admin/players/:id
 * @access  Admin
 */
export const getPlayerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const character = await Character.findById(id);
    
    if (!character) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Jucătorul nu a fost găsit.'
      });
      return;
    }
    
    // Adaugă informații despre ban din colecția User
    const user = await User.findById(character.userId).select('isBanned');
    const characterWithBanStatus = {
      ...character.toObject(),
      isBanned: user?.isBanned || false
    };
    
    res.status(StatusCodes.OK).json(characterWithBanStatus);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'A apărut o eroare la obținerea jucătorului.'
    });
  }
};

/**
 * @desc    Banează/Debanează un utilizator
 * @route   PUT /api/admin/players/:id/ban
 * @access  Admin
 */
export const toggleBanStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    
    // Verifică dacă jucătorul există
    const character = await Character.findById(id);
    
    if (!character) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Jucătorul nu a fost găsit.'
      });
      return;
    }
    
    // Actualizează statusul de ban al utilizatorului
    const user = await User.findByIdAndUpdate(
      character.userId,
      { isBanned: isBanned },
      { new: true }
    ).select('isBanned');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Utilizatorul nu a fost găsit.'
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      message: isBanned ? 'Utilizatorul a fost banat cu succes.' : 'Utilizatorul a fost debanat cu succes.',
      isBanned: user.isBanned
    });
  } catch (error) {
    console.error('Error updating ban status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'A apărut o eroare la actualizarea statusului de ban.'
    });
  }
};

/**
 * @desc    Actualizează un jucător
 * @route   PUT /api/admin/players/:id
 * @access  Admin
 */
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Verifică dacă jucătorul există
    const character = await Character.findById(id);
    
    if (!character) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Jucătorul nu a fost găsit.'
      });
      return;
    }
    
    // Verifică dacă se actualizează experiența și recalculează procentajul
    if (updateData.experience) {
      const current = updateData.experience.current !== undefined 
        ? updateData.experience.current 
        : character.experience.current;
      
      const required = updateData.experience.required !== undefined 
        ? updateData.experience.required 
        : character.experience.required;
      
      // Calculează procentajul
      if (required > 0) {
        const percentage = Math.min(Math.floor((current / required) * 100), 100);
        updateData.experience.percentage = percentage;
      }
    }
    
    // Actualizează jucătorul
    const updatedCharacter = await Character.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(StatusCodes.OK).json(updatedCharacter);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'A apărut o eroare la actualizarea jucătorului.'
    });
  }
};

/**
 * @desc    Șterge un jucător
 * @route   DELETE /api/admin/players/:id
 * @access  Admin
 */
export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Verifică dacă jucătorul există
    const character = await Character.findById(id);
    
    if (!character) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Jucătorul nu a fost găsit.'
      });
      return;
    }
    
    // Obține ID-ul utilizatorului asociat
    const userId = character.userId;
    
    // Șterge personajul
    await Character.findByIdAndDelete(id);
    
    // Șterge inventarul asociat
    await Inventory.findOneAndDelete({ characterId: id });
    
    // Actualizează utilizatorul pentru a indica că nu mai are un personaj
    await User.findByIdAndUpdate(userId, {
      hasCreatedCharacter: false,
      $unset: { characterId: "" }
    });
    
    res.status(StatusCodes.OK).json({
      message: 'Jucătorul a fost șters cu succes.'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'A apărut o eroare la ștergerea jucătorului.'
    });
  }
};

export default {
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  toggleBanStatus
}; 