import React, { useState } from 'react';
import Image from 'next/image';

// Interfață pentru un item din inventar
interface InventoryItem {
  id: string;
  name: string;
  imagePath: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'material';
  stackable: boolean;
  quantity?: number;
  stats?: {
    [key: string]: number;
  };
  description: string;
}

const Backpack: React.FC = () => {
  // Numărul de slot-uri disponibile în ghiozdan (4 rânduri × 5 coloane)
  const SLOTS_COUNT = 20;
  
  // Starea pentru tooltip (când utilizatorul trece mouse-ul peste un item)
  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Exemplu de items în inventar (în aplicația reală ar veni din context/state)
  const [inventoryItems, setInventoryItems] = useState<(InventoryItem | null)[]>([
    {
      id: 'sword1',
      name: 'Sabie Dragon',
      imagePath: '/items/weapons/dragon_sword.png',
      type: 'weapon',
      stackable: false,
      stats: {
        damage: 120,
        strength: 15,
      },
      description: 'O sabie puternică forjată din solzii unui dragon bătrân.'
    },
    {
      id: 'potion1',
      name: 'Poțiune de viață',
      imagePath: '/items/consumables/health_potion.png',
      type: 'consumable',
      stackable: true,
      quantity: 5,
      description: 'Regenerează 500 puncte de viață instantaneu.'
    },
    null, // Slot gol
    null, // Slot gol
    {
      id: 'armor1',
      name: 'Armură de fier',
      imagePath: '/items/armor/iron_armor.png',
      type: 'armor',
      stackable: false,
      stats: {
        defense: 75,
        hp: 150,
      },
      description: 'Armură rezistentă confecționată de cei mai buni fierari.'
    },
    // Restul sloturilor sunt goale
    ...Array(SLOTS_COUNT - 5).fill(null)
  ]);
  
  // Gestionează afișarea tooltip-ului
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
      {/* Grid-ul inventarului */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-black/40 rounded-lg h-[330px]">
        {Array(SLOTS_COUNT).fill(null).map((_, index) => {
          const item = inventoryItems[index];
          
          return (
            <div
              key={index}
              className="w-12 h-12 bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center relative hover:border-metin-gold/70 transition-colors cursor-pointer"
              onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {item && (
                <>
                  <div className="w-10 h-10 flex items-center justify-center">
                    {/* Placeholder pentru imaginea item-ului */}
                    <div className="w-8 h-8 bg-metin-brown/80 rounded flex items-center justify-center text-xs text-metin-gold">
                      {item.name.slice(0, 2)}
                    </div>
                  </div>
                  
                  {/* Indicator pentru cantitate (dacă item-ul este stackable) */}
                  {item.stackable && item.quantity && item.quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-metin-dark px-1 rounded-tl text-xs text-metin-light">
                      {item.quantity}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Tooltip pentru item */}
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
          
          {tooltipItem.stats && (
            <div className="mt-2 border-t border-metin-gold/20 pt-1">
              {Object.entries(tooltipItem.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs">
                  <span className="text-metin-light/80">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                  <span className="text-metin-gold">+{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Backpack;