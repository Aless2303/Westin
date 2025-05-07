import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useWorks, Job } from '../context/WorksContext';

interface WorksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isBottomPanelVisible: boolean;
  onToggleBottomPanel: () => void;
}

interface JobProgress {
  // Original values when progress started
  originalTravelTime: number;
  originalJobTime: number;
  // Current progress (0-100)
  progressPercent: number;
  // Last update timestamp
  lastUpdate: number;
  // Job identification for tracking changes
  jobId: string; // Unique identifier for the job
}

const WorksPanel: React.FC<WorksPanelProps> = ({ 
  isOpen, 
  onClose, 
  isBottomPanelVisible,
  onToggleBottomPanel
}) => {
  const { jobs, removeJobById } = useWorks();
  const [jobProgresses, setJobProgresses] = useState<JobProgress[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  // Format time display (e.g., convert 65 seconds to "01:05")
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Helper to create a unique ID for each job
  const createJobId = (job: Job, index: number): string => {
    return job._id || `${job.mobName}_${job.mobX}_${job.mobY}_${job.type}_${index}`;
  };
  
  // Initialize progress data when jobs change
  useEffect(() => {
    const now = Date.now();
    
    // Create new progress entries
    const newProgresses = jobs.map((job, index) => {
      const currentJobId = createJobId(job, index);
      
      // Try to find an existing progress with the same job ID
      const existingProgressIndex = jobProgresses.findIndex(
        progress => progress.jobId === currentJobId
      );
      
      // If job exists and has the same details, preserve its progress
      if (existingProgressIndex >= 0) {
        return jobProgresses[existingProgressIndex];
      }
      
      // Otherwise create new progress data with progress at 0
      return {
        originalTravelTime: job.originalTravelTime || Math.max(1, job.travelTime), // Use stored original or current
        originalJobTime: job.originalJobTime || (job.type === '15s' ? 15 : job.type === '10m' ? 600 : 3600),
        progressPercent: 0, // Always start at 0 for new jobs
        lastUpdate: now,
        jobId: currentJobId
      };
    });
    
    setJobProgresses(newProgresses);
  }, [jobs]); // Re-initialize whenever jobs change
  
  // Update progress with requestAnimationFrame for ultra-smooth animation
  useEffect(() => {
    if (jobs.length === 0) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }
    
    const updateProgress = () => {
      const now = Date.now();
      
      setJobProgresses(prev => {
        const newProgresses = [...prev];
        
        let needsUpdate = false;
        jobs.forEach((job, index) => {
          if (index >= newProgresses.length) return;
          
          const timeSinceLastUpdate = (now - newProgresses[index].lastUpdate) / 1000; // in seconds
          
          // Calculate current exact percentage based on real job data
          let currentRealPercent;
          if (!job.isInProgress) {
            // For travel progress
            const totalTime = newProgresses[index].originalTravelTime;
            const remainingTime = job.travelTime;
            const elapsedTime = totalTime - remainingTime;
            currentRealPercent = (elapsedTime / totalTime) * 100;
            
            // Ensure progress is capped at 100%
            currentRealPercent = Math.min(100, Math.max(0, currentRealPercent));
          } else {
            // For job progress
            const totalTime = newProgresses[index].originalJobTime;
            const remainingTime = job.remainingTime;
            const elapsedTime = totalTime - remainingTime;
            currentRealPercent = (elapsedTime / totalTime) * 100;
            
            // Ensure progress is capped at 100%
            currentRealPercent = Math.min(100, Math.max(0, currentRealPercent));
          }
          
          // Apply smooth interpolation (move at most 10% of the distance per update)
          // Make the speed proportional to the time since last update for smooth animation
          const distance = currentRealPercent - newProgresses[index].progressPercent;
          if (Math.abs(distance) > 0.1) {
            needsUpdate = true;
            // Use a consistent speed based on time delta
            const step = distance * Math.min(1, timeSinceLastUpdate * 5);
            newProgresses[index] = {
              ...newProgresses[index],
              progressPercent: newProgresses[index].progressPercent + step,
              lastUpdate: now
            };
          } else if (newProgresses[index].progressPercent !== currentRealPercent) {
            needsUpdate = true;
            newProgresses[index] = {
              ...newProgresses[index],
              progressPercent: currentRealPercent,
              lastUpdate: now
            };
          }
        });
        
        return needsUpdate ? newProgresses : prev;
      });
      
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateProgress);
    
    // Clean up animation frame on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [jobs]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Helper for console debugging if needed
  const debugClass = (index: number): string => {
    if (index >= jobProgresses.length) return '';
    const prog = jobProgresses[index].progressPercent;
    return `debug-${Math.round(prog)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed right-4 z-30 bg-metin-dark/95 border border-metin-gold/40 rounded-lg shadow-lg ${
        isBottomPanelVisible ? 'bottom-24' : 'bottom-4'
      }`}
      style={{ width: '230px' }}
    >
      <div className="flex justify-between items-center p-2 border-b border-metin-gold/30">
        <h3 className="text-metin-gold text-sm font-medium">Munci</h3>
        <div className="flex items-center space-x-2">
          {/* Butonul pentru afișarea bottom panel-ului integrat în header */}
          {!isBottomPanelVisible && (
            <button
              onClick={onToggleBottomPanel}
              className="w-6 h-6 rounded-full bg-metin-gold/20 border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/30 transition-colors"
              title="Afișează panoul"
            >
              <span className="text-sm">⚔</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-metin-light/70 hover:text-metin-gold text-xl transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="p-2">
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <div 
                key={createJobId(job, index)} 
                className={`bg-black/60 border border-metin-gold/30 rounded p-2 relative ${debugClass(index)}`}
              >
                {/* Button to cancel the job */}
                <button
                  onClick={() => removeJobById(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-red/30 transition-colors z-10"
                  title="Anulează munca"
                >
                  ×
                </button>

                <div className="flex items-center mb-2">
                  {/* Job image */}
                  {job.mobImage && (
                    <div className="relative w-10 h-10 bg-black/60 border border-metin-gold/30 rounded overflow-hidden mr-2 flex-shrink-0">
                      <Image 
                        src={job.mobImage}
                        alt={job.mobName || "Mob"}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                        style={{ objectPosition: 'center' }}
                        quality={100}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {/* Job name and phase indicator */}
                    <div className="flex justify-between items-center">
                      <div className="text-metin-light text-xs flex items-center">
                        <span className="text-metin-gold mr-1">⚔</span>
                        <span>{job.type}</span>
                      </div>
                      
                      {/* Time display with improved visibility */}
                      <div className={`text-xs font-medium ${job.isInProgress ? 'text-green-400' : 'text-yellow-300'}`}>
                        {job.isInProgress 
                          ? formatTime(job.remainingTime) 
                          : formatTime(job.travelTime)}
                      </div>
                    </div>
                    
                    {/* Mob name */}
                    {job.mobName && (
                      <div className="text-metin-light/70 text-xs truncate mt-0.5">
                        {job.mobName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status bar and phase indicator with improved colors and animation */}
                <div className="w-full bg-black/50 h-5 rounded-sm overflow-hidden relative mt-1">
                  {job.isInProgress ? (
                    // Progress bar for job - using smoother color and transition
                    <>
                      <div 
                        className="h-full bg-gradient-to-r from-green-600/70 to-green-500 absolute left-0 top-0"
                        style={{ 
                          width: `${index < jobProgresses.length ? jobProgresses[index].progressPercent : 0}%`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">În progres</span>
                      </div>
                    </>
                  ) : (
                    // Progress bar for travel - improved color and calculation
                    <>
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500/70 to-yellow-400 absolute left-0 top-0"
                        style={{ 
                          width: `${index < jobProgresses.length ? jobProgresses[index].progressPercent : 0}%`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">Deplasare</span>
                      </div>
                    </>
                  )}
                </div>
        
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-metin-light/50 text-xs">
            Nu ai munci active
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksPanel;