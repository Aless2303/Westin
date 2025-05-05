import React, { useState, useCallback } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatLastRefreshTime } from '../utils/formatting';
import LeaderboardTable from './LeaderboardTable';
import { PlayerType } from '../../../types/player';
import { ProfileType } from '../../../types/profile';
import { ProfileWindow } from '../../../features/profile';
import { EquipmentSlot } from '../../../types/inventory';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshInterval?: number;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ 
  isOpen, 
  onClose, 
  refreshInterval = 30000
}) => {
  const {
    players,
    isLoading,
    isRefreshing,
    lastRefresh,
    handleManualRefresh
  } = useLeaderboard({ refreshInterval, isOpen });

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [playerEquipment, setPlayerEquipment] = useState<EquipmentSlot[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchPlayerEquipment = useCallback(async (characterId: string) => {
    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No authentication token found");
        // Use empty equipment since we can't fetch without token
        setPlayerEquipment(createEmptyEquipment());
        return;
      }

      const response = await fetch(`http://localhost:5000/api/inventory/${characterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching inventory: ${response.status}`);
        setPlayerEquipment(createEmptyEquipment());
        return;
      }
      
      const inventoryData = await response.json();
      
      // Create equipment slots from fetched data
      const equipment = createEmptyEquipment();
      
      // Map equipped items to equipment slots
      if (inventoryData.equippedItems) {
        const slotTypes = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
        
        slotTypes.forEach(slotType => {
          const itemData = inventoryData.equippedItems[slotType];
          if (itemData) {
            const slot = equipment.find(slot => slot.id === slotType);
            if (slot) {
              slot.item = {
                id: itemData._id,
                name: itemData.name,
                imagePath: itemData.image || '', 
                type: itemData.type,
                stackable: itemData.tradeable || false,
                stats: itemData.stats || {},
                description: itemData.description || '',
                requiredLevel: itemData.requiredLevel || 1
              };
            }
          }
        });
      }
      
      setPlayerEquipment(equipment);
    } catch (error) {
      console.error("Error fetching player equipment:", error);
      setPlayerEquipment(createEmptyEquipment());
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const createEmptyEquipment = (): EquipmentSlot[] => {
    return [
      { id: 'weapon', name: 'Armă', item: null, gridArea: 'weapon', size: 'large' },
      { id: 'helmet', name: 'Coif', item: null, gridArea: 'helmet', size: 'medium' },
      { id: 'armor', name: 'Armură', item: null, gridArea: 'armor', size: 'large' },
      { id: 'shield', name: 'Scut', item: null, gridArea: 'shield', size: 'medium' },
      { id: 'earrings', name: 'Cercei', item: null, gridArea: 'earrings', size: 'small' },
      { id: 'bracelet', name: 'Brățară', item: null, gridArea: 'bracelet', size: 'small' },
      { id: 'necklace', name: 'Colier', item: null, gridArea: 'necklace', size: 'small' },
      { id: 'boots', name: 'Papuci', item: null, gridArea: 'boots', size: 'medium' },
    ];
  };

  const handlePlayerSelect = async (player: PlayerType) => {
    setSelectedPlayer(player);
    await fetchPlayerEquipment(player.id);
  };

  const playerProfile: ProfileType | null = selectedPlayer ? {
    _id: selectedPlayer.id,
    name: selectedPlayer.name,
    level: selectedPlayer.level,
    race: selectedPlayer.race,
    gender: selectedPlayer.gender,
    background: "/Backgrounds/western2.jpg",
    hp: selectedPlayer.hp,
    stamina: { current: 100, max: 100 },
    experience: selectedPlayer.experience,
    duelsWon: selectedPlayer.duelsWon || 0,
    duelsLost: selectedPlayer.duelsLost || 0,
    motto: selectedPlayer.motto || "Acest jucător nu are un motto setat."
  } : null;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="w-[95vw] sm:w-full sm:max-w-4xl bg-metin-dark/95 border-2 border-metin-gold/50 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="relative bg-gradient-to-r from-metin-brown to-metin-dark/90 px-3 sm:px-6 py-2 sm:py-4 border-b border-metin-gold/30">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-bold text-metin-gold">Leaderboard</h2>
              <button
                onClick={onClose}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-metin-light/70 text-[10px] sm:text-sm">Cei mai puternici jucători din Westin</p>
          </div>

          <div className="px-2 sm:px-4 py-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-track-metin-dark scrollbar-thumb-metin-gold/30 relative">
            {isLoading && players.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin"></div>
              </div>
            ) : (
              <LeaderboardTable 
                players={players} 
                isRefreshing={isRefreshing} 
                onPlayerSelect={handlePlayerSelect}
              />
            )}
            
            {isRefreshing && players.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="border-t border-metin-gold/30 bg-gradient-to-r from-metin-dark/80 to-metin-brown/80 px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="text-metin-light/70 text-[10px] sm:text-sm">
              <span>Ultima actualizare: {formatLastRefreshTime(lastRefresh)}</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleManualRefresh}
                className={`flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded text-[10px] sm:text-sm transition-colors border ${
                  isRefreshing 
                    ? 'bg-metin-gold/10 border-metin-gold/30 text-metin-gold/50 cursor-not-allowed' 
                    : 'bg-metin-gold/20 hover:bg-metin-gold/30 border-metin-gold/40 text-metin-gold hover:text-metin-light'
                }`}
                disabled={isRefreshing}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Se actualizează...' : 'Actualizează acum'}
              </button>
              <span className="text-metin-light/60 text-[10px] sm:text-sm hidden sm:inline-block">Auto-refresh: {refreshInterval / 1000}s</span>
            </div>
          </div>
        </div>
      </div>

      {isLoadingProfile && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="text-metin-gold flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin mb-4"></div>
            <div>Se încarcă profilul jucătorului...</div>
          </div>
        </div>
      )}

      {selectedPlayer && playerProfile && !isLoadingProfile && (
        <ProfileWindow
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          profile={playerProfile}
          equipment={playerEquipment}
          isEditable={false}
        />
      )}
    </>
  );
};

export default LeaderboardModal;