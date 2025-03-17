import React, { useState } from 'react';
import Image from 'next/image';

// Interface for inventory items (same as in InventoryPanel.tsx)
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
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({
  playerRace,
  equipmentSlots,
  onUnequip,
}) => {
  const gridTemplateAreas = `
    "weapon helmet . ."
    "weapon armor shield earrings"
    "weapon armor bracelet necklace"
    ". boots . ."
  `;

  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (item: InventoryItem, e: React.MouseEvent) => {
    setTooltipItem(item);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipItem(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipItem) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="h-full p-1">
      <div
        className="grid grid-cols-4 grid-rows-4 gap-1 h-[350px] bg-black/40 rounded-lg p-1"
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
            onDoubleClick={() => slot.item && onUnequip(slot.id)} // Add double-click handler
          >
            {slot.item ? (
              <div className="w-full h-full p-2 relative">
                <div className="bg-metin-brown/40 rounded w-full h-full flex items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={slot.item.imagePath}
                      alt={slot.item.name}
                      fill
                      className="object-contain p-1"
                    />
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
            top: `${tooltipPosition.y + 10}px`,
            left: `${tooltipPosition.x + 10}px`,
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
        </div>
      )}
    </div>
  );
};

export default CharacterEquipment;