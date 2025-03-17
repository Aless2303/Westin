import React, { useState } from 'react';
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
}

const Backpack: React.FC<BackpackProps> = ({ backpackItems, onEquip }) => {
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
      <div className="grid grid-cols-5 gap-1 p-1 bg-black/40 rounded-lg h-[274px]">
        {Array(20)
          .fill(null)
          .map((_, index) => {
            const item = index < backpackItems.length ? backpackItems[index] : null;

            return (
              <div
                key={index}
                className="w-full h-[50px] bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center relative hover:border-metin-gold/70 transition-colors cursor-pointer"
                onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onDoubleClick={() => item && onEquip(item, index)}
              >
                {item ? (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <div className="relative w-11 h-11 bg-metin-brown/40 rounded flex items-center justify-center">
                        <Image
                          src={item.imagePath}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tr">
                        {item.requiredLevel}
                      </div>
                    </div>
                    {item.stackable && item.quantity && item.quantity > 1 && (
                      <div className="absolute top-0 right-0 bg-metin-dark/80 px-1 rounded-bl text-xs text-metin-light">
                        {item.quantity}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-metin-light/20 text-xs flex items-center justify-center h-full w-full">
                    {/* Slot gol - arată transparent */}
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
            top: `${tooltipPosition.y + 10}px`,
            left: `${tooltipPosition.x + 10}px`,
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
          
          {/* Adăugăm instrucțiunea pentru dublu click */}
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