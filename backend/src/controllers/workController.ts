import { Request, Response } from 'express';
import Work from '../models/workModel';
import Character from '../models/characterModel';
import Report from '../models/reportModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';
import { updateCharacterExperience } from '../services/characterService';

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
            
            // Update character position to the mob's position when travel completes
            await Character.findByIdAndUpdate(characterId, {
              x: work.mobX,
              y: work.mobY
            });
            
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
  // Special handling for sleep jobs (restoring HP and stamina)
  if (work.mobType === 'sleep') {
    // Create a sleep report
    await Report.create({
      characterId: work.characterId,
      type: 'sleep',
      subject: `Te-ai odihnit în Han`,
      content: `Te-ai odihnit în Hanul din Westin și ți s-au regenerat complet HP-ul și stamina.\n\n` +
               `HP anterior: ${character.hp.current}/${character.hp.max}\n` +
               `Stamina anterioară: ${character.stamina.current}/${character.stamina.max}\n\n` +
               `Acum te simți complet refăcut și gata de aventură!`,
      read: false,
      mobName: 'Patul din Han',
      mobType: 'sleep',
      result: 'victory',
      combatStats: {
        playerHpLost: 0,
        damageDealt: 0,
        expGained: 0,
        yangGained: 0,
        totalRounds: 0,
        remainingMobHp: 0
      }
    });
    
    // Fully restore HP and stamina
    await Character.findByIdAndUpdate(character._id, {
      'hp.current': character.hp.max,
      'stamina.current': character.stamina.max
    });
    
    return; // Exit early - we don't need to do the combat simulation for sleep
  }
  
  // Regular work processing continues below
  
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
  
  // Generate detailed combat logs
  const combatLogs: string[] = [];
  const playerAttack = character.attack || 100;
  const playerDefense = character.defense || 50;
  const playerHp = character.hp.current;
  const mobAttack = work.mobAttack || 80;
  const mobHp = work.mobHp;
  const mobName = work.mobName;
  
  let currentPlayerHp = playerHp;
  let currentMobHp = mobHp;
  
  // Calculate total rounds based on work type
  let totalRounds = 5; // Default for short jobs
  switch(work.type) {
    case '15s':
      totalRounds = Math.floor(Math.random() * 3) + 3; // 3-5 rounds
      break;
    case '10m':
      totalRounds = Math.floor(Math.random() * 5) + 6; // 6-10 rounds
      break;
    case '1h':
      totalRounds = Math.floor(Math.random() * 10) + 11; // 11-20 rounds
      break;
  }
  
  // Start combat log
  combatLogs.push(`[Lupta începe] Tu vs ${mobName}`);
  
  // Simulate combat rounds
  for (let round = 1; round <= totalRounds; round++) {
    if (currentPlayerHp <= 0 || currentMobHp <= 0) break;
    
    combatLogs.push(`-------- Runda ${round} --------`);
    
    // Player attacks first
    const isCritical = Math.random() < 0.2; // 20% chance for critical hit
    let damageToMob = Math.round(playerAttack * (Math.random() * 0.4 + 0.8)); // 80-120% of attack
    
    if (isCritical) {
      damageToMob = Math.round(damageToMob * 1.5);
      combatLogs.push(`[CRITIC] Tu ataci ${mobName} pentru ${damageToMob} damage!`);
    } else {
      combatLogs.push(`Tu ataci ${mobName} pentru ${damageToMob} damage.`);
    }
    
    currentMobHp = Math.max(0, currentMobHp - damageToMob);
    combatLogs.push(`→ HP-ul lui ${mobName}: ${currentMobHp}/${mobHp}`);
    
    if (currentMobHp <= 0) {
      combatLogs.push(`Victorie! Ai învins pe ${mobName}!`);
      break;
    }
    
    // Mob attacks
    const isMobCritical = Math.random() < 0.15; // 15% chance for mob critical hit
    let damageToPlayer = Math.round(mobAttack * (Math.random() * 0.3 + 0.7)); // 70-100% of mob attack
    
    if (isMobCritical) {
      damageToPlayer = Math.round(damageToPlayer * 1.5);
      combatLogs.push(`[CRITIC] ${mobName} te atacă pentru ${damageToPlayer} damage!`);
    } else {
      combatLogs.push(`${mobName} te atacă pentru ${damageToPlayer} damage.`);
    }
    
    currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
    combatLogs.push(`→ HP-ul tău: ${currentPlayerHp}/${playerHp}`);
    
    if (currentPlayerHp <= 0) {
      combatLogs.push(`Înfrângere! Ai fost învins de ${mobName}!`);
      break;
    }
    
    // Add round summary
    combatLogs.push(`Status la finalul rundei ${round}: Tu (${currentPlayerHp}/${playerHp}) - ${mobName} (${currentMobHp}/${mobHp})`);
  }
  
  // Determinăm rezultatul luptei
  let result = 'impartial';
  if (currentMobHp <= 0) {
    result = 'victory';
  } else if (currentPlayerHp <= 0) {
    result = 'defeat';
  }
  
  // Calculăm statisticile finale
  const playerHpLost = playerHp - currentPlayerHp;
  const damageDealt = mobHp - currentMobHp;
  const remainingMobHp = currentMobHp;
  
  // Acordăm recompense doar în caz de victorie
  let actualExpGained = 0;
  let actualYangGained = 0;
  
  if (result === 'victory') {
    actualExpGained = expGained;
    actualYangGained = yangGained;
  }
  
  // Create detailed report content
  let contentPrefix = '';
  switch (result) {
    case 'victory':
      contentPrefix = `Ai finalizat cu succes o misiune de ${work.type} împotriva ${mobName}. Ai câștigat ${actualExpGained} experiență și ${actualYangGained} yang.`;
      break;
    case 'defeat':
      contentPrefix = `Ai fost învins într-o misiune de ${work.type} împotriva ${mobName}. Nu ai primit nicio recompensă.`;
      break;
    case 'impartial':
      contentPrefix = `O misiune de ${work.type} împotriva ${mobName} s-a terminat fără un câștigător clar. Nu ai primit nicio recompensă.`;
      break;
  }
  
  const content = `${contentPrefix}\n\n` +
    `Statistici duel:\n` +
    `- Ai provocat ${damageDealt.toLocaleString()} damage\n` +
    `- Ai pierdut ${playerHpLost.toLocaleString()} HP\n` +
    `- Runde: ${totalRounds}\n\n` +
    `Desfășurarea luptei:\n${combatLogs.join('\n')}\n\n` +
    `Recompense: +${actualExpGained} XP, +${actualYangGained} Yang`;
  
  // Create report
  await Report.create({
    characterId: work.characterId,
    type: 'attack',
    subject: `Misiune ${result === 'victory' ? 'completată' : result === 'defeat' ? 'eșuată' : 'nefinalizată'}: ${mobName}`,
    content,
    read: false,
    mobName: mobName,
    mobType: work.mobType,
    result: result,
    combatStats: {
      playerHpLost,
      damageDealt,
      expGained: actualExpGained,
      yangGained: actualYangGained,
      totalRounds,
      remainingMobHp
    }
  });
  
  // Update character stats - acordăm experiență și bani doar în caz de victorie
  const newHp = Math.max(0, character.hp.current - playerHpLost);
  const newYang = character.money.cash + actualYangGained;
  
  await Character.findByIdAndUpdate(character._id, {
    'hp.current': newHp,
    'money.cash': newYang
  });
  
  // Update experience with level-up check
  if (actualExpGained > 0) {
    await updateCharacterExperience(character._id.toString(), actualExpGained);
  }
  
  // Dacă jucătorul a murit (HP = 0), anulăm toate muncile rămase și resetăm banii cash la 0
  if (newHp <= 0) {
    // Găsim toate muncile rămase și le anulăm
    const remainingWorks = await Work.find({ characterId: character._id });
    
    // Ștergem toate muncile
    if (remainingWorks.length > 0) {
      // Rambursăm stamina pentru fiecare muncă anulată
      let totalStaminaRefund = 0;
      remainingWorks.forEach(work => {
        totalStaminaRefund += work.staminaCost || 0;
      });
      
      // Ștergem toate muncile
      await Work.deleteMany({ characterId: character._id });
      
      // Rambursăm stamina (dar nu depășim maximul)
      if (totalStaminaRefund > 0) {
        const currentStamina = Math.max(0, character.stamina.current);
        const newStamina = Math.min(character.stamina.max, currentStamina + totalStaminaRefund);
        
        await Character.findByIdAndUpdate(character._id, {
          'stamina.current': newStamina
        });
      }
      
      // Creăm un raport pentru anularea muncilor
      await Report.create({
        characterId: character._id,
        type: 'attack',
        subject: `Munci anulate din cauza HP-ului 0`,
        content: `Toate muncile tale au fost anulate automat deoarece ai rămas fără HP în urma luptei cu ${mobName}. Trebuie să te odihnești înainte de a putea începe alte munci.`,
        read: false,
        result: 'defeat',
      });
    }
    
    // Resetăm banii cash la 0 și creăm un raport despre pierderea banilor
    await Character.findByIdAndUpdate(character._id, {
      'money.cash': 0
    });
    
    // Creăm un raport pentru pierderea banilor
    await Report.create({
      characterId: character._id,
      type: 'attack',
      subject: `Ai pierdut toți yang din inventar!`,
      content: `Din cauza înfrângerii împotriva lui ${mobName}, ți-ai pierdut toți yang din inventar (cash). Yang din depozitul bancar rămâne intact.`,
      read: false,
      result: 'defeat',
    });
  }
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

    // Verifica dacă jucătorul are HP
    if (character.hp.current <= 0) {
      throw new ApiError('Nu poți începe o muncă cu 0 HP', 400);
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
      throw new ApiError('Invalid character or work ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to delete works for this character
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to delete works for this character', 401);
    }

    // Get the work
    const work = await Work.findOne({ _id: workId, characterId });

    if (!work) {
      throw new ApiError('Work not found', 404);
    }

    // Refund stamina if the work has not been completed
    if (work.staminaCost) {
      character.stamina.current = Math.min(character.stamina.max, character.stamina.current + work.staminaCost);
      await character.save();
    }

    // Delete work
    await Work.findByIdAndDelete(workId);

    res.status(200).json({ message: 'Work deleted successfully' });
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

// @desc    Update a work
// @route   PUT /api/works/:characterId/:workId
// @access  Private
export const updateWork = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId, workId } = req.params;
    const updateData = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(workId)) {
      throw new ApiError('Invalid character or work ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to update works for this character
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to update works for this character', 401);
    }

    // Get the work
    const work = await Work.findOne({ _id: workId, characterId });

    if (!work) {
      throw new ApiError('Work not found', 404);
    }

    // Verificam dacă se actualizează timpul de travel și se oferă și originalTravelTime
    // Dacă nu se oferă originalTravelTime, dar se actualizează travelTime, setăm originalTravelTime = travelTime
    if (updateData.travelTime !== undefined && updateData.originalTravelTime === undefined) {
      updateData.originalTravelTime = updateData.travelTime;
    }

    // Update work with new data
    // Folosim update în loc de save pentru a evita hooks mongoose
    const updatedWork = await Work.findByIdAndUpdate(
      workId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedWork);
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