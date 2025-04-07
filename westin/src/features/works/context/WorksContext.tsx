import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useReports } from '../../reports/hooks/useReports';

export interface Job {
  type: '15s' | '10m' | '1h';
  remainingTime: number; // Time in seconds for the actual job
  travelTime: number; // Time in seconds for travel
  isInProgress: boolean; // Flag to indicate if traveling (false) or working (true)
  mobName?: string; // Added mob name to display in the jobs panel
  mobImage?: string; // Added mob image path
  mobX: number; // Mob X coordinate for character position update
  mobY: number; // Mob Y coordinate for character position update
  
  // Absolute timestamps for reliable timing
  travelEndTime?: number; // When travel phase ends (milliseconds timestamp)
  jobEndTime?: number; // When job phase ends (milliseconds timestamp)
  
  // Original durations for progress calculation
  originalTravelTime?: number; // Original travel time in seconds
  originalJobTime?: number; // Original job time in seconds
  
  // Pentru a ști tipul mobului pentru rapoarte
  mobType?: 'boss' | 'metin' | 'duel' | 'town' | 'sleep'; // Adăugăm 'town' și 'sleep'
  
  // Statistici mob
  mobLevel?: number;
  mobHp?: number;
  mobAttack?: number;
  mobExp?: number;
  mobYang?: number;
  
  // Stamina cost for the job
  staminaCost?: number;
  
  // Proprietăți specifice pentru dueluri
  duelOpponent?: string; 
  duelOpponentRace?: string;
  duelOpponentLevel?: number;
  duelOpponentAttack?: number;
  duelOpponentDefense?: number;
}

interface CharacterStats {
  name: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  stamina: {
    current: number;
    max: number;
  };
  attack?: number;
  defense?: number;
}

interface WorksContextType {
  jobs: Job[];
  addJob: (job: Job) => boolean;
  removeJob: () => void;
  removeJobById: (index: number) => void;
  characterPosition: { x: number, y: number };
  setCharacterPosition: (x: number, y: number) => void;
  characterStats: CharacterStats;
}

// Create context with default values
const WorksContext = createContext<WorksContextType>({
  jobs: [],
  addJob: () => false,
  removeJob: () => {},
  removeJobById: () => {},
  characterPosition: { x: 0, y: 0 },
  setCharacterPosition: () => {},
  characterStats: {
    name: "",
    level: 0,
    hp: {
      current: 0,
      max: 0
    },
    stamina: {
      current: 0,
      max: 0
    }
  }
});

// Custom hook to use the works context
export const useWorks = () => useContext(WorksContext);

// Simularea luptei între jucător și mob
interface CombatResult {
  result: 'victory' | 'defeat';
  playerHpLost: number;
  damageDealt: number;
  remainingMobHp: number;
  expGained: number;
  yangGained: number;
  combatLogs: string[];
  totalRounds: number;
}

interface WorksProviderProps {
  children: ReactNode;
  characterPositionUpdater?: (x: number, y: number) => void;
  // Adăugăm statisticile caracterului
  characterStats: {
    name: string;
    level: number;
    hp: {
      current: number;
      max: number;
    };
    stamina: {
      current: number;
      max: number;
    };
    // Adăugăm attack și defense - acestea ar trebui adăugate în interfața CharacterType din GamePage.tsx
    attack?: number;
    defense?: number;
  };
  // Add updatePlayerHp function to the props
  updatePlayerHp: (newHp: number) => void;
  // Add updatePlayerStamina function to the props
  updatePlayerStamina: (newStamina: number) => void;
}

// Provider component that wraps your app and makes works context available
export const WorksProvider: React.FC<WorksProviderProps> = ({ 
  children, 
  characterPositionUpdater,
  characterStats,
  updatePlayerHp,
  updatePlayerStamina
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [characterPosition, setCharacterPositionInternal] = useState({ x: 350, y: 611 }); // Default position
  const { addReport } = useReports(); // Folosim hook-ul de rapoarte pentru a adăuga rapoarte
  
  console.log('addReport disponibil în WorksContext:', !!addReport);
  
  // Reference for animation frame and position update function
  const animationFrameRef = useRef<number | null>(null);
  const pendingPositionUpdateRef = useRef<{ x: number, y: number } | null>(null);
  
  // Referință pentru job-urile care tocmai s-au terminat pentru a adăuga rapoarte în useEffect
  const completedJobRef = useRef<Job | null>(null);
  
  // Helper to update both internal state and parent component
  const setCharacterPosition = useCallback((x: number, y: number) => {
    setCharacterPositionInternal({ x, y });
    
    // Schedule parent component update for next tick to avoid render cycle issues
    if (characterPositionUpdater) {
      pendingPositionUpdateRef.current = { x, y };
    }
  }, [characterPositionUpdater]);

  // Process any pending position updates
  useEffect(() => {
    if (pendingPositionUpdateRef.current && characterPositionUpdater) {
      const { x, y } = pendingPositionUpdateRef.current;
      setTimeout(() => {
        characterPositionUpdater(x, y);
      }, 0);
      pendingPositionUpdateRef.current = null;
    }
  }, [jobs, characterPositionUpdater]);

  // Calculate travel time based on current character position and mob position
  const calculateRealTravelTime = (
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ): number => {
    const distance = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const tolerance = 1;

    if (distance <= tolerance) {
      return 0;
    }

    // Convert to seconds (speed ratio: 141.42 units = 1 minute)
    const seconds = Math.round((distance / 141.42) * 60);
    return Math.max(1, seconds); // Ensure minimum travel time is 1 second
  };
  
  // Simulează lupta dintre jucător și mob/adversar
  const simulateCombat = (job: Job): CombatResult => {
    // Dacă este job de tip town sau sleep, returnăm rezultat de victorie fără combat
    if (job.mobType === 'town' || job.mobType === 'sleep') {
      return {
        result: 'victory',
        playerHpLost: 0,
        damageDealt: 0,
        remainingMobHp: 0,
        expGained: job.mobType === 'sleep' ? 0 : 50, // 50 XP simbolic pentru deplasarea în oraș
        yangGained: 0,
        combatLogs: job.mobType === 'town' 
          ? ['Te-ai deplasat cu succes în Orașul Westin.'] 
          : ['Te-ai odihnit și ți-ai recuperat puterile.'],
        totalRounds: 0
      };
    }
    
    const playerLevel = characterStats.level;
    const playerHp = characterStats.hp.current;
    const playerAttack = characterStats.attack || 5000; // Valoare default dacă nu este furnizată
    const playerDefense = characterStats.defense || 200; // Valoare default dacă nu este furnizată
    
    // Verifică dacă este un duel
    if (job.mobType === 'duel') {
      // Folosește datele oponentului din job
      const opponentLevel = job.duelOpponentLevel || 100;
      const opponentHp = job.mobHp || 5000;
      const opponentAttack = job.mobAttack || 4500;
      const opponentDefense = job.duelOpponentDefense || 250;
      
      let currentPlayerHp = playerHp;
      let currentOpponentHp = opponentHp;
      let playerHpLost = 0;
      let expGained = 0;
      let yangGained = 0;
      const combatLogs: string[] = [];
      
      // Determinăm câte runde de luptă vor avea loc pentru duel (mai multe decât pentru mobi)
      const totalRounds = 40;
      
      // Log entry pentru începutul luptei
      combatLogs.push(`[Duel început] ${job.duelOpponent} (Nivel ${opponentLevel}) vs Tine (Nivel ${playerLevel}, HP ${playerHp})`);
      
      // Factori de nivel pentru a calcula damage-ul
      const levelDifference = playerLevel - opponentLevel;
      const playerLevelFactor = Math.max(0.5, Math.min(1.5, 1 + levelDifference / 100));
      const opponentLevelFactor = Math.max(0.5, Math.min(1.5, 1 - levelDifference / 100));
      
      // Dă atacurile în ordinea corectă bazat pe nivel
      let playerAttacksFirst = playerLevel >= opponentLevel;
      
      // Simulează luptă rundă cu rundă pentru dueluri
      for (let round = 1; round <= totalRounds; round++) {
        if (currentPlayerHp <= 0 || currentOpponentHp <= 0) {
          break; // Lupta s-a terminat
        }
        
        combatLogs.push(`-------- Runda ${round} --------`);
        
        if (playerAttacksFirst) {
          // Jucătorul atacă primul
          const playerRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
          const damageToOpponent = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, opponentDefense / (opponentDefense + 300))) * playerRoll);
          const previousOpponentHp = currentOpponentHp;
          currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
          
          // Verifică dacă este lovitură critică (10% șansă)
          const isCritical = Math.random() < 0.1;
          if (isCritical) {
            combatLogs.push(`[CRITIC] Tu îl lovești puternic pe ${job.duelOpponent} pentru ${damageToOpponent} damage!`);
          } else {
            combatLogs.push(`Tu îl lovești pe ${job.duelOpponent} pentru ${damageToOpponent} damage.`);
          }
          combatLogs.push(`${job.duelOpponent}: HP ${previousOpponentHp} → ${currentOpponentHp}`);
          
          if (currentOpponentHp <= 0) {
            combatLogs.push(`${job.duelOpponent} a căzut! [Victorie]`);
            break;
          }
          
          // Oponentul atacă după jucător
          const opponentRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
          const damageToPlayer = Math.round(opponentAttack * opponentLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))) * opponentRoll);
          const previousPlayerHp = currentPlayerHp;
          currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
          playerHpLost += damageToPlayer;
          
          // Verifică dacă este lovitură critică (10% șansă)
          const isOpponentCritical = Math.random() < 0.1;
          if (isOpponentCritical) {
            combatLogs.push(`[CRITIC] ${job.duelOpponent} te lovește puternic pentru ${damageToPlayer} damage!`);
          } else {
            combatLogs.push(`${job.duelOpponent} te lovește pentru ${damageToPlayer} damage.`);
          }
          combatLogs.push(`Tu: HP ${previousPlayerHp} → ${currentPlayerHp}`);
          
          if (currentPlayerHp <= 0) {
            combatLogs.push(`Ai fost învins de ${job.duelOpponent}! [Înfrângere]`);
            break;
          }
        } else {
          // Oponentul atacă primul
          const opponentRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
          const damageToPlayer = Math.round(opponentAttack * opponentLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))) * opponentRoll);
          const previousPlayerHp = currentPlayerHp;
          currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
          playerHpLost += damageToPlayer;
          
          // Verifică dacă este lovitură critică (10% șansă)
          const isOpponentCritical = Math.random() < 0.1;
          if (isOpponentCritical) {
            combatLogs.push(`[CRITIC] ${job.duelOpponent} te lovește puternic pentru ${damageToPlayer} damage!`);
          } else {
            combatLogs.push(`${job.duelOpponent} te lovește pentru ${damageToPlayer} damage.`);
          }
          combatLogs.push(`Tu: HP ${previousPlayerHp} → ${currentPlayerHp}`);
          
          if (currentPlayerHp <= 0) {
            combatLogs.push(`Ai fost învins de ${job.duelOpponent}! [Înfrângere]`);
            break;
          }
          
          // Jucătorul atacă după oponent
          const playerRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
          const damageToOpponent = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, opponentDefense / (opponentDefense + 300))) * playerRoll);
          const previousOpponentHp = currentOpponentHp;
          currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
          
          // Verifică dacă este lovitură critică (10% șansă)
          const isCritical = Math.random() < 0.1;
          if (isCritical) {
            combatLogs.push(`[CRITIC] Tu îl lovești puternic pe ${job.duelOpponent} pentru ${damageToOpponent} damage!`);
          } else {
            combatLogs.push(`Tu îl lovești pe ${job.duelOpponent} pentru ${damageToOpponent} damage.`);
          }
          combatLogs.push(`${job.duelOpponent}: HP ${previousOpponentHp} → ${currentOpponentHp}`);
          
          if (currentOpponentHp <= 0) {
            combatLogs.push(`${job.duelOpponent} a căzut! [Victorie]`);
            break;
          }
        }
        
        // Adaugă un rezumat al rundei
        combatLogs.push(`Status la finalul rundei ${round}: Tu (${currentPlayerHp}/${playerHp} HP) vs ${job.duelOpponent} (${currentOpponentHp}/${opponentHp} HP)`);
      }
      
      // Determinăm rezultatul luptei
      let result: 'victory' | 'defeat' = 'defeat';
      
      if (currentOpponentHp <= 0 || (currentOpponentHp > 0 && currentPlayerHp > 0 && playerLevel > opponentLevel)) {
        result = 'victory';
        
        // Calculăm recompensele pentru duel (valori fixe pentru simplitate)
        expGained = 2000;
        yangGained = 5000;
      }
      
      // Dacă jucătorul a pierdut tot HP-ul, setăm stamina la 0
      if (currentPlayerHp <= 0) {
        updatePlayerStamina(0);
      }
      
      return {
        result,
        playerHpLost,
        damageDealt: opponentHp - currentOpponentHp,
        remainingMobHp: currentOpponentHp,
        expGained,
        yangGained,
        combatLogs,
        totalRounds
      };
    }
    
    // Continuă cu logica originală pentru mobi/bossi
    const mobLevel = job.mobLevel || 100; // Default la nivel 100 dacă nu e specificat
    const mobHp = job.mobHp || 75000; // Default la 75000 HP dacă nu e specificat
    const mobAttack = job.mobAttack || 850; // Default la 850 atac dacă nu e specificat
    
    let currentPlayerHp = playerHp;
    let currentMobHp = mobHp;
    let playerHpLost = 0;
    let expGained = 0;
    let yangGained = 0;
    const combatLogs: string[] = [];
    
    // Determinăm câte runde de luptă vor avea loc bazat pe tipul jobului
    let totalRounds: number;
    let successPercentage: number;
    
    switch (job.type) {
      case '15s':
        totalRounds = 15; // 1 atac pe secundă
        successPercentage = 10; // 10% din recompense
        break;
      case '10m':
        totalRounds = 30; // Simulăm doar 30 de runde pentru eficiență
        successPercentage = 40; // 40% din recompense
        break;
      case '1h':
        totalRounds = 60; // Simulăm doar 60 de runde pentru eficiență
        successPercentage = 100; // 100% din recompense
        break;
      default:
        totalRounds = 15;
        successPercentage = 10;
    }
    
    // Factori de nivel pentru a calcula damage-ul
    const levelDifference = playerLevel - mobLevel;
    const playerLevelFactor = Math.max(0.5, Math.min(1.5, 1 + levelDifference / 100));
    const mobLevelFactor = Math.max(0.5, Math.min(1.5, 1 - levelDifference / 100));
    
    // Dă atacurile în ordinea corectă bazat pe nivel
    let playerAttacksFirst = playerLevel >= mobLevel;
    
    // Log entry pentru începutul luptei
    combatLogs.push(`[Lupta începe] ${job.mobName} (Nivel ${mobLevel}, HP ${mobHp}) vs Tine (Nivel ${playerLevel}, HP ${playerHp})`);
    
    // Simulează luptă rundă cu rundă
    for (let round = 1; round <= totalRounds; round++) {
      if (currentPlayerHp <= 0 || currentMobHp <= 0) {
        break; // Lupta s-a terminat
      }
      
      combatLogs.push(`-------- Runda ${round} --------`);
      
      if (playerAttacksFirst) {
        // Jucătorul atacă primul
        const playerRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
        const damageToMob = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, mobLevel / (mobLevel + 300))) * playerRoll);
        const previousMobHp = currentMobHp;
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        
        // Verifică dacă este lovitură critică (10% șansă)
        const isCritical = Math.random() < 0.1;
        if (isCritical) {
          combatLogs.push(`[CRITIC] Tu lovești puternic ${job.mobName}ul pentru ${damageToMob} damage!`);
        } else {
          combatLogs.push(`Tu lovești ${job.mobName}ul pentru ${damageToMob} damage.`);
        }
        combatLogs.push(`${job.mobName}: HP ${previousMobHp} → ${currentMobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`${job.mobName}ul a căzut! [Victorie]`);
          break;
        }
        
        // Mob atacă după jucător
        const mobRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
        const damageToPlayer = Math.round(mobAttack * mobLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))) * mobRoll);
        const previousPlayerHp = currentPlayerHp;
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        playerHpLost += damageToPlayer;
        
        // Verifică dacă este lovitură critică (10% șansă)
        const isMobCritical = Math.random() < 0.1;
        if (isMobCritical) {
          combatLogs.push(`[CRITIC] ${job.mobName}ul te lovește puternic pentru ${damageToPlayer} damage!`);
        } else {
          combatLogs.push(`${job.mobName}ul te lovește pentru ${damageToPlayer} damage.`);
        }
        combatLogs.push(`Tu: HP ${previousPlayerHp} → ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`Ai fost învins de ${job.mobName}! [Înfrângere]`);
          break;
        }
      } else {
        // Mob atacă primul
        const mobRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
        const damageToPlayer = Math.round(mobAttack * mobLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))) * mobRoll);
        const previousPlayerHp = currentPlayerHp;
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        playerHpLost += damageToPlayer;
        
        // Verifică dacă este lovitură critică (10% șansă)
        const isMobCritical = Math.random() < 0.1;
        if (isMobCritical) {
          combatLogs.push(`[CRITIC] ${job.mobName}ul te lovește puternic pentru ${damageToPlayer} damage!`);
        } else {
          combatLogs.push(`${job.mobName}ul te lovește pentru ${damageToPlayer} damage.`);
        }
        combatLogs.push(`Tu: HP ${previousPlayerHp} → ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`Ai fost învins de ${job.mobName}! [Înfrângere]`);
          break;
        }
        
        // Jucătorul atacă după mob
        const playerRoll = Math.random() * 0.2 + 0.9; // Variație între 0.9 și 1.1
        const damageToMob = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, mobLevel / (mobLevel + 300))) * playerRoll);
        const previousMobHp = currentMobHp;
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        
        // Verifică dacă este lovitură critică (10% șansă)
        const isCritical = Math.random() < 0.1;
        if (isCritical) {
          combatLogs.push(`[CRITIC] Tu lovești puternic ${job.mobName}ul pentru ${damageToMob} damage!`);
        } else {
          combatLogs.push(`Tu lovești ${job.mobName}ul pentru ${damageToMob} damage.`);
        }
        combatLogs.push(`${job.mobName}: HP ${previousMobHp} → ${currentMobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`${job.mobName}ul a căzut! [Victorie]`);
          break;
        }
      }
      
      // Adaugă un rezumat al rundei
      combatLogs.push(`Status la finalul rundei ${round}: Tu (${currentPlayerHp}/${playerHp} HP) vs ${job.mobName} (${currentMobHp}/${mobHp} HP)`);
    }
    
    // Determinăm rezultatul luptei
    let result: 'victory' | 'defeat' = 'defeat';
    
    // Considerăm o victorie dacă:
    // 1. Mob-ul e mort SAU
    // 2. Timpul s-a terminat și jucătorul încă are HP
    if (currentMobHp <= 0 || (totalRounds > 0 && currentPlayerHp > 0)) {
      result = 'victory';
      
      // Calculăm recompensele în caz de victorie
      if (job.mobExp && job.mobYang) {
        expGained = Math.round((job.mobExp * successPercentage) / 100);
        yangGained = Math.round((job.mobYang * successPercentage) / 100);
      }
    }
    
    return {
      result,
      playerHpLost,
      damageDealt: mobHp - currentMobHp,
      remainingMobHp: currentMobHp,
      expGained,
      yangGained,
      combatLogs,
      totalRounds
    };
  };

  // Format rewards based on job type
  const formatRewards = (job: Job, expGained: number, yangGained: number): string => {
    switch (job.type) {
      case '15s':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (10% din total)`;
      case '10m':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (40% din total)`;
      case '1h':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (100% din total)`;
      default:
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang`;
    }
  };

  const addJob = useCallback((job: Job) => {
    const staminaCost = job.staminaCost !== undefined ? job.staminaCost : (job.type === '15s' ? 1 : job.type === '10m' ? 4 : 12);
    if (staminaCost > 0 && characterStats.stamina.current < staminaCost) {
      console.log(`Not enough stamina! Need ${staminaCost}, have ${characterStats.stamina.current}`);
      return false;
    }
  
    if (jobs.length < 3) {
      if (staminaCost > 0) {
        const newStamina = Math.max(0, characterStats.stamina.current - staminaCost);
        updatePlayerStamina(newStamina);
      }
  
      setJobs((prev) => {
        let startPos = prev.length > 0 ? { x: prev[prev.length - 1].mobX, y: prev[prev.length - 1].mobY } : characterPosition;
        const travelTimeSeconds = calculateRealTravelTime(startPos.x, startPos.y, job.mobX, job.mobY);
        const now = Date.now();
        const travelEndTime = now + travelTimeSeconds * 1000;
        let jobEndTime = travelEndTime; // Implicit, job-ul se termină după deplasare
        let jobDurationSeconds = 0;
  
        // Setăm durata doar pentru job-urile care nu sunt 'town'
        if (job.mobType !== 'town') {
          jobDurationSeconds = job.type === '15s' ? 15 : job.type === '10m' ? 600 : job.mobType === 'sleep' ? 7200 : 3600;
          jobEndTime = travelEndTime + jobDurationSeconds * 1000;
        }
  
        return [...prev, {
          ...job,
          travelTime: travelTimeSeconds,
          isInProgress: false,
          travelEndTime,
          jobEndTime,
          originalTravelTime: travelTimeSeconds,
          originalJobTime: jobDurationSeconds,
          staminaCost
        }];
      });
      return true;
    }
    console.log('Maximum 3 jobs allowed!');
    return false;
  }, [jobs, characterPosition, characterStats.stamina.current, updatePlayerStamina, calculateRealTravelTime]);

  // Remove the completed job and shift the queue
  const removeJob = useCallback(() => {
    setJobs((prev) => prev.slice(1));
  }, []);

  // Remove a specific job by its index and refund stamina
  const removeJobById = useCallback((index: number) => {
    // Get the job being removed to refund its stamina
    const jobToRemove = jobs[index];
    if (jobToRemove && jobToRemove.staminaCost && jobToRemove.staminaCost > 0) {
      // Refund stamina when manually canceling a job
      const newStamina = Math.min(
        characterStats.stamina.max, 
        characterStats.stamina.current + jobToRemove.staminaCost
      );
      updatePlayerStamina(newStamina);
    }
    
    // If we remove a job in the middle, we need to recalculate travel times for subsequent jobs
    setJobs((prev) => {
      if (index >= prev.length) return prev;
      
      // Create new jobs array without the removed job
      const newJobs = [...prev];
      newJobs.splice(index, 1);
      
      // If there are remaining jobs after the removed one, recalculate their timing
      if (index < newJobs.length) {
        // Determine start position for next job
        let startPos = index === 0 ? characterPosition : { x: prev[index-1].mobX, y: prev[index-1].mobY };
        
        // Current time for new timestamp calculations
        const now = Date.now();
        let nextStartTime = now;
        
        // If there's a job before the removed one, use its end time as the next start time
        if (index > 0 && prev[index-1].jobEndTime) {
          nextStartTime = prev[index-1].jobEndTime;
        }
        
       // Recalculate timings for all remaining jobs
       for (let i = index; i < newJobs.length; i++) {
        // Calculate new travel time
        const travelTimeSeconds = calculateRealTravelTime(
          startPos.x,
          startPos.y,
          newJobs[i].mobX,
          newJobs[i].mobY
        );
        
        // Update timestamps and durations
        const travelEndTime = nextStartTime + (travelTimeSeconds * 1000);
        const jobDurationSeconds = newJobs[i].type === '15s' ? 15 : newJobs[i].type === '10m' ? 600 : 3600;
        const jobEndTime = travelEndTime + (jobDurationSeconds * 1000);
        
        newJobs[i] = {
          ...newJobs[i],
          travelTime: travelTimeSeconds,
          originalTravelTime: travelTimeSeconds,
          travelEndTime,
          jobEndTime,
          isInProgress: false // Reset to travel phase
        };
        
        // Update for next job
        startPos = { x: newJobs[i].mobX, y: newJobs[i].mobY };
        nextStartTime = jobEndTime;
      }
    }
    
    return newJobs;
  });
}, [characterPosition, characterStats.stamina.current, characterStats.stamina.max, jobs, updatePlayerStamina, calculateRealTravelTime]);

// Effect separat pentru a adăuga rapoarte după ce job-urile sunt finalizate
useEffect(() => {
  // Verificăm dacă avem un job finalizat în referință
  if (completedJobRef.current && addReport) {
    const completedJob = completedJobRef.current;
    console.log('Generare raport pentru job finalizat:', completedJob);
    
    // Verificăm special pentru job de tip 'town'
    if (completedJob.mobType === 'town') {
      console.log('Town travel job completed - character arrived at town');
      
      // Generăm un ID unic pentru raport
      const uniqueId = Date.now().toString() + "_town";
      
      // Adăugăm un raport simplu pentru deplasarea în oraș
      addReport({
        id: uniqueId,
        type: 'attack', // Folosim attack ca tip general, dar conținutul va fi diferit
        subject: 'Deplasare către Orașul Westin',
        content: `Te-ai deplasat cu succes către Orașul Westin. Ai primit 50 puncte de experiență pentru călătorie.`,
        read: false,
        mobName: 'Orașul Westin',
        mobType: 'town',
        result: 'victory',
        combatStats: {
          playerHpLost: 0,
          damageDealt: 0,
          expGained: 50,
          yangGained: 0,
          totalRounds: 0,
          remainingMobHp: 0
        }
      });
      
      // Resetăm referința și ieșim din funcție
      completedJobRef.current = null;
      return;
    }
    
    // Verificăm dacă este job-ul de somn pentru a regenera HP și stamina
    if (completedJob.mobType === 'sleep') {
      console.log('Sleep job completed - regenerating HP and stamina');
      // Regenerăm complet HP și stamina
      updatePlayerHp(characterStats.hp.max);
      updatePlayerStamina(characterStats.stamina.max); // Setăm stamina la maximum
      
      // Generăm un ID unic pentru raport
      const uniqueId = Date.now().toString() + "_sleep";
      
      // Adăugăm un raport pentru somn
      addReport({
        id: uniqueId,
        type: 'sleep',
        subject: 'Somn la Han',
        content: `Te-ai odihnit pentru 2 ore și ți-ai regenerat complet HP-ul și stamina.`,
        read: false,
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
      
      // Resetăm referința și ieșim din funcție
      completedJobRef.current = null;
      return;
    }
    
    if (completedJob.mobName) {
      const mobType = completedJob.mobType || 'metin';
      
      // Simulăm lupta pentru a determina rezultatul
      const combatResult = simulateCombat(completedJob);
      
      // Update player HP based on combat results
      const newHp = Math.max(0, characterStats.hp.current - combatResult.playerHpLost);
      updatePlayerHp(newHp);
      
      // Utilizăm o valoare combinată pentru ID pentru a evita duplicatele
      const uniqueIdBase = Date.now().toString();
      const uniqueId = uniqueIdBase + "_" + Math.random().toString(36).substring(2, 7);
      
      // Formatează recompensele pentru afișare
      const rewardsText = formatRewards(completedJob, combatResult.expGained, combatResult.yangGained);
      
      // Generăm conținutul raportului
      let reportContent = '';
      let reportSubject = '';
      
      // Verificăm dacă este un duel sau o luptă normală
      if (completedJob.mobType === 'duel') {
        // Raport pentru duel
        reportSubject = `Duel: ${completedJob.duelOpponent} vs ${characterStats.name}`;
        
        if (combatResult.result === 'victory') {
          reportContent = `Ai câștigat duelul împotriva jucătorului ${completedJob.duelOpponent}!\n\n` +
            `Ai primit ${combatResult.expGained.toLocaleString()} experiență și ${combatResult.yangGained.toLocaleString()} yang ca recompensă.\n\n` +
            `Statistici duel:\n` +
            `- Damage total dat: ${combatResult.damageDealt.toLocaleString()}\n` +
            `- Damage total primit: ${combatResult.playerHpLost.toLocaleString()}\n` +
            `- Runde de luptă: ${combatResult.totalRounds}\n\n` +
            `Desfășurarea luptei:\n` +
            `${combatResult.combatLogs.join('\n')}\n\n` +
            `Victoria îți aduce reputație și te face mai cunoscut în lumea Westin!`;
        } else {
          reportContent = `Ai pierdut duelul împotriva jucătorului ${completedJob.duelOpponent}!\n\n` +
            `Nu ai primit nicio recompensă.\n\n` +
            `Statistici duel:\n` +
            `- Damage total dat: ${combatResult.damageDealt.toLocaleString()}\n` +
            `- Damage total primit: ${combatResult.playerHpLost.toLocaleString()}\n` +
            `- Runde de luptă: ${combatResult.totalRounds}\n\n` +
            `Desfășurarea luptei:\n` +
            `${combatResult.combatLogs.join('\n')}\n\n` +
            `Nu-ți pierde speranța! Antrenează-te mai mult și vei reuși data viitoare.`;
        }
        
        console.log("Adaug raport pentru duel:", {
          id: uniqueId,
          type: 'duel',
          subject: reportSubject
        });
        
        // Creează raportul de duel
        addReport({
          id: uniqueId,
          type: 'duel',
          subject: reportSubject,
          content: reportContent,
          read: false,
          playerName: completedJob.duelOpponent,
          result: combatResult.result,
          // Adăugăm statistici suplimentare
          combatStats: {
            playerHpLost: combatResult.playerHpLost,
            damageDealt: combatResult.damageDealt,
            expGained: combatResult.expGained,
            yangGained: combatResult.yangGained,
            totalRounds: combatResult.totalRounds,
            remainingMobHp: combatResult.remainingMobHp
          }
        });
      } else {
        // Raport pentru atacuri normale (metin/boss)
        reportSubject = `Raport de atac: ${completedJob.mobName}`;
        
        if (combatResult.result === 'victory') {
          reportContent = `Ai învins cu succes ${completedJob.mobName}ul după o luptă de ${completedJob.type === '15s' ? '15 secunde' : completedJob.type === '10m' ? '10 minute' : '1 oră'}!\n\n` +
            `Ai primit ${rewardsText} ca recompensă.\n\n` +
            `Statistici duel:\n` +
            `- Damage total dat: ${combatResult.damageDealt.toLocaleString()}\n` +
            `- Damage total primit: ${combatResult.playerHpLost.toLocaleString()}\n` +
            `- Runde de luptă: ${combatResult.totalRounds}\n\n` +
            `Desfășurarea luptei:\n` +
            `${combatResult.combatLogs.join('\n')}\n\n` +
            `Felicitări pentru victoria împotriva acestui adversar puternic!`;
        } else {
          reportContent = `Atacul tău împotriva ${completedJob.mobName}ului a eșuat!\n\n` +
            `Nu ai primit nicio recompensă.\n\n` +
            `Statistici duel:\n` +
            `- Damage total dat: ${combatResult.damageDealt.toLocaleString()}\n` +
            `- Damage total primit: ${combatResult.playerHpLost.toLocaleString()}\n` +
            `- Runde de luptă: ${combatResult.totalRounds}\n\n` +
            `Desfășurarea luptei:\n` +
            `${combatResult.combatLogs.join('\n')}\n\n` +
            `Nu dispera! Încearcă cu un alt adversar sau echipează-te mai bine.`;
        }
        
        console.log("Adaug raport pentru atac:", {
          id: uniqueId,
          type: 'attack',
          subject: reportSubject
        });
        
        // Creează raportul de atac
        addReport({
          id: uniqueId,
          type: 'attack',
          subject: reportSubject,
          content: reportContent,
          read: false,
          mobName: completedJob.mobName,
          mobType: mobType,
          result: combatResult.result,
          // Adăugăm statistici suplimentare
          combatStats: {
            playerHpLost: combatResult.playerHpLost,
            damageDealt: combatResult.damageDealt,
            expGained: combatResult.expGained,
            yangGained: combatResult.yangGained,
            totalRounds: combatResult.totalRounds,
            remainingMobHp: combatResult.remainingMobHp
          }
        });
      }
    }
    
    // Resetăm referința
    completedJobRef.current = null;
  }
}, [addReport, characterStats.hp.current, simulateCombat, updatePlayerHp, formatRewards, characterStats.name, characterStats.hp.max, characterStats.stamina.max, updatePlayerStamina]);

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (jobs.length === 0) return;

    const updateJobTimes = () => {
      const now = Date.now();

      setJobs((prev) => {
        if (prev.length === 0) return prev;

        const updatedJobs = [...prev];
        const currentJob = { ...updatedJobs[0] };
        let jobUpdated = false;

        // Faza de deplasare
        if (!currentJob.isInProgress && currentJob.travelEndTime && now >= currentJob.travelEndTime) {
          if (currentJob.mobType === 'town') {
            // Pentru 'town', job-ul se termină imediat după deplasare
            setCharacterPosition(currentJob.mobX, currentJob.mobY);
            console.log(`Arrived at: ${currentJob.mobName || 'Unknown'}, completing immediately`);
            completedJobRef.current = { ...currentJob };
            return updatedJobs.slice(1);
          }

          // Pentru alte job-uri, trecem în faza de muncă
          currentJob.isInProgress = true;
          setCharacterPosition(currentJob.mobX, currentJob.mobY);
          console.log(`Arrived at: ${currentJob.mobName || 'Unknown'}, starting work`);
          jobUpdated = true;
        }
        // Faza de muncă terminată
        else if (currentJob.isInProgress && currentJob.jobEndTime && now >= currentJob.jobEndTime) {
          console.log(`Job completed: ${currentJob.mobName || 'Unknown'}`);
          completedJobRef.current = { ...currentJob };

          // Scoatem job-ul terminat și recalculăm deplasarea pentru următorul
          const remainingJobs = updatedJobs.slice(1);
          if (remainingJobs.length > 0) {
            const nextJob = { ...remainingJobs[0] };
            const startPos = { x: currentJob.mobX, y: currentJob.mobY };
            const travelTimeSeconds = calculateRealTravelTime(startPos.x, startPos.y, nextJob.mobX, nextJob.mobY);
            const travelEndTime = now + travelTimeSeconds * 1000;
            let jobEndTime = travelEndTime;
            let jobDurationSeconds = 0;

            if (nextJob.mobType !== 'town') {
              jobDurationSeconds = nextJob.type === '15s' ? 15 : nextJob.type === '10m' ? 600 : nextJob.mobType === 'sleep' ? 7200 : 3600;
              jobEndTime = travelEndTime + jobDurationSeconds * 1000;
            }

            remainingJobs[0] = {
              ...nextJob,
              travelTime: travelTimeSeconds,
              travelEndTime,
              jobEndTime,
              isInProgress: false,
            };

            // Recalculăm restul cozii
            let nextStartPos = { x: remainingJobs[0].mobX, y: remainingJobs[0].mobY };
            let nextStartTime = jobEndTime;
            for (let i = 1; i < remainingJobs.length; i++) {
              const travelTime = calculateRealTravelTime(nextStartPos.x, nextStartPos.y, remainingJobs[i].mobX, remainingJobs[i].mobY);
              const travelEndTime = nextStartTime + travelTime * 1000;
              let jobDuration = 0;
              let jobEndTime = travelEndTime;

              if (remainingJobs[i].mobType !== 'town') {
                jobDuration = remainingJobs[i].type === '15s' ? 15 : remainingJobs[i].type === '10m' ? 600 : remainingJobs[i].mobType === 'sleep' ? 7200 : 3600;
                jobEndTime = travelEndTime + jobDuration * 1000;
              }

              remainingJobs[i] = {
                ...remainingJobs[i],
                travelTime,
                travelEndTime,
                jobEndTime,
                isInProgress: false,
              };
              nextStartPos = { x: remainingJobs[i].mobX, y: remainingJobs[i].mobY };
              nextStartTime = jobEndTime;
            }
          }
          return remainingJobs;
        }

        // Actualizăm timpii rămași
        if (!currentJob.isInProgress && currentJob.travelEndTime) {
          currentJob.travelTime = Math.max(0, Math.ceil((currentJob.travelEndTime - now) / 1000));
          jobUpdated = true;
        } else if (currentJob.isInProgress && currentJob.jobEndTime) {
          currentJob.remainingTime = Math.max(0, Math.ceil((currentJob.jobEndTime - now) / 1000));
          jobUpdated = true;
        }

        if (jobUpdated) {
          updatedJobs[0] = currentJob;
          return updatedJobs;
        }

        return prev;
      });

      animationFrameRef.current = requestAnimationFrame(updateJobTimes);
    };

    animationFrameRef.current = requestAnimationFrame(updateJobTimes);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [jobs.length, setCharacterPosition, calculateRealTravelTime]);

// Clean up on unmount
useEffect(() => {
  return () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);

const value = {
  jobs,
  addJob,
  removeJob,
  removeJobById,
  characterPosition,
  setCharacterPosition,
  characterStats
};

return <WorksContext.Provider value={value}>{children}</WorksContext.Provider>;
};