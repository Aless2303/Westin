import React, { createContext, useContext, ReactNode } from 'react';
import { PlayerType } from '../../../types/player';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface LeaderboardContextType {
  players: PlayerType[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefresh: Date;
  handleManualRefresh: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

interface LeaderboardProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

/**
 * Provider pentru contextul Leaderboard
 */
export const LeaderboardProvider: React.FC<LeaderboardProviderProps> = ({ 
  children, 
  refreshInterval = 30000 
}) => {
  const leaderboardData = useLeaderboard({ refreshInterval, isOpen: true });

  return (
    <LeaderboardContext.Provider value={leaderboardData}>
      {children}
    </LeaderboardContext.Provider>
  );
};

/**
 * Hook pentru a accesa contextul Leaderboard
 */
export const useLeaderboardContext = (): LeaderboardContextType => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboardContext must be used within a LeaderboardProvider');
  }
  return context;
}; 