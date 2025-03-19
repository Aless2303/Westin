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
  mobType?: 'boss' | 'metin';
  
  // Statistici mob
  mobLevel?: number;
  mobHp?: number;
  mobAttack?: number;
  mobExp?: number;
  mobYang?: number;
}

interface WorksContextType {
  jobs: Job[];
  addJob: (job: Job) => boolean;
  removeJob: () => void;
  removeJobById: (index: number) => void;
  characterPosition: { x: number, y: number };
  setCharacterPosition: (x: number, y: number) => void;
}

// Create context with default values
const WorksContext = createContext<WorksContextType>({
  jobs: [],
  addJob: () => false,
  removeJob: () => {},
  removeJobById: () => {},
  characterPosition: { x: 0, y: 0 },
  setCharacterPosition: () => {},
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
    // Adăugăm attack și defense - acestea ar trebui adăugate în interfața CharacterType din GamePage.tsx
    attack?: number;
    defense?: number;
  };
}

// Provider component that wraps your app and makes works context available
export const WorksProvider: React.FC<WorksProviderProps> = ({ 
  children, 
  characterPositionUpdater,
  characterStats
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [characterPosition, setCharacterPositionInternal] = useState({ x: 350, y: 611 }); // Default position
  const { addReport } = useReports(); // Folosim hook-ul de rapoarte pentru a adăuga rapoarte
  
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
  
  // Simulează lupta dintre jucător și mob
  const simulateCombat = (job: Job): CombatResult => {
    const playerLevel = characterStats.level;
    const playerHp = characterStats.hp.current;
    const playerAttack = characterStats.attack || 5000; // Valoare default dacă nu este furnizată
    const playerDefense = characterStats.defense || 200; // Valoare default dacă nu este furnizată
    
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
        successPercentage = 0.65; // 0.65% din recompense
        break;
      case '10m':
        totalRounds = 30; // Simulăm doar 30 de runde pentru eficiență
        successPercentage = 23.5; // 23.5% din recompense
        break;
      case '1h':
        totalRounds = 60; // Simulăm doar 60 de runde pentru eficiență
        successPercentage = 100; // 100% din recompense
        break;
      default:
        totalRounds = 15;
        successPercentage = 0.65;
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
      
      if (playerAttacksFirst) {
        // Jucătorul atacă primul
        const damageToMob = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, mobLevel / (mobLevel + 300))));
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        combatLogs.push(`[Runda ${round}] Tu ataci ${job.mobName} pentru ${damageToMob} damage. ${job.mobName} HP: ${currentMobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins ${job.mobName}!`);
          break;
        }
        
        // Mob atacă după jucător
        const damageToPlayer = Math.round(mobAttack * mobLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        playerHpLost += damageToPlayer;
        combatLogs.push(`[Runda ${round}] ${job.mobName} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${job.mobName}!`);
          break;
        }
      } else {
        // Mob atacă primul
        const damageToPlayer = Math.round(mobAttack * mobLevelFactor * (1 - Math.min(0.7, playerDefense / (playerDefense + 300))));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        playerHpLost += damageToPlayer;
        combatLogs.push(`[Runda ${round}] ${job.mobName} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${job.mobName}!`);
          break;
        }
        
        // Jucătorul atacă după mob
        const damageToMob = Math.round(playerAttack * playerLevelFactor * (1 - Math.min(0.7, mobLevel / (mobLevel + 300))));
        currentMobHp = Math.max(0, currentMobHp - damageToMob);
        combatLogs.push(`[Runda ${round}] Tu ataci ${job.mobName} pentru ${damageToMob} damage. ${job.mobName} HP: ${currentMobHp}`);
        
        if (currentMobHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins ${job.mobName}!`);
          break;
        }
      }
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

  // Add a new job (limit to 3)
  const addJob = useCallback((job: Job) => {
    if (jobs.length < 3) {
      setJobs((prev) => {
        // Get the expected end position after all current jobs
        let expectedEndPos = { ...characterPosition };
        if (prev.length > 0) {
          // Find the last job to get the final position
          const lastJob = prev[prev.length - 1];
          expectedEndPos = { x: lastJob.mobX, y: lastJob.mobY };
        }
        
        // Calculate real travel time from expected end position to new mob
        const travelTimeSeconds = calculateRealTravelTime(
          expectedEndPos.x,
          expectedEndPos.y,
          job.mobX,
          job.mobY
        );
        
        // Set absolute end timestamps for reliable timing
        const now = Date.now();
        const travelEndTime = now + (travelTimeSeconds * 1000);
        const jobDurationSeconds = job.type === '15s' ? 15 : job.type === '10m' ? 600 : 3600;
        const jobEndTime = travelEndTime + (jobDurationSeconds * 1000);
        
        // Add the new job with timestamps and original durations
        return [...prev, {
          ...job,
          travelTime: travelTimeSeconds,
          isInProgress: false, // Start in travel mode
          travelEndTime,
          jobEndTime,
          originalTravelTime: travelTimeSeconds, // Store original durations for progress calculation
          originalJobTime: jobDurationSeconds
        }];
      });
      
      return true; // Job added successfully
    } else {
      console.log('Maximum 3 jobs allowed!');
      return false; // Job not added
    }
  }, [jobs, characterPosition]);

  // Remove the completed job and shift the queue
  const removeJob = useCallback(() => {
    setJobs((prev) => prev.slice(1));
  }, []);

  // Remove a specific job by its index
  const removeJobById = useCallback((index: number) => {
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
  }, [characterPosition]);

  // Format rewards based on job type
  const formatRewards = (job: Job, expGained: number, yangGained: number): string => {
    switch (job.type) {
      case '15s':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (${Math.round(0.65)}% din total)`;
      case '10m':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (${Math.round(23.5)}% din total)`;
      case '1h':
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang (100% din total)`;
      default:
        return `${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang`;
    }
  };

  // Animation frame-based timer logic
  useEffect(() => {
    // Cancel any existing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Only start animation if there are jobs
    if (jobs.length === 0) return;
    
    const updateJobTimes = () => {
      const now = Date.now();
      
      setJobs(prev => {
        if (prev.length === 0) return prev;
        
        const updatedJobs = [...prev];
        const currentJob = { ...updatedJobs[0] };
        let jobUpdated = false;
        
        // Check if job phase transitions or completes based on absolute timestamps
        if (!currentJob.isInProgress && currentJob.travelEndTime && now >= currentJob.travelEndTime) {
          // Travel phase complete, switch to job phase
          currentJob.isInProgress = true;
          jobUpdated = true;
          
          // Update character position to mob coordinates
          setCharacterPosition(currentJob.mobX, currentJob.mobY);
          console.log(`Arrived at: ${currentJob.mobName || 'Unknown'}`);
        } 
        else if (currentJob.isInProgress && currentJob.jobEndTime && now >= currentJob.jobEndTime) {
          // Job phase complete, remove this job
          console.log(`Job completed: ${currentJob.mobName || 'Unknown'}`);
          
          // Stocăm job-ul finalizat pentru a crea raportul în următorul ciclu de renderizare
          completedJobRef.current = { ...currentJob };
          
          return updatedJobs.slice(1);
        }
        
        // Update remaining times based on timestamps
        if (!currentJob.isInProgress && currentJob.travelEndTime) {
          currentJob.travelTime = Math.max(0, Math.ceil((currentJob.travelEndTime - now) / 1000));
          jobUpdated = true;
        } 
        else if (currentJob.isInProgress && currentJob.jobEndTime) {
          currentJob.remainingTime = Math.max(0, Math.ceil((currentJob.jobEndTime - now) / 1000));
          jobUpdated = true;
        }
        
        // Only update the job if something changed
        if (jobUpdated) {
          updatedJobs[0] = currentJob;
          return updatedJobs;
        }
        
        return prev;
      });
      
      // Schedule next update
      animationFrameRef.current = requestAnimationFrame(updateJobTimes);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateJobTimes);
    
    // Clean up on unmount or when jobs change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [jobs.length, setCharacterPosition]);
  
  // Effect separat pentru a adăuga rapoarte după ce job-urile sunt finalizate
  useEffect(() => {
    // Verificăm dacă avem un job finalizat în referință
    if (completedJobRef.current && addReport) {
      const completedJob = completedJobRef.current;
      
      if (completedJob.mobName) {
        const mobType = completedJob.mobType || 'metin';
        
        // Simulăm lupta pentru a determina rezultatul
        const combatResult = simulateCombat(completedJob);
        
        // Utilizăm o valoare combinată pentru ID pentru a evita duplicatele
        const uniqueIdBase = Date.now().toString();
        const uniqueId = uniqueIdBase + "_" + Math.random().toString(36).substring(2, 7);
        
        // Formatează recompensele pentru afișare
        const rewardsText = formatRewards(completedJob, combatResult.expGained, combatResult.yangGained);
        
        // Generăm conținutul raportului
        let reportContent = '';
        
        if (combatResult.result === 'victory') {
          reportContent = `Ai învins cu succes ${completedJob.mobName}ul după o luptă de ${completedJob.type === '15s' ? '15 secunde' : completedJob.type === '10m' ? '10 minute' : '1 oră'}!\n\n` +
            `Ai primit ${rewardsText} ca recompensă.\n\n` +
            `Detalii luptă:\n` +
            `- Ai provocat ${combatResult.damageDealt.toLocaleString()} damage\n` +
            `- Ai pierdut ${combatResult.playerHpLost.toLocaleString()} HP\n` +
            `- Lupta a durat ${combatResult.totalRounds} runde\n\n` +
            `Ultimele acțiuni:\n` +
            combatResult.combatLogs.slice(-3).join('\n');
        } else {
          reportContent = `Atacul tău împotriva ${completedJob.mobName}ului a eșuat!\n\n` +
            `Nu ai primit nicio recompensă.\n\n` +
            `Detalii luptă:\n` +
            `- Ai provocat ${combatResult.damageDealt.toLocaleString()} damage\n` +
            `- Ai pierdut ${combatResult.playerHpLost.toLocaleString()} HP\n` +
            `- Lupta a durat ${combatResult.totalRounds} runde\n` +
            `- ${completedJob.mobName}ul a rămas cu ${combatResult.remainingMobHp.toLocaleString()} HP\n\n` +
            `Ultimele acțiuni:\n` +
            combatResult.combatLogs.slice(-3).join('\n');
        }
        
        // Creează raportul în funcție de rezultatul luptei
        addReport({
          id: uniqueId,
          type: 'attack',
          subject: `Raport de atac: ${completedJob.mobName}`,
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
      
      // Resetăm referința
      completedJobRef.current = null;
    }
  }, [jobs, addReport, simulateCombat]);
  
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
  };

  return <WorksContext.Provider value={value}>{children}</WorksContext.Provider>;
};