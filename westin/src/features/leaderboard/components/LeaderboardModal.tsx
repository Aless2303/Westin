import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatLastRefreshTime } from '../utils/formatting';
import LeaderboardTable from './LeaderboardTable';
import { PlayerType } from '../../../types/player';
import { ProfileType } from '../../../types/profile';
import { ProfileWindow } from '../../../features/profile';
import { generateEquipment } from '../../../data/mock/inventory';

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

  // Funcție pentru a gestiona selectarea unui jucător
  const handlePlayerSelect = (player: PlayerType) => {
    setSelectedPlayer(player);
  };

  // Generăm profilul și echipamentul pentru jucătorul selectat
  const playerProfile: ProfileType | null = selectedPlayer ? {
    name: selectedPlayer.name,
    level: selectedPlayer.level,
    race: selectedPlayer.race,
    gender: selectedPlayer.gender,
    background: "/Backgrounds/western2.jpg",
    image: selectedPlayer.image,
    duelsWon: selectedPlayer.duelsWon || 0,
    duelsLost: selectedPlayer.duelsLost || 0,
    motto: selectedPlayer.motto || "Acest jucător nu are un motto setat.",
    experience: selectedPlayer.experience
  } : null;

  const playerEquipment = selectedPlayer ? generateEquipment(selectedPlayer.race, selectedPlayer.level) : [];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="w-full max-w-4xl bg-metin-dark/95 border-2 border-metin-gold/50 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-metin-brown to-metin-dark/90 px-6 py-4 border-b border-metin-gold/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-metin-gold">Leaderboard</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-metin-light/70 text-sm">Cei mai puternici jucători din Westin</p>
          </div>

          {/* Conținut tabel */}
          <div className="px-4 py-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-track-metin-dark scrollbar-thumb-metin-gold/30 relative">
            {isLoading && players.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin"></div>
              </div>
            ) : (
              <LeaderboardTable 
                players={players} 
                isRefreshing={isRefreshing} 
                onPlayerSelect={handlePlayerSelect}
              />
            )}
            
            {/* Overlay de încărcare dacă facem un refresh manual */}
            {isRefreshing && players.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-10 h-10 border-3 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-metin-gold/30 bg-gradient-to-r from-metin-dark/80 to-metin-brown/80 px-6 py-3 flex items-center justify-between">
            <div className="text-metin-light/70 text-sm">
              <span>Ultima actualizare: {formatLastRefreshTime(lastRefresh)}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleManualRefresh}
                className={`flex items-center px-4 py-2 rounded text-sm transition-colors border ${
                  isRefreshing 
                    ? 'bg-metin-gold/10 border-metin-gold/30 text-metin-gold/50 cursor-not-allowed' 
                    : 'bg-metin-gold/20 hover:bg-metin-gold/30 border-metin-gold/40 text-metin-gold hover:text-metin-light'
                }`}
                disabled={isRefreshing}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Se actualizează...' : 'Actualizează acum'}
              </button>
              <span className="text-metin-light/60 text-sm hidden sm:inline-block">Auto-refresh: {refreshInterval / 1000}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Window pentru jucătorul selectat */}
      {selectedPlayer && playerProfile && (
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