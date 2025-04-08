import React, { useState } from 'react';
import Image from 'next/image';
import { InventoryPanel } from '../../features/inventory';
import { WorksPanel } from '../../features/works';
import { ReportsPanel } from '../../features/reports';
import { DuelsPanel } from '../../features/duels';
import { useReports } from '../../features/reports';

interface BottomPanelProps {
  playerRace: string;
  characterData?: {
    name: string;
    level: number;
    race: string;
    gender: string;
    hp: {
      current: number;
      max: number;
    };
    stamina: {
      current: number;
      max: number;
    };
    x: number;
    y: number;
    attack: number;
    defense: number;
  };
  updatePlayerHp?: (newHp: number) => void;
  updatePlayerStamina?: (newStamina: number) => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ 
  playerRace, 
  characterData,
  updatePlayerHp,
  updatePlayerStamina
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isWorksOpen, setIsWorksOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isDuelsOpen, setIsDuelsOpen] = useState(false);
  
  // Get unread reports count from context
  const { getUnreadCount } = useReports();

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const toggleInventory = () => {
    setIsInventoryOpen(!isInventoryOpen);
    // Închide alte panouri dacă sunt deschise
    if (!isInventoryOpen) {
      setIsWorksOpen(false);
      setIsReportsOpen(false);
      setIsDuelsOpen(false);
    }
  };

  const toggleWorks = () => {
    setIsWorksOpen(!isWorksOpen);
    // Închide alte panouri dacă sunt deschise
    if (!isWorksOpen) {
      setIsInventoryOpen(false);
      setIsReportsOpen(false);
      setIsDuelsOpen(false);
    }
  };

  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
    // Închide alte panouri dacă sunt deschise
    if (!isReportsOpen) {
      setIsInventoryOpen(false);
      setIsWorksOpen(false);
      setIsDuelsOpen(false);
    }
  };
  
  const toggleDuels = () => {
    setIsDuelsOpen(!isDuelsOpen);
    // Închide alte panouri dacă sunt deschise
    if (!isDuelsOpen) {
      setIsInventoryOpen(false);
      setIsWorksOpen(false);
      setIsReportsOpen(false);
    }
  };

  return (
    <>
      {/* Inventory Panel */}
      <InventoryPanel 
        isOpen={isInventoryOpen} 
        onClose={() => setIsInventoryOpen(false)}
        playerRace={playerRace}
      />
      
      {/* Works Panel - transmitem și handler-ul pentru butonul de bottom panel */}
      <WorksPanel 
        isOpen={isWorksOpen} 
        onClose={() => setIsWorksOpen(false)}
        isBottomPanelVisible={isPanelVisible}
        onToggleBottomPanel={togglePanel}
      />

      {/* Reports Panel */}
      <ReportsPanel
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />
      
      {/* Duels Panel */}
      {characterData && updatePlayerHp && updatePlayerStamina && (
        <DuelsPanel
          isOpen={isDuelsOpen}
          onClose={() => setIsDuelsOpen(false)}
          characterData={characterData}
          updatePlayerHp={updatePlayerHp}
          updatePlayerStamina={updatePlayerStamina}
        />
      )}

      {/* Bottom Panel UI */}
      {isPanelVisible ? (
        <div className="absolute bottom-4 right-4 z-40">
          <div className="w-auto relative">
            <button
              onClick={togglePanel}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors z-20"
              title="Ascunde panoul"
            >
              ×
            </button>

            <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg p-2">
              <div className="flex space-x-2">
                {/* Inventar Button */}
                <button
                  onClick={toggleInventory}
                  className={`w-12 h-12 rounded-md bg-metin-dark border ${isInventoryOpen ? 'border-metin-gold' : 'border-metin-gold/40'} flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold ${isInventoryOpen ? 'bg-metin-gold/20' : ''}`}
                  title="Inventar"
                >
                  <Image
                    src="/Icons/inventory.png"
                    alt="Inventar"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </button>

                {/* Duels Button */}
                <button
                  onClick={toggleDuels}
                  className={`w-12 h-12 rounded-md bg-metin-dark border ${isDuelsOpen ? 'border-metin-gold' : 'border-metin-gold/40'} flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold ${isDuelsOpen ? 'bg-metin-gold/20' : ''}`}
                  title="Duele"
                >
                  <Image
                    src="/Icons/duels.png"
                    alt="Duels"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </button>

                {/* Rapoarte Button */}
                <button
                  onClick={toggleReports}
                  className={`w-12 h-12 rounded-md bg-metin-dark border ${isReportsOpen ? 'border-metin-gold' : 'border-metin-gold/40'} flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold ${isReportsOpen ? 'bg-metin-gold/20' : ''} relative`}
                  title="Rapoarte"
                >
                  <Image
                    src="/Icons/telegrame.png"
                    alt="Rapoarte"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  
                  {/* Unread reports indicator */}
                  {getUnreadCount() > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-metin-red flex items-center justify-center text-white text-xs">
                      {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
                    </div>
                  )}
                </button>

                {/* Munci Button */}
                <button
                  onClick={toggleWorks}
                  className={`w-12 h-12 rounded-md bg-metin-dark border ${isWorksOpen ? 'border-metin-gold' : 'border-metin-gold/40'} flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold ${isWorksOpen ? 'bg-metin-gold/20' : ''}`}
                  title="Munci"
                >
                  <Image
                    src="/Icons/jobs.png"
                    alt="Munci"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Afișăm butonul doar dacă panoul de munci nu este deschis
        // Dacă panoul de munci este deschis, butonul este integrat direct în acesta
        !isWorksOpen && (
          <button
            onClick={togglePanel}
            className="fixed bottom-4 right-4 z-50 w-8 h-8 rounded-full bg-metin-dark/95 border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors shadow-lg"
            title="Afișează panoul"
          >
            <span className="text-xl">⚔</span>
          </button>
        )
      )}
    </>
  );
};

export default BottomPanel;