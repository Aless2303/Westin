import { useState, useEffect } from 'react';
import { PlayerType } from '../../../types/player';
import { sortPlayersByRank } from '../utils/sorting';

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

// Define the character type from server response
interface CharacterResponse {
  _id: string;
  name: string;
  level: number;
  race: string;
  gender: string;
  x?: number;
  y?: number;
  hp?: { current: number; max: number };
  attack?: number;
  defense?: number;
  experience?: { current: number; percentage: number };
  duelsWon?: number;
  duelsLost?: number;
  motto?: string;
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

  // Funcție pentru a încărca datele leaderboard-ului din API
  const loadLeaderboardData = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/characters/leaderboard`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const charactersData = await response.json() as CharacterResponse[];
      
      // Transformăm datele de la server în formatul PlayerType
      const leaderboardPlayers: PlayerType[] = charactersData.map((character: CharacterResponse, index: number) => ({
        id: character._id,
        name: character.name,
        level: character.level,
        race: character.race,
        gender: character.gender,
        x: character.x || 0,
        y: character.y || 0,
        image: `/Races/${character.gender.toLowerCase()}/${character.race.toLowerCase()}.png`,
        hp: character.hp || { current: 100, max: 100 },
        attack: character.attack || 0,
        defense: character.defense || 0,
        experience: character.experience || { current: 0, percentage: 0 },
        rank: index + 1,
        duelsWon: character.duelsWon || 0,
        duelsLost: character.duelsLost || 0,
        motto: character.motto || ""
      }));
      
      // Sortăm jucătorii după nivel și experiență
      const sortedPlayers = sortPlayersByRank(leaderboardPlayers);
      
      // Actualizăm rangul după sortare
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));
      
      setPlayers(rankedPlayers);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
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
        if (!isRefreshing && isOpen) {
          loadLeaderboardData();
        }
      }, refreshInterval);

      // Cleanup la unmount
      return () => clearInterval(interval);
    }
  }, [refreshInterval, isOpen]);

  return {
    players,
    isLoading,
    isRefreshing,
    lastRefresh,
    handleManualRefresh
  };
}; 