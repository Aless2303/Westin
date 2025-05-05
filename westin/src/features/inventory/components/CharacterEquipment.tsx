import React, { useState, useRef } from 'react';
import Image from 'next/image';

// Interface for inventory items
interface InventoryItem {
  id: string;
  name: string;
  imagePath: string;
  type: string;
  stackable: boolean;
  quantity?: number;
  stats?: {
    [key: string]: number;
  };
  description: string;
  requiredLevel: number;
}

// Interface for equipment slots
interface EquipmentSlot {
  id: string;
  name: string;
  item: InventoryItem | null;
  gridArea: string;
  size: 'small' | 'medium' | 'large';
}

interface CharacterEquipmentProps {
  playerRace: string;
  equipmentSlots: EquipmentSlot[];
  onUnequip: (slotId: string) => void;
  isBase64Image: (str: string) => boolean;
  getImageUrl: (src: string) => string;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({
  equipmentSlots,
  onUnequip,
  isBase64Image,
  getImageUrl,
}) => {
  const gridTemplateAreas = `
    "weapon helmet . ."
    "weapon armor shield earrings"
    "weapon armor bracelet necklace"
    ". boots . ."
  `;

  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // For double-tap detection on touch devices
  const lastTapTimeRef = useRef<{ [key: string]: number }>({});
  const doubleTapDelay = 300; // milliseconds

  const handleMouseEnter = (item: InventoryItem, e: React.MouseEvent) => {
    setTooltipItem(item);
    const x = e.clientX + 10;
    const y = e.clientY + 10;
    const tooltipWidth = window.innerWidth < 640 ? 192 : 192; // w-48 = 192px
    const tooltipHeight = 150; // Aproximare
    const adjustedX = x + tooltipWidth > window.innerWidth ? x - tooltipWidth - 20 : x;
    const adjustedY = y + tooltipHeight > window.innerHeight ? y - tooltipHeight - 20 : y;
    setTooltipPosition({ x: adjustedX, y: adjustedY });
  };

  const handleMouseLeave = () => {
    setTooltipItem(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipItem) {
      const x = e.clientX + 10;
      const y = e.clientY + 10;
      const tooltipWidth = window.innerWidth < 640 ? 192 : 192;
      const tooltipHeight = 150;
      const adjustedX = x + tooltipWidth > window.innerWidth ? x - tooltipWidth - 20 : x;
      const adjustedY = y + tooltipHeight > window.innerHeight ? y - tooltipHeight - 20 : y;
      setTooltipPosition({ x: adjustedX, y: adjustedY });
    }
  };
  
  // Handler for touch taps with double-tap detection
  const handleTouchStart = (slot: EquipmentSlot, e: React.TouchEvent) => {
    if (!slot.item) return;
    
    // Create mock event for tooltip positioning
    const touch = e.touches[0];
    const mockEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    } as React.MouseEvent;
    
    // Show tooltip
    handleMouseEnter(slot.item, mockEvent);
    
    // Check for double tap
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[slot.id] || 0;
    
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected
      onUnequip(slot.id);
      lastTapTimeRef.current[slot.id] = 0; // Reset after action
    } else {
      // Store timestamp for this slot
      lastTapTimeRef.current[slot.id] = now;
    }
  };

  return (
    <div className="h-full p-1">
      <div
        className="grid grid-cols-4 grid-rows-4 gap-1 h-[300px] sm:h-[350px] bg-black/40 rounded-lg p-1"
        style={{ gridTemplateAreas }}
      >
        {equipmentSlots.map((slot) => (
          <div
            key={slot.id}
            className={`bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center hover:border-metin-gold/70 transition-colors cursor-pointer ${slot.size === 'large' ? 'row-span-2' : ''}`}
            style={{ gridArea: slot.gridArea }}
            onMouseEnter={slot.item ? (e) => handleMouseEnter(slot.item!, e) : undefined}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onDoubleClick={() => slot.item && onUnequip(slot.id)}
            onTouchStart={slot.item ? (e) => handleTouchStart(slot, e) : undefined}
            onTouchEnd={handleMouseLeave}
          >
            {slot.item ? (
              <div className="w-full h-full p-2 relative">
                <div className="bg-metin-brown/40 rounded w-full h-full flex items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {isBase64Image(slot.item.imagePath) ? (
                      <img 
                        src={getImageUrl(slot.item.imagePath)}
                        alt={slot.item.name}
                        className="object-contain max-w-full max-h-full p-1"
                      />
                    ) : (
                      <Image
                        src={slot.item.imagePath}
                        alt={slot.item.name}
                        fill
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tl">
                    LvL {slot.item.requiredLevel}
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 bg-metin-dark/70 text-metin-light/70 text-xs text-center py-0.5">
                  {slot.name}
                </div>
              </div>
            ) : (
              <div className="text-metin-light/30 text-xs flex flex-col items-center justify-center h-full">
                <span>{slot.name}</span>
                {slot.id === 'weapon' && <span className="text-lg mt-1">⚔️</span>}
                {slot.id === 'helmet' && <span className="text-lg mt-1">🪖</span>}
                {slot.id === 'armor' && <span className="text-lg mt-1">🛡️</span>}
                {slot.id === 'shield' && <span className="text-lg mt-1">🛡️</span>}
                {slot.id === 'earrings' && <span className="text-lg mt-1">💎</span>}
                {slot.id === 'bracelet' && <span className="text-lg mt-1">⚜️</span>}
                {slot.id === 'necklace' && <span className="text-lg mt-1">📿</span>}
                {slot.id === 'boots' && <span className="text-lg mt-1">👢</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {tooltipItem && (
        <div
          className="fixed z-50 bg-metin-dark/95 border border-metin-gold/40 rounded p-2 shadow-lg w-48"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
        >
          <h4 className="text-metin-gold text-sm font-medium">{tooltipItem.name}</h4>
          <div className="mt-2 border-t border-metin-gold/20 pt-1">
            {tooltipItem.stats &&
              Object.entries(tooltipItem.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs">
                  <span className="text-metin-light/80">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </span>
                  <span className="text-metin-gold">+{value}</span>
                </div>
              ))}
          </div>
          <div className="mt-1 text-xs text-metin-light/50">
            Nivel necesar: {tooltipItem.requiredLevel}
          </div>
          <div className="mt-1 text-xs text-metin-gold/80 italic">
            Dublu click pentru a dezechipa
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterEquipment;