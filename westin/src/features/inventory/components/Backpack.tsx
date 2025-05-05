import React, { useState, useRef } from 'react';
import Image from 'next/image';

// Interface for inventory items
interface InventoryItem {
  id: string;
  name: string;
  imagePath: string;
  type: 'weapon' | 'armor' | 'helmet' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | 'consumable' | 'quest' | 'material';
  stackable: boolean;
  quantity?: number;
  stats?: {
    [key: string]: number;
  };
  description: string;
  requiredLevel: number;
}

interface BackpackProps {
  backpackItems: (InventoryItem | null)[];
  onEquip: (item: InventoryItem, index: number) => void;
  isBase64Image: (str: string) => boolean;
  getImageUrl: (src: string) => string;
}

const Backpack: React.FC<BackpackProps> = ({ backpackItems, onEquip, isBase64Image, getImageUrl }) => {
  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // For double-tap detection on touch devices
  const lastTapTimeRef = useRef<{ [key: number]: number }>({});
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
  const handleTouchStart = (item: InventoryItem, index: number, e: React.TouchEvent) => {
    // Create mock event for tooltip positioning
    const touch = e.touches[0];
    const mockEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    } as React.MouseEvent;
    
    // Show tooltip
    handleMouseEnter(item, mockEvent);
    
    // Check for double tap
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[index] || 0;
    
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected
      onEquip(item, index);
      lastTapTimeRef.current[index] = 0; // Reset after action
    } else {
      // Store timestamp for this index
      lastTapTimeRef.current[index] = now;
    }
  };

  const slotsToShow = window.innerWidth < 640 ? 10 : 20;

  return (
    <div className="h-full p-1">
      <div className="grid grid-cols-5 gap-1 p-1 bg-black/40 rounded-lg h-[120px] sm:h-[274px] overflow-y-auto">
        {Array(slotsToShow)
          .fill(null)
          .map((_, index) => {
            const item = index < backpackItems.length ? backpackItems[index] : null;

            return (
              <div
                key={index}
                className="w-full h-[50px] sm:h-[50px] bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center relative hover:border-metin-gold/70 transition-colors cursor-pointer"
                onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onDoubleClick={() => item && onEquip(item, index)}
                onTouchStart={item ? (e) => handleTouchStart(item, index, e) : undefined}
                onTouchEnd={handleMouseLeave}
              >
                {item ? (
                  <>
                    <div className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center relative">
                      <div className="relative w-9 sm:w-11 h-9 sm:h-11 bg-metin-brown/40 rounded flex items-center justify-center">
                        {isBase64Image(item.imagePath) ? (
                          <img
                            src={getImageUrl(item.imagePath)}
                            alt={item.name}
                            className="object-contain max-w-full max-h-full p-1"
                          />
                        ) : (
                          <Image
                            src={item.imagePath}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tr">
                        {item.requiredLevel}
                      </div>
                    </div>
                    {item.stackable && item.quantity && item.quantity > 1 && (
                      <div className="absolute top-0 right-0 bg-metin-dark/80 text-metin-light text-xs px-1 rounded-bl">
                        {item.quantity}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-metin-light/20 text-xs flex items-center justify-center h-full w-full">
                    {/* Slot gol */}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="text-metin-light/70 text-xs mt-1">{tooltipItem.description}</div>
          {tooltipItem.stats && Object.keys(tooltipItem.stats).length > 0 && (
            <div className="mt-2 border-t border-metin-gold/20 pt-1">
              {Object.entries(tooltipItem.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs">
                  <span className="text-metin-light/80">
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </span>
                  <span className="text-metin-gold">+{value}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-1 text-xs text-metin-red">
            <div>Nivel necesar: {tooltipItem.requiredLevel}</div>
            <div className="text-metin-light/50 capitalize">
              {getTypeTranslation(tooltipItem.type)}
            </div>
          </div>
          {['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'].includes(tooltipItem.type) && (
            <div className="mt-1 text-xs text-metin-gold/80 italic">
              Dublu click pentru a echipa
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getTypeTranslation(type: string): string {
  const typeMap: Record<string, string> = {
    weapon: 'Armă',
    armor: 'Armură',
    helmet: 'Coif',
    shield: 'Scut',
    earrings: 'Cercei',
    bracelet: 'Brățară',
    necklace: 'Colier',
    boots: 'Papuci',
    consumable: 'Consumabil',
    quest: 'Obiect de misiune',
    material: 'Material',
  };
  return typeMap[type] || type;
}

export default Backpack;