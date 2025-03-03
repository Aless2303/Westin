import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import CharacterEquipment from './CharacterEquipment';
import Backpack from './Backpack';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playerRace: string;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose, playerRace }) => {
  // Starea pentru poziția ferestrei (inițial la x: 100px, y: 100px)
  const [position, setPosition] = useState({ x: 100, y: 100 });
  // Starea pentru a verifica dacă fereastra este în curs de mutare
  const [isDragging, setIsDragging] = useState(false);
  // Poziția inițială a mouse-ului relativ la fereastră
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Referință la elementul ferestrei
  const panelRef = useRef<HTMLDivElement>(null);

  // Începe mutarea ferestrei când apeși pe titlu
  const handleMouseDown = (e: React.MouseEvent) => {
    // Împiedică evenimentul să se propage spre elementele de dedesubt
    e.stopPropagation();
    
    // Verificăm dacă click-ul este pe header (titlu)
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // Actualizează poziția ferestrei în timp ce tragi
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  // Oprește mutarea când eliberezi mouse-ul
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Adaugă și elimină evenimentele globale pentru mutare și oprire
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Dacă fereastra nu este deschisă, nu returnăm nimic
  if (!isOpen) return null;

  // Oprește propagarea click-ului către elementele de sub inventar
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg"
      style={{ 
        width: '750px', 
        height: '460px',
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {/* Header-ul cu titlul și butonul de închidere */}
      <div 
        className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-4 py-2 flex justify-between items-center cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-metin-gold font-bold text-lg">Inventar</h2>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-metin-light/70 hover:text-metin-gold text-xl transition-colors"
        >
          ×
        </button>
      </div>
      
      {/* Conținutul ferestrei */}
      <div className="p-4 flex h-[calc(100%-44px)]">
        {/* Partea stângă: Echipament */}
        <div className="w-1/2 pr-2">
          <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-3">
            Echipament
          </h3>
          <CharacterEquipment playerRace={playerRace} />
        </div>
        
        {/* Partea dreaptă: Ghiozdan */}
        <div className="w-1/2 pl-2 border-l border-metin-gold/30">
          <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-3">
            Ghiozdan
          </h3>
          <Backpack />
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;