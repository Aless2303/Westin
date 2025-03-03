import React, { useState } from 'react';
import Image from 'next/image';

// Interface for equipment items
interface Item {
  id: string;
  name: string;
  imagePath: string;
  type: string;
  stats: {
    [key: string]: number;
  };
  requiredLevel: number;
}

// Interface for equipment slots
interface EquipmentSlot {
  id: string;
  name: string;
  item: Item | null;
  gridArea: string;
  size: 'small' | 'medium' | 'large';
}

interface CharacterEquipmentProps {
  playerRace: string;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ playerRace }) => {
  // Generate item paths based on race and level
  const getItemPath = (type: string, raceSpecific: boolean = false, level: number = 1) => {
    let levelTier = "Incepator";
    let levelNum = 1;
    
    if (level >= 49) {
      levelTier = "Avansata Rubin";
      levelNum = 49;
    } else if (level >= 35) {
      levelTier = "Cianit";
      levelNum = 35;
    } else if (level >= 25) {
      levelTier = "Posedat";
      levelNum = 25;
    } else if (level >= 11) {
      levelTier = "Otel";
      levelNum = 11;
    }
    
    if (raceSpecific) {
      return `/items/${type}/${playerRace}/${playerRace} ${type} ${levelTier} - LvL ${levelNum}.png`;
    } else {
      return `/items/${type}/${type} ${levelTier} - LvL ${levelNum}.png`;
    }
  };

  // Mock data for a level 25 character
  const characterLevel = 25;
  
  // Define equipped items based on the character's level and race
  const equippedItems: Record<string, Item | null> = {
    weapon: {
      id: 'weapon-1',
      name: `${playerRace} Armă Posedată`,
      imagePath: getItemPath('Weapons', true, characterLevel),
      type: 'weapon',
      stats: {
        attack: 120,
        strength: 15,
        criticalHit: 7
      },
      requiredLevel: characterLevel
    },
    helmet: {
      id: 'helmet-1',
      name: `${playerRace} Coif Posedat`,
      imagePath: getItemPath('Coif', true, characterLevel),
      type: 'helmet',
      stats: {
        defense: 45,
        intelligence: 10,
        hp: 50
      },
      requiredLevel: characterLevel
    },
    armor: {
      id: 'armor-1',
      name: `${playerRace} Armură Posedată`,
      imagePath: getItemPath('Armours', true, characterLevel),
      type: 'armor',
      stats: {
        defense: 75,
        hp: 120,
        resistFire: 10,
        resistIce: 5
      },
      requiredLevel: characterLevel
    },
    shield: {
      id: 'shield-1',
      name: 'Scut Posedat',
      imagePath: getItemPath('Scut', false, characterLevel),
      type: 'shield',
      stats: {
        defense: 35,
        blockRate: 15,
        resistPoison: 8
      },
      requiredLevel: characterLevel
    },
    earrings: {
      id: 'earrings-1',
      name: 'Cercei Posedați',
      imagePath: getItemPath('Cercei', false, characterLevel),
      type: 'earrings',
      stats: {
        intelligence: 15,
        mp: 50,
        magicBoost: 5
      },
      requiredLevel: characterLevel
    },
    bracelet: {
      id: 'bracelet-1',
      name: 'Brățară Posedată',
      imagePath: getItemPath('Bratara', false, characterLevel),
      type: 'bracelet',
      stats: {
        attackSpeed: 10,
        dexterity: 8,
        criticalHit: 3
      },
      requiredLevel: characterLevel
    },
    necklace: {
      id: 'necklace-1',
      name: 'Colier Posedat',
      imagePath: getItemPath('Colier', false, characterLevel),
      type: 'necklace',
      stats: {
        magicResist: 10,
        hp: 50,
        mp: 50
      },
      requiredLevel: characterLevel
    },
    boots: {
      id: 'boots-1',
      name: 'Papuci Posedați',
      imagePath: getItemPath('Papuci', false, characterLevel),
      type: 'boots',
      stats: {
        movementSpeed: 10,
        evade: 5,
        hp: 30
      },
      requiredLevel: characterLevel
    }
  };

  // Define slots with configuration
  const equipmentSlots: EquipmentSlot[] = [
    { id: 'weapon', name: 'Armă', item: equippedItems.weapon, gridArea: 'weapon', size: 'large' },
    { id: 'helmet', name: 'Coif', item: equippedItems.helmet, gridArea: 'helmet', size: 'medium' },
    { id: 'armor', name: 'Armură', item: equippedItems.armor, gridArea: 'armor', size: 'large' },
    { id: 'shield', name: 'Scut', item: equippedItems.shield, gridArea: 'shield', size: 'medium' },
    { id: 'earrings', name: 'Cercei', item: equippedItems.earrings, gridArea: 'earrings', size: 'small' },
    { id: 'bracelet', name: 'Brățară', item: equippedItems.bracelet, gridArea: 'bracelet', size: 'small' },
    { id: 'necklace', name: 'Colier', item: equippedItems.necklace, gridArea: 'necklace', size: 'small' },
    { id: 'boots', name: 'Papuci', item: equippedItems.boots, gridArea: 'boots', size: 'medium' },
  ];

  const gridTemplateAreas = `
    "weapon helmet . ."
    "weapon armor shield earrings"
    "weapon armor bracelet necklace"
    ". boots . ."
  `;

  // State for tooltip
  const [tooltipItem, setTooltipItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Handle tooltip display
  const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
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
        className="grid grid-cols-4 grid-rows-4 gap-1 h-[330px] bg-black/40 rounded-lg p-1"
        style={{
          gridTemplateAreas: gridTemplateAreas,
        }}
      >
        {equipmentSlots.map((slot) => (
          <div
            key={slot.id}
            className={`bg-black/60 border border-metin-gold/30 rounded flex items-center justify-center hover:border-metin-gold/70 transition-colors cursor-pointer ${slot.size === 'large' ? 'row-span-2' : ''}`}
            style={{
              gridArea: slot.gridArea,
            }}
            onMouseEnter={slot.item ? (e) => handleMouseEnter(slot.item!, e) : undefined}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {slot.item ? (
              <div className="w-full h-full p-2 relative">
                <div className="bg-metin-brown/40 rounded w-full h-full flex items-center justify-center relative">
                  {/* Item image */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={slot.item.imagePath}
                      alt={slot.item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  
                  {/* Level badge */}
                  <div className="absolute bottom-0 right-0 bg-metin-dark/80 text-metin-gold text-xs px-1 rounded-tl">
                    LvL {slot.item.requiredLevel}
                  </div>
                </div>
                
                {/* Slot name label */}
                <div className="absolute top-0 left-0 right-0 bg-metin-dark/70 text-metin-light/70 text-xs text-center py-0.5">
                  {slot.name}
                </div>
              </div>
            ) : (
              <div className="text-metin-light/30 text-xs flex flex-col items-center justify-center h-full">
                <span>{slot.name}</span>
                {/* Icon relevant for slot */}
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
      
      {/* Tooltip */}
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
            {Object.entries(tooltipItem.stats).map(([stat, value]) => (
              <div key={stat} className="flex justify-between text-xs">
                <span className="text-metin-light/80">{stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
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