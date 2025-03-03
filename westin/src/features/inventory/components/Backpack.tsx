import React, { useState } from 'react';
import Image from 'next/image';

// Interfață pentru un item din inventar
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

const Backpack: React.FC = () => {
  // Numărul de slot-uri disponibile în ghiozdan (4 rânduri × 5 coloane)
  const SLOTS_COUNT = 20;
  
  // Starea pentru tooltip (când utilizatorul trece mouse-ul peste un item)
  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Exemplu de items în inventar folosind doar fișierele din lista dată
  const [inventoryItems, setInventoryItems] = useState<(InventoryItem | null)[]>([
    // Arme pentru Ninja
    {
      id: 'weapon-ninja-1',
      name: 'Ninja Weapons Posedat',
      imagePath: '/items/Weapons/Ninja/Ninja Weapons Posedat - LvL 25.png',
      type: 'weapon',
      stackable: false,
      stats: {
        attack: 85,
        dexterity: 12,
        criticalHit: 8
      },
      description: 'Armă puternică pentru ninja de nivel 25.',
      requiredLevel: 25
    },
    {
      id: 'weapon-ninja-2',
      name: 'Ninja Weapons Otel',
      imagePath: '/items/Weapons/Ninja/Ninja Weapons Otel - LvL 11.png',
      type: 'weapon',
      stackable: false,
      stats: {
        attack: 45,
        dexterity: 8,
        speed: 10
      },
      description: 'Armă din oțel pentru ninja începători.',
      requiredLevel: 11
    },
    // Armură pentru Ninja
    {
      id: 'armor-ninja-1',
      name: 'Ninja Armours Cianit',
      imagePath: '/items/Armours/Ninja/Ninja Armours Cianit - LvL 35.png',
      type: 'armor',
      stackable: false,
      stats: {
        defense: 75,
        hp: 120,
        evasion: 15
      },
      description: 'Armură avansată pentru ninja experimentați.',
      requiredLevel: 35
    },
    {
      id: 'armor-ninja-2',
      name: 'Ninja Armours Incepator',
      imagePath: '/items/Armours/Ninja/Ninja Armours Incepator - LvL 1.png',
      type: 'armor',
      stackable: false,
      stats: {
        defense: 20,
        hp: 30,
        evasion: 5
      },
      description: 'Armură de bază pentru ninja începători.',
      requiredLevel: 1
    },
    // Coif pentru Ninja
    {
      id: 'helmet-ninja-1',
      name: 'Ninja Coif Avansata Rubin',
      imagePath: '/items/Coif/Ninja/Ninja Coif Avansata Rubin - LvL 49.png',
      type: 'helmet',
      stackable: false,
      stats: {
        defense: 45,
        hp: 80,
        intelligence: 15
      },
      description: 'Coif puternic pentru cei mai experimentați ninja.',
      requiredLevel: 49
    },
    // Accesorii
    {
      id: 'earrings-1',
      name: 'Cercei Cianit',
      imagePath: '/items/Cercei/Cercei Cianit - LvL 35.png',
      type: 'earrings',
      stackable: false,
      stats: {
        intelligence: 20,
        mp: 100,
        magicBoost: 8
      },
      description: 'Cercei puternici care sporesc abilitățile magice.',
      requiredLevel: 35
    },
    {
      id: 'bracelet-1',
      name: 'Bratara Posedat',
      imagePath: '/items/Bratara/Bratara Posedat - LvL 25.png',
      type: 'bracelet',
      stackable: false,
      stats: {
        attackSpeed: 10,
        dexterity: 12,
        criticalHit: 5
      },
      description: 'O brățară ce oferă viteza de atac crescută.',
      requiredLevel: 25
    },
    {
      id: 'necklace-1',
      name: 'Colier Otel',
      imagePath: '/items/Colier/Colier Otel - LvL 11.png',
      type: 'necklace',
      stackable: false,
      stats: {
        magicResist: 8,
        hp: 50,
        mp: 30
      },
      description: 'Un colier de oțel care conferă rezistență magică.',
      requiredLevel: 11
    },
    {
      id: 'boots-1',
      name: 'Papuci Avansata Rubin',
      imagePath: '/items/Papuci/Papuci Avansata Rubin - LvL 49.png',
      type: 'boots',
      stackable: false,
      stats: {
        movementSpeed: 15,
        evasion: 10,
        hp: 50
      },
      description: 'Încălțăminte de elită cu rubine ce oferă viteză și evaziune.',
      requiredLevel: 49
    },
    // Scut
    {
      id: 'shield-1',
      name: 'Scut Posedat',
      imagePath: '/items/Scut/Scut Posedat - LvL 25.png',
      type: 'shield',
      stackable: false,
      stats: {
        defense: 35,
        blockRate: 15,
        hp: 60
      },
      description: 'Un scut posedat ce oferă protecție solidă.',
      requiredLevel: 25
    },
    // Arme și armuri pentru alte clase (opțional)
    {
      id: 'weapon-warrior-1',
      name: 'Warrior Weapons Incepator',
      imagePath: '/items/Weapons/Warrior/Warrior Weapons Incepator - LvL 1.png',
      type: 'weapon',
      stackable: false,
      stats: {
        attack: 25,
        strength: 5
      },
      description: 'Armă de bază pentru războinici începători.',
      requiredLevel: 1
    },
    {
      id: 'helmet-sura-1',
      name: 'Sura Coif Otel',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: {
        defense: 25,
        hp: 40
      },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11
    },
    // Restul sloturilor sunt goale
    ...Array(SLOTS_COUNT - 12).fill(null)
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
              className="w-full h-16 bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center relative hover:border-metin-gold/70 transition-colors cursor-pointer"
              onMouseEnter={item ? (e) => handleMouseEnter(item, e) : undefined}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {item && (
                <>
                  <div className="w-14 h-14 flex items-center justify-center relative">
                    {/* Imaginea item-ului */}
                    <div className="relative w-12 h-12 bg-metin-brown/40 rounded flex items-center justify-center">
                      <Image
                        src={item.imagePath}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    
                    {/* Badge nivel necesar */}
                    <div className="absolute bottom-0 left-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tr">
                      {item.requiredLevel}
                    </div>
                  </div>
                  
                  {/* Indicator pentru cantitate (dacă item-ul este stackable) */}
                  {item.stackable && item.quantity && item.quantity > 1 && (
                    <div className="absolute top-0 right-0 bg-metin-dark/80 px-1 rounded-bl text-xs text-metin-light">
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
          
          {tooltipItem.stats && Object.keys(tooltipItem.stats).length > 0 && (
            <div className="mt-2 border-t border-metin-gold/20 pt-1">
              {Object.entries(tooltipItem.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs">
                  <span className="text-metin-light/80">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                  <span className="text-metin-gold">+{value}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-1 text-xs text-metin-red">
            <div>Nivel necesar: {tooltipItem.requiredLevel}</div>
            <div className="text-metin-light/50 capitalize">{getTypeTranslation(tooltipItem.type)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Funcție helper pentru a traduce tipurile de iteme în română
function getTypeTranslation(type: string): string {
  const typeMap: Record<string, string> = {
    'weapon': 'Armă',
    'armor': 'Armură',
    'helmet': 'Coif',
    'shield': 'Scut',
    'earrings': 'Cercei',
    'bracelet': 'Brățară',
    'necklace': 'Colier',
    'boots': 'Papuci',
    'consumable': 'Consumabil',
    'quest': 'Obiect de misiune',
    'material': 'Material'
  };
  
  return typeMap[type] || type;
}

export default Backpack;