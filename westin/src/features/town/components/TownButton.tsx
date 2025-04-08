import React from 'react';
import { useTown } from './TownContext';

interface TownButtonProps {
  mapWidth: number;
  mapHeight: number;
  onOpenTown?: () => void;
}

const TownButton: React.FC<TownButtonProps> = ({ mapWidth, mapHeight, onOpenTown }) => {
  const { setIsTownOpen } = useTown();

  const townX = 1420;
  const townY = 1060;

  const handleTownClick = () => {
    setIsTownOpen(true);
    if (onOpenTown) {
      onOpenTown();
    }
  };

  return (
    <button
      onClick={handleTownClick}
      className="absolute rounded-full transition-all hover:bg-metin-gold/20"
      style={{
        width: '50px',
        height: '50px',
        left: `${(townX / mapWidth) * 100}%`,
        top: `${(townY / mapHeight) * 100}%`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        pointerEvents: 'auto',
        zIndex: 50,
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-xs text-metin-gold font-bold">
        Westin 🏙️
      </span>
    </button>
  );
};

export default TownButton;