// Define report types
export type ReportType = 'duel' | 'attack' | 'sleep';

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
  _id: string;      // Folosim _id în loc de id pentru a fi consistent cu MongoDB
  characterId: string;
  type: ReportType;
  subject: string;
  content: string;
  read: boolean;
  
  // Additional metadata to differentiate report types
  playerName?: string;      // For duel reports - opponent name
  mobName?: string;         // For attack reports - mob/boss name 
  mobType?: 'boss' | 'metin' | 'duel' | 'town' | 'sleep';  // Mob type for attack reports
  result?: 'victory' | 'defeat' | 'impartial'; // Outcome of duel or attack
  
  // Statistici de luptă
  combatStats?: CombatStats;
  
  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}