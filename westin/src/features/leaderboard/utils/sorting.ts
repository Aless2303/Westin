import { PlayerType } from "../../../types/player";

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