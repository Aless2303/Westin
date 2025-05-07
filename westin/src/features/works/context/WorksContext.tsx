import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { workService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export interface Job {
  _id?: string; // ID-ul din baza de date
  type: '15s' | '10m' | '1h';
  remainingTime: number; // Time in seconds for the actual job
  travelTime: number; // Time in seconds for travel
  isInProgress: boolean; // Flag to indicate if traveling (false) or working (true)
  mobName?: string; // Added mob name to display in the jobs panel
  mobImage?: string; // Added mob image path
  mobX: number; // Mob X coordinate for character position update
  mobY: number; // Mob Y coordinate for character position update
  
  // Absolute timestamps for reliable timing
  travelEndTime?: number | Date; // When travel phase ends (milliseconds timestamp)
  jobEndTime?: number | Date; // When job phase ends (milliseconds timestamp)
  
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
  
  // Timestamp când a fost ultima actualizare locală
  lastLocalUpdate?: number;
  
  // Flag pentru a marca dacă munca este activă (prima din coadă)
  isActive?: boolean;
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
  addJob: (job: Job) => Promise<boolean>;
  removeJob: () => void;
  removeJobById: (index: number) => void;
  characterPosition: { x: number, y: number };
  setCharacterPosition: (x: number, y: number) => void;
  characterStats: CharacterStats;
  isLoading: boolean;
  error: string | null;
}

// Create context with default values
const WorksContext = createContext<WorksContextType>({
  jobs: [],
  addJob: async () => false,
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
  },
  isLoading: false,
  error: null
});

// Custom hook to use the works context
export const useWorks = () => useContext(WorksContext);

interface WorksProviderProps {
  children: ReactNode;
  characterPositionUpdater?: (x: number, y: number) => void;
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
    attack?: number;
    defense?: number;
  };
  updatePlayerHp: (newHp: number) => void;
  updatePlayerStamina: (newStamina: number) => void;
}

// Provider component that wraps your app and makes works context available
export const WorksProvider: React.FC<WorksProviderProps> = ({ 
  children, 
  characterPositionUpdater,
  characterStats,
  updatePlayerStamina
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [characterPosition, setCharacterPositionInternal] = useState({ x: 350, y: 611 }); // Default position
  const { currentCharacter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reference for position update function
  const pendingPositionUpdateRef = useRef<{ x: number, y: number } | null>(null);
  
  // Reference for animation frame
  const animationFrameRef = useRef<number | null>(null);
  
  // Referință pentru sincronizarea cu backend-ul
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Flag pentru a indica dacă este nevoie de sincronizare cu backend-ul
  const needsSyncRef = useRef<boolean>(false);
  
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

  // Sincronizează muncile cu backend-ul
  const syncWithBackend = useCallback(async () => {
    if (!currentCharacter?._id) return;
    
    try {
      // Obține muncile actualizate de la server
      const workData = await workService.getWorks(currentCharacter._id);
      
      // Adăugăm timestamp-ul pentru actualizare locală și marcăm prima muncă ca activă
      const now = Date.now();
      const enhancedWorkData = workData.map((job: Job, index: number) => ({
        ...job,
        lastLocalUpdate: now,
        isActive: index === 0 // Doar prima muncă este activă
      }));
      
      // Actualizăm starea locală cu datele de la server
      setJobs(enhancedWorkData);
      
      // Resetăm flag-ul de sincronizare
      needsSyncRef.current = false;
    } catch (err) {
      console.error('Error syncing with backend:', err);
    }
  }, [currentCharacter?._id]);

  // Actualizează local timpul rămas pentru munci
  const updateLocalJobTimes = useCallback(() => {
    const now = Date.now();
    
    setJobs(prevJobs => {
      // Dacă nu avem munci, nu facem nimic
      if (prevJobs.length === 0) return prevJobs;
      
      // Creăm o copie a muncilor pentru a le actualiza
      const updatedJobs = [...prevJobs];
      
      // Actualizăm doar prima muncă din coadă (cea activă)
      if (updatedJobs.length > 0) {
        const activeJob = updatedJobs[0];
        const lastUpdate = activeJob.lastLocalUpdate || now;
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        
        // Dacă nu a trecut niciun timp, returnăm joburile neschimbate
        if (elapsedSeconds <= 0) return prevJobs;
        
        // Actualizăm timpul în funcție de faza în care se află munca
        if (!activeJob.isInProgress) {
          // Faza de deplasare
          const newTravelTime = Math.max(0, activeJob.travelTime - elapsedSeconds);
          
          // Verificăm dacă deplasarea s-a terminat
          if (newTravelTime <= 0) {
            updatedJobs[0] = {
              ...activeJob,
              isInProgress: true,
              travelTime: 0,
              lastLocalUpdate: now,
              isActive: true
            };
          } else {
            updatedJobs[0] = {
              ...activeJob,
              travelTime: newTravelTime,
              lastLocalUpdate: now,
              isActive: true
            };
          }
        } else {
          // Faza de lucru
          const newRemainingTime = Math.max(0, activeJob.remainingTime - elapsedSeconds);
          
          updatedJobs[0] = {
            ...activeJob,
            remainingTime: newRemainingTime,
            lastLocalUpdate: now,
            isActive: true
          };
          
          // Dacă timpul a ajuns la 0, marcăm că avem nevoie de sincronizare cu backend-ul
          if (newRemainingTime === 0) {
            needsSyncRef.current = true;
            
            // Programăm sincronizarea
            if (syncTimeoutRef.current === null) {
              syncTimeoutRef.current = setTimeout(() => {
                syncWithBackend();
                syncTimeoutRef.current = null;
              }, 1000);
            }
          }
        }
      }
      
      return updatedJobs;
    });
    
    // Programăm următoarea actualizare
    animationFrameRef.current = requestAnimationFrame(updateLocalJobTimes);
  }, [syncWithBackend]);

  // Pornește actualizarea locală a timpului
  useEffect(() => {
    // Inițializăm timestamp-ul pentru actualizare locală și marcăm prima muncă ca activă
    setJobs(prevJobs => 
      prevJobs.map((job, index) => ({
        ...job,
        lastLocalUpdate: Date.now(),
        isActive: index === 0 // Doar prima muncă este activă
      }))
    );
    
    // Pornim bucla de actualizare
    animationFrameRef.current = requestAnimationFrame(updateLocalJobTimes);
    
    // Curățăm la demontare
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (syncTimeoutRef.current !== null) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [updateLocalJobTimes]);

  // Încarcă muncile din backend când se încarcă componenta
  useEffect(() => {
    const fetchWorks = async () => {
      if (!currentCharacter?._id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await syncWithBackend();
      } catch (err) {
        console.error('Error fetching works:', err);
        setError('Nu s-au putut încărca muncile. Încearcă din nou mai târziu.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorks();
    
    // Setăm un interval pentru a actualiza muncile periodic
    const interval = setInterval(() => {
      syncWithBackend();
    }, 10000); // La fiecare 10 secunde
    
    return () => clearInterval(interval);
  }, [currentCharacter?._id, syncWithBackend]);

  // Add a new job to the queue
  const addJob = useCallback(async (job: Job): Promise<boolean> => {
    if (!currentCharacter?._id) return false;
    
    try {
      // Check if we already have 3 jobs - we'll get this from the server directly
      // instead of relying on the local state which might be out of sync
      const currentWorks = await workService.getWorks(currentCharacter._id);
      if (currentWorks.length >= 3) {
        return false;
      }
      
      // Calculate travel time from the last job or character position
      const startPos = currentWorks.length > 0 ? 
        { x: currentWorks[currentWorks.length - 1].mobX, y: currentWorks[currentWorks.length - 1].mobY } : 
        characterPosition;
      
      const travelTime = calculateRealTravelTime(
        startPos.x, 
        startPos.y, 
        job.mobX, 
        job.mobY
      );
      
      // Calculate original job time based on type
      const originalJobTime = 
        job.type === '15s' ? 15 : 
        job.type === '10m' ? 600 : 
        3600;
      
      // Calculate end times
      const now = Date.now();
      const travelEndTime = now + (travelTime * 1000);
      const jobEndTime = travelEndTime + (originalJobTime * 1000);
      
      const workData = {
        type: job.type,
        remainingTime: originalJobTime,
        travelTime,
        isInProgress: false,
        mobName: job.mobName,
        mobImage: job.mobImage,
        mobX: job.mobX,
        mobY: job.mobY,
        mobType: job.mobType,
        mobLevel: job.mobLevel,
        mobHp: job.mobHp,
        mobAttack: job.mobAttack,
        mobExp: job.mobExp,
        mobYang: job.mobYang,
        staminaCost: job.staminaCost,
        originalTravelTime: travelTime,
        originalJobTime,
      };
      
      // Trimite munca la backend
      const newWork = await workService.createWork(currentCharacter._id, workData as Record<string, unknown>);
      
      // Actualizează starea locală
      setJobs(prev => {
        const newJobs = [...prev, {
          ...job,
          _id: newWork._id,
          travelTime,
          originalTravelTime: travelTime,
          originalJobTime,
          travelEndTime,
          jobEndTime,
          lastLocalUpdate: now,
          isActive: prev.length === 0 // Este activă doar dacă este prima muncă
        }];
        
        return newJobs;
      });
      
      // Reduce stamina
      if (job.staminaCost) {
        updatePlayerStamina(characterStats.stamina.current - job.staminaCost);
      }
      
      return true;
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Nu s-a putut adăuga munca. Încearcă din nou mai târziu.');
      return false;
    }
  }, [characterPosition, characterStats.stamina.current, currentCharacter?._id, updatePlayerStamina]);

  // Remove the first job in the queue
  const removeJob = useCallback(async () => {
    if (jobs.length === 0 || !currentCharacter?._id) return;
    
    try {
      const jobToRemove = jobs[0];
      
      // Save the stamina cost before removing the job
      const staminaCost = jobToRemove.staminaCost || 0;
      
      if (jobToRemove._id) {
        await workService.deleteWork(currentCharacter._id, jobToRemove._id);
      }
      
      // Actualizăm starea locală și marcăm următoarea muncă ca activă
      setJobs(prev => {
        if (prev.length <= 1) return [];
        
        const newJobs = prev.slice(1);
        return newJobs.map((job, index) => ({
          ...job,
          isActive: index === 0 // Doar prima muncă este activă
        }));
      });
      
      // Refund the stamina cost to the player
      if (staminaCost > 0) {
        const newStamina = Math.min(
          characterStats.stamina.max, 
          characterStats.stamina.current + staminaCost
        );
        updatePlayerStamina(newStamina);
      }
      
      // Sincronizăm cu backend-ul pentru a ne asigura că totul este actualizat
      setTimeout(() => {
        syncWithBackend();
      }, 500);
    } catch (err) {
      console.error('Error removing job:', err);
      setError('Nu s-a putut șterge munca. Încearcă din nou mai târziu.');
    }
  }, [jobs, currentCharacter?._id, syncWithBackend, characterStats.stamina, updatePlayerStamina]);

  // Remove a job by index
  const removeJobById = useCallback(async (index: number) => {
    if (index < 0 || index >= jobs.length || !currentCharacter?._id) return;
    
    try {
      const jobToRemove = jobs[index];
      
      // Save the stamina cost before removing the job
      const staminaCost = jobToRemove.staminaCost || 0;
      
      if (jobToRemove._id) {
        await workService.deleteWork(currentCharacter._id, jobToRemove._id);
      }
      
      // Actualizăm starea locală și marcăm prima muncă rămasă ca activă
      setJobs(prev => {
        const newJobs = prev.filter((_, i) => i !== index);
        return newJobs.map((job, i) => ({
          ...job,
          isActive: i === 0 // Doar prima muncă este activă
        }));
      });
      
      // Refund the stamina cost to the player
      if (staminaCost > 0) {
        const newStamina = Math.min(
          characterStats.stamina.max, 
          characterStats.stamina.current + staminaCost
        );
        updatePlayerStamina(newStamina);
      }
      
      // Sincronizăm cu backend-ul pentru a ne asigura că totul este actualizat
      setTimeout(() => {
        syncWithBackend();
      }, 500);
    } catch (err) {
      console.error('Error removing job by index:', err);
      setError('Nu s-a putut șterge munca. Încearcă din nou mai târziu.');
    }
  }, [jobs, currentCharacter?._id, syncWithBackend, characterStats.stamina, updatePlayerStamina]);

  const value = {
    jobs,
    addJob,
    removeJob,
    removeJobById,
    characterPosition,
    setCharacterPosition,
    characterStats,
    isLoading,
    error
  };

  return <WorksContext.Provider value={value}>{children}</WorksContext.Provider>;
};