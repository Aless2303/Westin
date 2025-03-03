import React, { useState } from 'react';
import Image from 'next/image';
import { InventoryPanel } from '../../features/inventory';

interface BottomPanelProps {
  playerRace: string;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ playerRace }) => {
  // State to control the visibility of the panel
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  
  // State pentru a controla vizibilitatea panoului de inventar
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Toggle function to show/hide the panel
  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };
  
  // Deschide/închide panoul de inventar
  const toggleInventory = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  return (
    <>
      {/* Panoul de inventar */}
      <InventoryPanel 
        isOpen={isInventoryOpen} 
        onClose={() => setIsInventoryOpen(false)}
        playerRace={playerRace}
      />
      
      <div className="absolute bottom-4 right-4 z-50">
        {isPanelVisible ? (
          // Visible panel with hide button
          <div className="w-auto relative">
            {/* Button to hide the panel */}
            <button
              onClick={togglePanel}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors z-20"
              title="Ascunde panoul"
            >
              ×
            </button>

            <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg p-2">
              {/* Panel frame with buttons */}
              <div className="flex space-x-2">
                {/* Inventar (Backpack) Button */}
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

                {/* Duels (Crossed Swords/Pistols) Button */}
                <button
                  className="w-12 h-12 rounded-md bg-metin-dark border border-metin-gold/40 flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold"
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

                {/* Rapoarte (Telegram/Letter) Button */}
                <button
                  className="w-12 h-12 rounded-md bg-metin-dark border border-metin-gold/40 flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold"
                  title="Rapoarte"
                >
                  <Image
                    src="/Icons/telegrame.png"
                    alt="Rapoarte"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </button>

                {/* Munci (Shovel) Button */}
                <button
                  className="w-12 h-12 rounded-md bg-metin-dark border border-metin-gold/40 flex items-center justify-center hover:bg-metin-gold/20 transition-colors text-metin-gold"
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
        ) : (
          // Discreet button to show the panel when hidden
          <button
            onClick={togglePanel}
            className="w-8 h-8 rounded-full bg-metin-dark/95 border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors shadow-lg"
            title="Afișează panoul"
          >
            <span className="text-xl">⚔</span> {/* Using a sword icon as a discreet toggle */}
          </button>
        )}
      </div>
    </>
  );
};

export default BottomPanel;