import { useState, useEffect } from 'react';
import { PlayerType } from '../../../types/player';
import { sortPlayersByRank, combinePlayersAndCharacter } from '../utils/sorting';
import { mockPlayers } from '../../../data/mock/players';
import mockCharacter from '../../../data/mock/character';

interface UseLeaderboardOptions {
  refreshInterval?: number;
  isOpen?: boolean;
}

interface UseLeaderboardResult {
  players: PlayerType[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefresh: Date;
  handleManualRefresh: () => void;
}

/**
 * Hook pentru a gestiona datele și funcționalitățile leaderboard-ului
 */
export const useLeaderboard = ({ 
  refreshInterval = 30000, 
  isOpen = true 
}: UseLeaderboardOptions = {}): UseLeaderboardResult => {
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Funcție pentru a încărca datele leaderboard-ului
  const loadLeaderboardData = () => {
    setIsLoading(true);
    setIsRefreshing(true);
    
    // Simulăm un delay de încărcare de 500ms pentru a arăta animația de loading
    setTimeout(() => {
      // Combinăm datele din character.ts și players.ts
      const allPlayers = combinePlayersAndCharacter(mockPlayers, mockCharacter);
      
      // Sortăm jucătorii după nivel și experiență
      const sortedPlayers = sortPlayersByRank(allPlayers);
      
      setPlayers(sortedPlayers);
      setIsLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }, 500);
  };

  // Funcție pentru a reîmprospăta manual datele
  const handleManualRefresh = () => {
    if (!isRefreshing) {
      loadLeaderboardData();
    }
  };

  // Efect pentru a încărca și actualiza datele
  useEffect(() => {
    if (isOpen) {
      // Încarcă datele inițiale
      loadLeaderboardData();

      // Configurează refresh-ul periodic
      const interval = setInterval(() => {
        if (!isRefreshing) {
          loadLeaderboardData();
        }
      }, refreshInterval);

      // Cleanup la unmount
      return () => clearInterval(interval);
    }
  }, [refreshInterval, isOpen, isRefreshing]);

  return {
    players,
    isLoading,
    isRefreshing,
    lastRefresh,
    handleManualRefresh
  };
}; 