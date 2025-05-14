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
      // Log work details to help diagnose the issue
      console.log('Processing completed work:', {
        id: work._id,
        mobName: work.mobName,
        mobType: work.mobType,
        isDuel: work.mobType === 'duel',
        hasDuelOpponentData: !!work.duelOpponent
      });
      
      if (work.mobType === 'duel') {
        console.log('Found completed duel:', work.mobName);
        try {
          if (work.duelOpponent) {
            const opponentData = JSON.parse(work.duelOpponent);
            console.log('Duel opponent data:', opponentData);
          } else {
            console.warn('Warning: Duel without opponent data:', work.mobName);
          }
        } catch (e) {
          console.error('Error parsing duel opponent data:', e);
        }
      }
      
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
  
  // Special handling for duels - these are PvP encounters
  if (work.mobType === 'duel') {
    // Check if we have duel opponent information
    if (!work.duelOpponent) {
      console.error('Duel job without opponent data:', work);
      // Create an error report
      await Report.create({
        characterId: work.characterId,
        type: 'info',
        subject: `Eroare la procesarea duelului`,
        content: `A apărut o eroare la procesarea duelului. Te rugăm să contactezi un administrator.`,
        read: false,
        result: 'impartial'
      });
      return;
    }

    // Parse the opponent data
    let opponentData;
    try {
      opponentData = JSON.parse(work.duelOpponent);
    } catch (error) {
      console.error('Error parsing duel opponent data:', error);
      return;
    }

    // Generate detailed combat logs
    const combatLogs: string[] = [];
    const playerAttack = character.attack || 100;
    const playerDefense = character.defense || 50;
    const playerHp = character.hp.current;
    const mobAttack = work.mobAttack || 80;
    const mobHp = work.mobHp;
    const mobName = work.mobName.replace('Duel cu ', '');
    
    let currentPlayerHp = playerHp;
    let currentMobHp = mobHp;
    
    // Default to 10 rounds for duels
    const totalRounds = 10;
    
    // Start combat log
    combatLogs.push(`[Duel început] Tu vs ${mobName}`);
    
    // The player with the higher level attacks first
    const playerFirst = character.level >= opponentData.level;
    
    // Simulate combat rounds
    for (let round = 1; round <= totalRounds; round++) {
      if (currentPlayerHp <= 0 || currentMobHp <= 0) break;
      
      combatLogs.push(`-------- Runda ${round} --------`);
      
      if (playerFirst) {
        // Player attacks first
        const damageToMob = Math.round(playerAttack * (1 - opponentData.defense / (opponentData.defense + 300)));
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        combatLogs.push(`Tu ataci ${mobName} pentru ${damageToMob} damage.`);
        combatLogs.push(`→ HP-ul lui ${mobName}: ${currentMobHp}/${mobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${mobName}!`);
          break;
        }
        
        // Opponent attacks second
        const damageToPlayer = Math.round(mobAttack * (1 - playerDefense / (playerDefense + 300)));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(`${mobName} te atacă pentru ${damageToPlayer} damage.`);
        combatLogs.push(`→ HP-ul tău: ${currentPlayerHp}/${playerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${mobName}!`);
          break;
        }
      } else {
        // Opponent attacks first
        const damageToPlayer = Math.round(mobAttack * (1 - playerDefense / (playerDefense + 300)));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(`${mobName} te atacă pentru ${damageToPlayer} damage.`);
        combatLogs.push(`→ HP-ul tău: ${currentPlayerHp}/${playerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${mobName}!`);
          break;
        }
        
        // Player attacks second
        const damageToMob = Math.round(playerAttack * (1 - opponentData.defense / (opponentData.defense + 300)));
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        combatLogs.push(`Tu ataci ${mobName} pentru ${damageToMob} damage.`);
        combatLogs.push(`→ HP-ul lui ${mobName}: ${currentMobHp}/${mobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${mobName}!`);
          break;
        }
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
      // Calculate rewards based on level difference
      const baseLevelDiff = opponentData.level - character.level;
      const levelMultiplier = Math.max(0.5, 1 + baseLevelDiff * 0.02);
      
      actualExpGained = Math.round(opponentData.level * 50 * levelMultiplier);
      actualYangGained = Math.round(opponentData.level * 100 * levelMultiplier);
    }
    
    // Create detailed report content
    let contentPrefix = '';
    switch (result) {
      case 'victory':
        contentPrefix = `Ai câștigat duelul împotriva jucătorului ${mobName}! Ai câștigat ${actualExpGained} experiență și ${actualYangGained} yang.`;
        break;
      case 'defeat':
        contentPrefix = `Ai pierdut duelul împotriva jucătorului ${mobName}. Nu ai primit nicio recompensă.`;
        break;
      case 'impartial':
        contentPrefix = `Duelul tău împotriva jucătorului ${mobName} s-a terminat fără un câștigător clar. Nu ai primit nicio recompensă.`;
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
      type: 'duel',
      subject: `Duel ${result === 'victory' ? 'câștigat' : result === 'defeat' ? 'pierdut' : 'nedecis'}: ${mobName}`,
      content,
      read: false,
      playerName: mobName,
      mobType: 'duel',
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
    
    // Update player's duels statistics based on result
    let updateData: any = {
      'hp.current': newHp,
      'money.cash': newYang
    };
    
    // Update duelsWon or duelsLost based on the result
    if (result === 'victory') {
      console.log(`Player ${character.name} (${character._id}) won duel - updating duelsWon from ${character.duelsWon || 0} to ${(character.duelsWon || 0) + 1}`);
      updateData.duelsWon = (character.duelsWon || 0) + 1;
    } else if (result === 'defeat') {
      console.log(`Player ${character.name} (${character._id}) lost duel - updating duelsLost from ${character.duelsLost || 0} to ${(character.duelsLost || 0) + 1}`);
      updateData.duelsLost = (character.duelsLost || 0) + 1;
    }
    
    try {
      // Use a separate try-catch for the player update to isolate any issues
      await Character.findByIdAndUpdate(character._id, updateData);
      console.log(`Successfully updated player ${character.name} stats:`, updateData);
    } catch (updateError) {
      console.error('Error updating player stats:', updateError);
    }
    
    // Update experience with level-up check if there was a victory
    if (actualExpGained > 0) {
      await updateCharacterExperience(character._id.toString(), actualExpGained);
    }
    
    // Find opponent's character to update their duel statistics
    try {
      // Extract clean opponent name
      const opponentName = work.mobName.replace('Duel cu ', '').trim();
      
      console.log('Looking for opponent with name:', opponentName);
      
      // Try to find the opponent by name - we should ensure names are unique
      const opponentCharacter = await Character.findOne({ name: opponentName });
      
      if (opponentCharacter) {
        console.log('Found opponent character:', opponentCharacter._id, opponentCharacter.name);
        
        // Update opponent's duels won/lost (opposite of the player's result)
        let opponentUpdateData: any = {};
        
        if (result === 'victory') {
          console.log('Opponent lost duel - updating duelsLost from', opponentCharacter.duelsLost || 0, 'to', (opponentCharacter.duelsLost || 0) + 1);
          opponentUpdateData.duelsLost = (opponentCharacter.duelsLost || 0) + 1;
        } else if (result === 'defeat') {
          console.log('Opponent won duel - updating duelsWon from', opponentCharacter.duelsWon || 0, 'to', (opponentCharacter.duelsWon || 0) + 1);
          opponentUpdateData.duelsWon = (opponentCharacter.duelsWon || 0) + 1;
        }
        
        await Character.findByIdAndUpdate(opponentCharacter._id, opponentUpdateData);
        console.log('Successfully updated opponent stats:', opponentUpdateData);
      } else {
        console.error('Could not find opponent character with name:', opponentName);
        // Try to find by similar name - maybe case insensitive
        const similarNameOpponent = await Character.findOne({
          name: { $regex: new RegExp('^' + opponentName + '$', 'i') }
        });
        
        if (similarNameOpponent) {
          console.log('Found opponent with similar name:', similarNameOpponent.name);
          
          // Update with the same logic as above
          let similarOpponentUpdateData: any = {};
          
          if (result === 'victory') {
            similarOpponentUpdateData.duelsLost = (similarNameOpponent.duelsLost || 0) + 1;
          } else if (result === 'defeat') {
            similarOpponentUpdateData.duelsWon = (similarNameOpponent.duelsWon || 0) + 1;
          }
          
          await Character.findByIdAndUpdate(similarNameOpponent._id, similarOpponentUpdateData);
          console.log('Successfully updated opponent with similar name:', similarOpponentUpdateData);
        } else {
          console.error('No similar name found either. Available names might not match. Checking all characters:');
          // Let's log all character names to diagnose the issue
          const allCharacters = await Character.find({}, 'name');
          console.log('Available character names:', allCharacters.map(c => c.name));
        }
      }
    } catch (error) {
      console.error('Error updating opponent stats:', error);
    }
    
    return; // Exit early, we've handled the duel
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
      originalJobTime,
      duelOpponent
    } = req.body;

    // Log the relevant duel information
    if (mobType === 'duel') {
      console.log('Creating a new duel work:', { 
        mobName, 
        hasDuelOpponent: !!duelOpponent,
        duelOpponentLength: duelOpponent ? duelOpponent.length : 0
      });
    }

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
      jobEndTime,
      // Include duelOpponent data if it's a duel
      ...(mobType === 'duel' && duelOpponent ? { duelOpponent } : {})
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