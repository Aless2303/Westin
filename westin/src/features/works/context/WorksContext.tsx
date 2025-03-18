import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';

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

interface WorksProviderProps {
  children: ReactNode;
  characterPositionUpdater?: (x: number, y: number) => void;
}

// Provider component that wraps your app and makes works context available
export const WorksProvider: React.FC<WorksProviderProps> = ({ 
  children, 
  characterPositionUpdater
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [characterPosition, setCharacterPositionInternal] = useState({ x: 350, y: 611 }); // Default position
  
  // Reference for animation frame and position update function
  const animationFrameRef = useRef<number | null>(null);
  const pendingPositionUpdateRef = useRef<{ x: number, y: number } | null>(null);
  
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