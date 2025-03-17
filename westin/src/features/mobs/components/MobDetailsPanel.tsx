import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MobType } from '../types';

interface MobDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMob: MobType | null;
}

const MobDetailsPanel: React.FC<MobDetailsPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedMob 
}) => {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  if (!isOpen || !selectedMob) return null;

  const getDrops = (mobType: string) => {
    if (mobType === 'boss') {
      return [
        { name: `Yang (${selectedMob.yang})`, chance: "100%" },
        { name: "Piatră de spirit", chance: "75%" },
        { name: "Armă legendară", chance: mobType === 'boss' ? "5%" : "1%" },
        { name: "Material rar", chance: "25%" },
      ];
    } else {
      return [
        { name: `Yang (${selectedMob.yang})`, chance: "100%" },
        { name: "Cristale", chance: "50%" },
        { name: "Material comun", chance: "30%" }
      ];
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const panelTitle = selectedMob.type === 'boss' ? 'Boss' : 'Metin';
  const panelColorClass = selectedMob.type === 'boss' ? 'border-metin-red/40' : 'border-metin-gold/40';
  const headerColorClass = selectedMob.type === 'boss' ? 'from-metin-red/70 to-metin-dark' : 'from-metin-brown to-metin-dark';

  const getLevelRating = (mobLevel: number) => {
    if (mobLevel <= 20) return "Ușor";
    if (mobLevel <= 30) return "Moderat";
    if (mobLevel <= 40) return "Dificil";
    return "Foarte Dificil";
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ro-RO');
  };

  return (
    <div 
      ref={panelRef}
      className={`fixed z-50 bg-metin-dark/95 border-2 ${panelColorClass} rounded-lg shadow-lg`}
      style={{ 
        width: '450px', 
        height: '420px',
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <div 
        className={`header bg-gradient-to-r ${headerColorClass} border-b ${panelColorClass} px-4 py-2 flex justify-between items-center cursor-grab`}
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-metin-gold font-bold text-lg">{panelTitle}: {selectedMob.name}</h2>
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
      
      <div className="p-4 flex flex-col h-[calc(100%-44px)]">
        <div className="flex mb-4">
          {/* Updated Image Container */}
          <div className="relative w-24 h-24 bg-black/60 border border-metin-gold/30 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
            <Image 
                src={selectedMob.image}
                alt={selectedMob.name}
                width={96}
                height={96}
                className="object-contain w-full h-full"
                style={{ objectPosition: 'center' }}
                quality={100}
            />
            </div>
          
            <div className="flex-1">
            <h3 className="text-metin-gold text-lg mb-2">{selectedMob.name}</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="text-metin-light/80 text-sm">
                Nivel: <span className="text-metin-gold">{selectedMob.level}</span>
                </div>
                <div className="text-metin-light/80 text-sm">
                Tip: <span className="text-metin-gold capitalize">{selectedMob.type}</span>
                </div>
                {/* Make Dificultate span across both columns */}
                <div className="text-metin-light/80 text-sm col-span-2">
                Dificultate: <span className="text-metin-gold">{getLevelRating(selectedMob.level)}</span>
                </div>
            </div>
            </div>
        </div>

        <div className="bg-black/30 p-3 rounded-lg mb-4">
          <h4 className="text-metin-gold text-sm mb-2">Statistici:</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">HP:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.hp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Atac:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.attack)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Experiență:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.exp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Yang:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.yang)}</span>
            </div>
          </div>
        </div>


        
        <div className="mt-4 flex justify-between space-x-2">
          <button className="flex-1 py-2 bg-metin-brown/40 hover:bg-metin-brown/60 text-metin-light border border-metin-gold/30 rounded-md transition-colors">
            Atacă
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobDetailsPanel;