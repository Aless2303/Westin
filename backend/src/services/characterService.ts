import Character from '../models/characterModel';
import Report from '../models/reportModel';
import { calculateRequiredExp, checkLevelUp, calculateExpPercentage } from '../utils/experienceCalculator';

/**
 * Updates character experience, calculates percentage, and handles level-ups if needed
 * @param characterId The ID of the character
 * @param gainedExp The amount of experience to add
 * @returns The updated character object
 */
export const updateCharacterExperience = async (characterId: string, gainedExp: number) => {
  try {
    // Find the character
    const character = await Character.findById(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Get current stats
    const currentLevel = character.level;
    const currentExp = character.experience.current;
    
    // Add experience
    const newTotalExp = currentExp + gainedExp;
    
    // Check for level up
    const { newLevel, remainingExp, justLeveledUp } = checkLevelUp(newTotalExp, currentLevel);
    
    // Calculate required experience for the new level
    const requiredExp = calculateRequiredExp(newLevel);
    
    // Calculate new experience percentage
    const newPercentage = calculateExpPercentage(remainingExp, newLevel);
    
    // Prepare the update object
    const updateData: any = {
      'experience.current': remainingExp,
      'experience.percentage': newPercentage,
      'experience.required': requiredExp,
    };
    
    // If character leveled up, update level and stats
    if (justLeveledUp) {
      updateData.level = newLevel;
      
      // Increase base stats (HP, stamina, attack, defense) with level
      updateData['hp.max'] = 100 + (newLevel - 1) * 10; // +10 HP per level
      updateData['stamina.max'] = 100 + (newLevel - 1) * 5; // +5 stamina per level
      updateData.attack = 10 + (newLevel - 1) * 2; // +2 attack per level
      updateData.defense = 5 + (newLevel - 1) * 1; // +1 defense per level
      
      // Also restore HP and stamina on level up as a bonus
      updateData['hp.current'] = updateData['hp.max'];
      updateData['stamina.current'] = updateData['stamina.max'];
      
      // Create a level up report
      await Report.create({
        characterId: character._id,
        type: 'info',
        subject: `Felicitări! Ai avansat la nivelul ${newLevel}`,
        content: `Ai avansat de la nivelul ${currentLevel} la nivelul ${newLevel}!\n\n` +
                `Statisticile tale au crescut:\n` +
                `- HP Maxim: ${character.hp.max} → ${updateData['hp.max']}\n` +
                `- Stamina Maximă: ${character.stamina.max} → ${updateData['stamina.max']}\n` +
                `- Atac: ${character.attack} → ${updateData.attack}\n` +
                `- Apărare: ${character.defense} → ${updateData.defense}\n\n` +
                `HP-ul și stamina ta au fost refăcute complet.`,
        read: false
      });
    }
    
    // Update character with all the changes
    const updatedCharacter = await Character.findByIdAndUpdate(
      characterId,
      { $set: updateData },
      { new: true }
    );
    
    return updatedCharacter;
  } catch (error) {
    console.error('Error updating character experience:', error);
    throw error;
  }
};

/**
 * Gets the amount of experience required for a character to level up
 * @param characterId The ID of the character
 * @returns Object containing the current level, experience, and required experience
 */
export const getRequiredExperience = async (characterId: string) => {
  try {
    // Find the character
    const character = await Character.findById(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Calculate required experience for next level
    const requiredExp = calculateRequiredExp(character.level);
    
    return {
      currentLevel: character.level,
      currentExp: character.experience.current,
      requiredExp,
      percentage: character.experience.percentage
    };
  } catch (error) {
    console.error('Error getting required experience:', error);
    throw error;
  }
}; 