import React from 'react';
import { useTown } from './TownContext';

interface TownButtonProps {
  mapWidth: number;
  mapHeight: number;
  onOpenTown?: () => void;
}

const TownButton: React.FC<TownButtonProps> = ({ mapWidth, mapHeight, onOpenTown }) => {
  const { setIsTownOpen } = useTown();
  
  // Coordonatele specificate: 1420x1060
  const townX = 1420;
  const townY = 1060;
  
  const handleTownClick = () => {
    setIsTownOpen(true);
    // Notifică părintele că orașul a fost deschis (pentru a închide alte panouri)
    if (onOpenTown) {
      onOpenTown();
    }
  };

  return (
    <button
      onClick={handleTownClick}
      className="absolute rounded-full transition-all hover:bg-metin-gold/20"
      style={{
        width: '80px',
        height: '80px',
        left: `${(townX / mapWidth) * 100}%`,
        top: `${(townY / mapHeight) * 100}%`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        pointerEvents: 'auto',
        zIndex: 50, // Măresc z-index-ul pentru a avea prioritate față de mob-uri care au zIndex: 20
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-xs text-metin-gold font-bold">
        Orașul Westin 🏙️
      </span>
    </button>
  );
};

export default TownButton; 