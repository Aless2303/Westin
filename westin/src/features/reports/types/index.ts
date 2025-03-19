// Define report types
export type ReportType = 'duel' | 'attack';

// Interfața pentru statisticile de luptă
export interface CombatStats {
  playerHpLost: number;
  damageDealt: number;
  expGained: number;
  yangGained: number;
  totalRounds: number;
  remainingMobHp: number;
}

export interface Report {
  id: string;
  type: ReportType;
  subject: string;
  timestamp: Date;
  content: string;
  read: boolean;
  
  // Additional metadata to differentiate report types
  playerName?: string;      // For duel reports - opponent name
  mobName?: string;         // For attack reports - mob/boss name 
  mobType?: 'boss' | 'metin';  // Mob type for attack reports
  result?: 'victory' | 'defeat'; // Outcome of duel or attack
  
  // Statistici de luptă
  combatStats?: CombatStats;
}