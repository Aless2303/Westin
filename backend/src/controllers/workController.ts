import { Request, Response } from 'express';
import Work from '../models/workModel';
import Character from '../models/characterModel';
import Report from '../models/reportModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// @desc    Get works for a character
// @route   GET /api/works/:characterId
// @access  Private
export const getWorks = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to view this character's works
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to view these works', 401);
    }

    // Get works
    const works = await Work.find({ characterId }).sort({ createdAt: 1 }).limit(3);

    // Update works based on current time
    const now = new Date();
    const updatedWorks = [];
    const completedWorks = [];

    // Procesăm muncile în ordine, dar actualizăm doar prima muncă activă
    let hasActiveJob = false;

    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      
      // Dacă nu avem o muncă activă, această muncă devine activă
      if (!hasActiveJob) {
        hasActiveJob = true;
        
        // Calculate remaining times based on current time
        if (!work.isInProgress) {
          // Still in travel phase
          if (now >= work.travelEndTime) {
            // Travel completed, move to job phase
            work.isInProgress = true;
            work.travelTime = 0;
            
            // If job end time is also in the past, mark for completion
            if (now >= work.jobEndTime) {
              completedWorks.push(work);
            } else {
              // Calculate remaining job time
              const remainingMs = work.jobEndTime.getTime() - now.getTime();
              work.remainingTime = Math.ceil(remainingMs / 1000);
              await work.save();
              updatedWorks.push(work);
            }
          } else {
            // Still traveling
            const remainingMs = work.travelEndTime.getTime() - now.getTime();
            work.travelTime = Math.ceil(remainingMs / 1000);
            await work.save();
            updatedWorks.push(work);
          }
        } else {
          // Already in job phase
          if (now >= work.jobEndTime) {
            // Job completed
            completedWorks.push(work);
          } else {
            // Still working
            const remainingMs = work.jobEndTime.getTime() - now.getTime();
            work.remainingTime = Math.ceil(remainingMs / 1000);
            await work.save();
            updatedWorks.push(work);
          }
        }
      } else {
        // Muncile care nu sunt active rămân neschimbate
        updatedWorks.push(work);
      }
    }

    // Process completed works
    for (const work of completedWorks) {
      // Create a report for the completed work
      await createWorkCompletionReport(work, character);
      
      // Remove the completed work
      await Work.findByIdAndDelete(work._id);
    }

    // Get updated list of works after processing
    const finalWorks = await Work.find({ characterId }).sort({ createdAt: 1 }).limit(3);

    res.status(200).json(finalWorks);
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

// Helper function to create a report for completed work
const createWorkCompletionReport = async (work: any, character: any) => {
  // Calculate rewards based on work type
  let expPercentage = 0;
  let yangPercentage = 0;
  
  switch(work.type) {
    case '15s':
      expPercentage = 10;
      yangPercentage = 10;
      break;
    case '10m':
      expPercentage = 40;
      yangPercentage = 40;
      break;
    case '1h':
      expPercentage = 100;
      yangPercentage = 100;
      break;
  }
  
  const expGained = Math.round((work.mobExp * expPercentage) / 100);
  const yangGained = Math.round((work.mobYang * yangPercentage) / 100);
  
  // Simulate combat results
  const playerHpLost = Math.round(Math.random() * 20 + 10); // Random HP loss between 10-30
  const damageDealt = work.mobHp;
  const remainingMobHp = 0;
  const totalRounds = Math.floor(Math.random() * 10) + 5; // Random rounds between 5-15
  
  // Create report content
  const content = `Ai finalizat o misiune de ${work.type} împotriva ${work.mobName}. Ai câștigat ${expGained} experiență și ${yangGained} yang.`;
  
  // Create report
  await Report.create({
    characterId: work.characterId,
    type: 'attack',
    subject: `Misiune completată: ${work.mobName}`,
    content,
    read: false,
    mobName: work.mobName,
    mobType: work.mobType,
    result: 'victory',
    combatStats: {
      playerHpLost,
      damageDealt,
      expGained,
      yangGained,
      totalRounds,
      remainingMobHp
    }
  });
  
  // Update character stats
  const newHp = Math.max(0, character.hp.current - playerHpLost);
  const newExp = character.experience.current + expGained;
  const newYang = character.money.cash + yangGained;
  
  await Character.findByIdAndUpdate(character._id, {
    'hp.current': newHp,
    'experience.current': newExp,
    'money.cash': newYang
  });
};

// @desc    Create a new work
// @route   POST /api/works/:characterId
// @access  Private
export const createWork = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const {
      type,
      remainingTime,
      travelTime,
      isInProgress,
      mobName,
      mobImage,
      mobX,
      mobY,
      mobType,
      mobLevel,
      mobHp,
      mobAttack,
      mobExp,
      mobYang,
      staminaCost,
      originalTravelTime,
      originalJobTime
    } = req.body;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to create works for this character
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to create works for this character', 401);
    }

    // Check if character has enough stamina
    if (character.stamina.current < staminaCost) {
      throw new ApiError('Not enough stamina', 400);
    }

    // Check if character already has 3 works - ensure we're getting the actual count
    const workCount = await Work.countDocuments({ characterId });
    if (workCount >= 3) {
      throw new ApiError('Maximum number of works reached (3)', 400);
    }

    // Calculate end times
    const now = new Date();
    
    // Verificăm dacă există alte munci
    const existingWorks = await Work.find({ characterId }).sort({ createdAt: 1 });
    
    let travelEndTime, jobEndTime;
    
    if (existingWorks.length === 0) {
      // Dacă nu există alte munci, folosim timpul curent ca punct de plecare
      travelEndTime = new Date(now.getTime() + travelTime * 1000);
      jobEndTime = new Date(travelEndTime.getTime() + remainingTime * 1000);
    } else {
      // Dacă există alte munci, adăugăm această muncă la sfârșitul cozii
      const lastWork = existingWorks[existingWorks.length - 1];
      const lastWorkEndTime = lastWork.jobEndTime;
      
      // Adăugăm timpul de deplasare după terminarea ultimei munci
      travelEndTime = new Date(lastWorkEndTime.getTime() + travelTime * 1000);
      jobEndTime = new Date(travelEndTime.getTime() + remainingTime * 1000);
    }

    // Create work
    const work = await Work.create({
      characterId,
      type,
      remainingTime,
      travelTime,
      isInProgress,
      mobName,
      mobImage,
      mobX,
      mobY,
      mobType,
      mobLevel,
      mobHp,
      mobAttack,
      mobExp,
      mobYang,
      staminaCost,
      originalTravelTime,
      originalJobTime,
      startTime: now,
      travelEndTime,
      jobEndTime
    });

    // Reduce character's stamina
    character.stamina.current -= staminaCost;
    await character.save();

    res.status(201).json(work);
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

// @desc    Delete a work
// @route   DELETE /api/works/:characterId/:workId
// @access  Private
export const deleteWork = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId, workId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(workId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to delete this character's work
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to delete this work', 401);
    }

    // Get work
    const work = await Work.findOne({ _id: workId, characterId });

    if (!work) {
      throw new ApiError('Work not found', 404);
    }

    // Get the stamina cost before deleting the work
    const staminaCost = work.staminaCost || 0;

    // Delete work
    await Work.findByIdAndDelete(workId);
    
    // Refund the stamina cost to the character
    if (staminaCost > 0) {
      character.stamina.current = Math.min(
        character.stamina.max, 
        character.stamina.current + staminaCost
      );
      await character.save();
    }
    
    // Recalculează timpii pentru muncile rămase
    const remainingWorks = await Work.find({ characterId }).sort({ createdAt: 1 });
    
    if (remainingWorks.length > 0) {
      // Dacă munca ștearsă era prima, actualizăm timpii pentru prima muncă rămasă
      const firstWork = remainingWorks[0];
      const now = new Date();
      
      // Actualizăm timpul de deplasare
      firstWork.travelEndTime = new Date(now.getTime() + firstWork.travelTime * 1000);
      firstWork.jobEndTime = new Date(firstWork.travelEndTime.getTime() + firstWork.remainingTime * 1000);
      
      await firstWork.save();
      
      // Actualizăm timpii pentru restul muncilor
      for (let i = 1; i < remainingWorks.length; i++) {
        const previousWork = remainingWorks[i - 1];
        const currentWork = remainingWorks[i];
        
        currentWork.travelEndTime = new Date(previousWork.jobEndTime.getTime() + currentWork.travelTime * 1000);
        currentWork.jobEndTime = new Date(currentWork.travelEndTime.getTime() + currentWork.remainingTime * 1000);
        
        await currentWork.save();
      }
    }

    res.status(200).json({ 
      message: 'Work deleted successfully',
      staminaRefunded: staminaCost,
      currentStamina: character.stamina.current
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