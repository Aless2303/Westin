import { useState, useEffect } from 'react';

export interface Job {
  type: '15s' | '10m' | '1h';
  remainingTime: number; // Time in seconds
  mobName?: string; // Added mob name to display in the jobs panel
}



export const useWorks = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  // Add a new job (limit to 3)
  const addJob = (job: Job) => {
    if (jobs.length < 3) {
      setJobs((prev) => [...prev, job]);
      return true; // Job added successfully
    } else {
      console.log('Maximum 3 jobs allowed!');
      return false; // Job not added
    }
  };

  // Remove the completed job and shift the queue
  const removeJob = () => {
    setJobs((prev) => prev.slice(1));
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (jobs.length > 0 && jobs[0].remainingTime > 0) {
      timer = setInterval(() => {
        setJobs((prev) => {
          const updatedJobs = [...prev];
          updatedJobs[0] = { ...updatedJobs[0], remainingTime: updatedJobs[0].remainingTime - 1 };
          if (updatedJobs[0].remainingTime <= 0) {
            // Here you could add a notification or reward logic when a job completes
            console.log(`Job completed: ${updatedJobs[0].mobName || 'Unknown'}`);
            // Remove the completed job
            return updatedJobs.slice(1);
          }
          return updatedJobs;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [jobs]);

  return { jobs, addJob, removeJob };
};