import { PlayerType } from "../../../types/player";
import { CharacterType } from "../../../types/character";

/**
 * Combină jucătorii și caracterul în aceeași listă
 * @param players - Lista de jucători
 * @param character - Caracterul curent
 * @returns Lista combinată de jucători
 */
export const combinePlayersAndCharacter = (
  players: PlayerType[], 
  character: CharacterType
): PlayerType[] => {
  // Convertim caracterul la tipul PlayerType
  const characterAsPlayer: PlayerType = {
    id: "current-player",
    name: character.name,
    level: character.level,
    race: character.race,
    gender: character.gender,
    x: character.x,
    y: character.y,
    image: `/Races/${character.gender.toLowerCase()}/${character.race.toLowerCase()}.png`,
    hp: character.hp,
    attack: character.attack,
    defense: character.defense,
    experience: character.experience
  };

  // Combinăm caracterul cu restul jucătorilor
  return [characterAsPlayer, ...players];
};

/**
 * Sortează jucătorii după nivel și experiență
 * @param players - Lista de jucători
 * @returns Lista sortată de jucători
 */
export const sortPlayersByRank = (players: PlayerType[]): PlayerType[] => {
  return [...players].sort((a, b) => {
    // Sortare primară după nivel
    if (a.level !== b.level) {
      return b.level - a.level;
    }
    
    // Sortare secundară după experiență
    const aExp = a.experience?.current || 0;
    const bExp = b.experience?.current || 0;
    return bExp - aExp;
  });
}; 