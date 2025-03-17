import React, { useState, useRef, useEffect, useCallback } from 'react';
import CharacterEquipment from './CharacterEquipment';
import Backpack from './Backpack';

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

// Interface for equipment slots
interface EquipmentSlot {
  id: string;
  name: string;
  item: InventoryItem | null;
  gridArea: string;
  size: 'small' | 'medium' | 'large';
}

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playerRace: string;
}

// Tipurile de echipament care pot fi filtrate
type EquipmentFilterType = 'weapon' | 'helmet' | 'armor' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | null;

// Configurația butoanelor de filtrare cu iconițe
interface FilterButtonConfig {
  type: EquipmentFilterType;
  name: string;
  icon: string;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose, playerRace }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Filtru pentru tipul de echipament (null înseamnă că se afișează toate)
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilterType>(null);

  // Configurația butoanelor de filtrare cu iconițe
  const filterButtons: FilterButtonConfig[] = [
    { type: 'weapon', name: 'Armă', icon: '⚔️' },
    { type: 'helmet', name: 'Coif', icon: '🪖' },
    { type: 'armor', name: 'Armură', icon: '🛡️' },
    { type: 'shield', name: 'Scut', icon: '🛡️' },
    { type: 'earrings', name: 'Cercei', icon: '💎' },
    { type: 'bracelet', name: 'Brățară', icon: '⚜️' },
    { type: 'necklace', name: 'Colier', icon: '📿' },
    { type: 'boots', name: 'Papuci', icon: '👢' },
  ];

  // State for equipment
  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>(() => {
    const characterLevel = 25;

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

    const equippedItems: Record<string, InventoryItem | null> = {
      weapon: {
        id: 'weapon-1',
        name: `${playerRace} Armă Posedată`,
        imagePath: getItemPath('Weapons', true, characterLevel),
        type: 'weapon',
        stackable: false,
        stats: { attack: 120, strength: 15, criticalHit: 7 },
        description: 'Armă posedată pentru luptători experimentați.',
        requiredLevel: characterLevel,
      },
      helmet: {
        id: 'helmet-1',
        name: `${playerRace} Coif Posedat`,
        imagePath: getItemPath('Coif', true, characterLevel),
        type: 'helmet',
        stackable: false,
        stats: { defense: 45, intelligence: 10, hp: 50 },
        description: 'Coif posedat pentru luptători experimentați.',
        requiredLevel: characterLevel,
      },
      armor: {
        id: 'armor-1',
        name: `${playerRace} Armură Posedată`,
        imagePath: getItemPath('Armours', true, characterLevel),
        type: 'armor',
        stackable: false,
        stats: { defense: 75, hp: 120, resistFire: 10, resistIce: 5 },
        description: 'Armură posedată pentru luptători experimentați.',
        requiredLevel: characterLevel,
      },
      shield: {
        id: 'shield-1',
        name: 'Scut Posedat',
        imagePath: getItemPath('Scut', false, characterLevel),
        type: 'shield',
        stackable: false,
        stats: { defense: 35, blockRate: 15, resistPoison: 8 },
        description: 'Scut posedat ce oferă protecție solidă.',
        requiredLevel: characterLevel,
      },
      earrings: {
        id: 'earrings-1',
        name: 'Cercei Posedați',
        imagePath: getItemPath('Cercei', false, characterLevel),
        type: 'earrings',
        stackable: false,
        stats: { intelligence: 15, mp: 50, magicBoost: 5 },
        description: 'Cercei care sporesc abilitățile magice.',
        requiredLevel: characterLevel,
      },
      bracelet: {
        id: 'bracelet-1',
        name: 'Brățară Posedată',
        imagePath: getItemPath('Bratara', false, characterLevel),
        type: 'bracelet',
        stackable: false,
        stats: { attackSpeed: 10, dexterity: 8, criticalHit: 3 },
        description: 'Brățară ce oferă viteză de atac.',
        requiredLevel: characterLevel,
      },
      necklace: {
        id: 'necklace-1',
        name: 'Colier Posedat',
        imagePath: getItemPath('Colier', false, characterLevel),
        type: 'necklace',
        stackable: false,
        stats: { magicResist: 10, hp: 50, mp: 50 },
        description: 'Colier care conferă rezistență magică.',
        requiredLevel: characterLevel,
      },
      boots: {
        id: 'boots-1',
        name: 'Papuci Posedați',
        imagePath: getItemPath('Papuci', false, characterLevel),
        type: 'boots',
        stackable: false,
        stats: { movementSpeed: 10, evade: 5, hp: 30 },
        description: 'Papuci care oferă viteză și evaziune.',
        requiredLevel: characterLevel,
      },
    };

    return [
      { id: 'weapon', name: 'Armă', item: equippedItems.weapon, gridArea: 'weapon', size: 'large' },
      { id: 'helmet', name: 'Coif', item: equippedItems.helmet, gridArea: 'helmet', size: 'medium' },
      { id: 'armor', name: 'Armură', item: equippedItems.armor, gridArea: 'armor', size: 'large' },
      { id: 'shield', name: 'Scut', item: equippedItems.shield, gridArea: 'shield', size: 'medium' },
      { id: 'earrings', name: 'Cercei', item: equippedItems.earrings, gridArea: 'earrings', size: 'small' },
      { id: 'bracelet', name: 'Brățară', item: equippedItems.bracelet, gridArea: 'bracelet', size: 'small' },
      { id: 'necklace', name: 'Colier', item: equippedItems.necklace, gridArea: 'necklace', size: 'small' },
      { id: 'boots', name: 'Papuci', item: equippedItems.boots, gridArea: 'boots', size: 'medium' },
    ];
  });

  // State for backpack with fixed 20 slots per page
  const SLOTS_PER_PAGE = 20; // Fixed slots per page
  const [backpackItems, setBackpackItems] = useState<(InventoryItem | null)[]>([
    {
      id: 'weapon-ninja-1',
      name: 'Ninja Weapons Posedat',
      imagePath: '/items/Weapons/Ninja/Ninja Weapons Posedat - LvL 25.png',
      type: 'weapon',
      stackable: false,
      stats: { attack: 85, dexterity: 12, criticalHit: 8 },
      description: 'Armă puternică pentru ninja de nivel 25.',
      requiredLevel: 25,
    },
    {
      id: 'weapon-ninja-2',
      name: 'Ninja Weapons Otel',
      imagePath: '/items/Weapons/Ninja/Ninja Weapons Otel - LvL 11.png',
      type: 'weapon',
      stackable: false,
      stats: { attack: 45, dexterity: 8, speed: 10 },
      description: 'Armă din oțel pentru ninja începători.',
      requiredLevel: 11,
    },
    {
      id: 'armor-ninja-1',
      name: 'Ninja Armours Cianit',
      imagePath: '/items/Armours/Ninja/Ninja Armours Cianit - LvL 35.png',
      type: 'armor',
      stackable: false,
      stats: { defense: 75, hp: 120, evasion: 15 },
      description: 'Armură avansată pentru ninja experimentați.',
      requiredLevel: 35,
    },
    {
      id: 'armor-ninja-2',
      name: 'Ninja Armours Incepator',
      imagePath: '/items/Armours/Ninja/Ninja Armours Incepator - LvL 1.png',
      type: 'armor',
      stackable: false,
      stats: { defense: 20, hp: 30, evasion: 5 },
      description: 'Armură de bază pentru ninja începători.',
      requiredLevel: 1,
    },
    {
      id: 'helmet-ninja-1',
      name: 'Ninja Coif Avansata Rubin',
      imagePath: '/items/Coif/Ninja/Ninja Coif Avansata Rubin - LvL 49.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 45, hp: 80, intelligence: 15 },
      description: 'Coif puternic pentru cei mai experimentați ninja.',
      requiredLevel: 49,
    },
    {
      id: 'earrings-1',
      name: 'Cercei Cianit',
      imagePath: '/items/Cercei/Cercei Cianit - LvL 35.png',
      type: 'earrings',
      stackable: false,
      stats: { intelligence: 20, mp: 100, magicBoost: 8 },
      description: 'Cercei puternici care sporesc abilitățile magice.',
      requiredLevel: 35,
    },
    {
      id: 'bracelet-1',
      name: 'Bratara Posedat',
      imagePath: '/items/Bratara/Bratara Posedat - LvL 25.png',
      type: 'bracelet',
      stackable: false,
      stats: { attackSpeed: 10, dexterity: 12, criticalHit: 5 },
      description: 'O brățară ce oferă viteza de atac crescută.',
      requiredLevel: 25,
    },
    {
      id: 'necklace-1',
      name: 'Colier Otel',
      imagePath: '/items/Colier/Colier Otel - LvL 11.png',
      type: 'necklace',
      stackable: false,
      stats: { magicResist: 8, hp: 50, mp: 30 },
      description: 'Un colier de oțel care conferă rezistență magică.',
      requiredLevel: 11,
    },
    {
      id: 'boots-1',
      name: 'Papuci Avansata Rubin',
      imagePath: '/items/Papuci/Papuci Avansata Rubin - LvL 49.png',
      type: 'boots',
      stackable: false,
      stats: { movementSpeed: 15, evasion: 10, hp: 50 },
      description: 'Încălțăminte de elită cu rubine ce oferă viteză și evaziune.',
      requiredLevel: 49,
    },
    {
      id: 'shield-1',
      name: 'Scut Posedat',
      imagePath: '/items/Scut/Scut Posedat - LvL 25.png',
      type: 'shield',
      stackable: false,
      stats: { defense: 35, blockRate: 15, hp: 60 },
      description: 'Un scut posedat ce oferă protecție solidă.',
      requiredLevel: 25,
    },
    {
      id: 'weapon-warrior-1',
      name: 'Warrior Weapons Incepator',
      imagePath: '/items/Weapons/Warrior/Warrior Weapons Incepator - LvL 1.png',
      type: 'weapon',
      stackable: false,
      stats: { attack: 25, strength: 5 },
      description: 'Armă de bază pentru războinici începători.',
      requiredLevel: 1,
    },
    {
      id: 'helmet-sura-1',
      name: 'Sura Coif Otel',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-2',
      name: 'Sura Coif Otel 2',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-3',
      name: 'Sura Coif Otel 3',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-4',
      name: 'Sura Coif Otel 4',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-5',
      name: 'Sura Coif Otel 5',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-6',
      name: 'Sura Coif Otel 6',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-7',
      name: 'Sura Coif Otel 7',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-8',
      name: 'Sura Coif Otel 8',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-9',
      name: 'Sura Coif Otel 9',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-10',
      name: 'Sura Coif Otel 10',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-11',
      name: 'Sura Coif Otel 11',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-12',
      name: 'Sura Coif Otel 12',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-13',
      name: 'Sura Coif Otel 13',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-14',
      name: 'Sura Coif Otel 14',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-15',
      name: 'Sura Coif Otel 15',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-16',
      name: 'Sura Coif Otel 16',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-17',
      name: 'Sura Coif Otel 17',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-18',
      name: 'Sura Coif Otel 18',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-19',
      name: 'Sura Coif Otel 19',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    },
    {
      id: 'helmet-sura-20',
      name: 'Sura Coif Otel 20',
      imagePath: '/items/Coif/Sura/Sura Coif Otel - LvL 11.png',
      type: 'helmet',
      stackable: false,
      stats: { defense: 25, hp: 40 },
      description: 'Coif din oțel pentru luptătorii Sura.',
      requiredLevel: 11,
    }
  ]);

  // Toggle pentru filtru - apăsând pe același buton de filtru se anulează (null)
  const toggleFilter = (type: EquipmentFilterType) => {
    if (equipmentFilter === type) {
      setEquipmentFilter(null);
    } else {
      setEquipmentFilter(type);
    }
    // Reset de asemenea pagina la 1 când se schimbă filtrul
    setCurrentPage(1);
  };

  // Filtrăm itemele conform filtrului selectat
  const filteredBackpackItems = equipmentFilter 
    ? backpackItems.filter(item => item && item.type === equipmentFilter)
    : backpackItems;

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredBackpackItems.filter((item) => item !== null).length / SLOTS_PER_PAGE);

  // Handler to unequip an item (move from equipment to backpack)
  const handleUnequip = useCallback((slotId: string) => {
    const slot = equipmentSlots.find((s) => s.id === slotId);
    if (!slot || !slot.item) return;

    const item = slot.item;

    // Append the item to the end of the backpackItems array
    setBackpackItems((prevItems) => [...prevItems, item]);

    // Update equipment
    setEquipmentSlots((prevSlots) =>
      prevSlots.map((s) => (s.id === slotId ? { ...s, item: null } : s))
    );
  }, [equipmentSlots]);

  // Handler to equip an item (move from backpack to equipment)
  const handleEquip = useCallback((item: InventoryItem, index: number) => {
    const slot = equipmentSlots.find((s) => s.id === item.type);
    if (!slot) {
      console.log(`Itemul de tip ${item.type} nu poate fi echipat!`);
      return;
    }

    const equippedItem = slot.item;

    // Update equipment
    setEquipmentSlots((prevSlots) =>
      prevSlots.map((s) => (s.id === item.type ? { ...s, item } : s))
    );

    // Găsim indexul real al itemului în array-ul original (ținând cont de filtrare)
    let actualItemIndex;
    
    if (equipmentFilter) {
      // Dacă avem un filtru, trebuie să gasim indexul corect în lista filtrată
      const filteredItems = backpackItems.filter(item => item && item.type === equipmentFilter);
      const filteredItemId = filteredItems[index]?.id;
      actualItemIndex = backpackItems.findIndex(item => item && item.id === filteredItemId);
    } else {
      // Dacă nu avem un filtru, indexul este direct
      const startIdx = (currentPage - 1) * SLOTS_PER_PAGE;
      actualItemIndex = startIdx + index;
    }

    // Update backpack
    setBackpackItems((prevItems) => {
      const newItems = [...prevItems];
      
      // Remove the equipped item
      newItems[actualItemIndex] = null;
      
      // Filter out null values to compact items
      const compactedItems = newItems.filter(item => item !== null) as InventoryItem[];
      
      // If there was an equipped item, append it to the end
      if (equippedItem) {
        compactedItems.push(equippedItem);
      }
      
      return compactedItems;
    });
  }, [equipmentSlots, backpackItems, currentPage, equipmentFilter]);

  // Dragging handlers
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

  if (!isOpen) return null;

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Calculate items for the current page
  const startIndex = (currentPage - 1) * SLOTS_PER_PAGE;
  const currentPageItems = filteredBackpackItems.slice(startIndex, startIndex + SLOTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg"
      style={{
        width: '750px',
        height: '500px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
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

      <div className="p-4 flex h-[calc(100%-44px)]">
        <div className="w-1/2 pr-2">
          <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-3">
            Echipament
          </h3>
          <CharacterEquipment
            playerRace={playerRace}
            equipmentSlots={equipmentSlots}
            onUnequip={handleUnequip}
          />
        </div>

        <div className="w-1/2 pl-2 border-l border-metin-gold/30 flex flex-col">
          <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-3">
            Ghiozdan
          </h3>
          
          {/* Butoane de filtrare cu iconițe pe două rânduri */}
          <div className="mb-2 grid grid-cols-4 gap-1">
            {filterButtons.map(button => (
              <button
                key={button.type}
                onClick={() => toggleFilter(button.type)}
                className={`h-8 flex flex-col items-center justify-center rounded border transition-colors ${
                  equipmentFilter === button.type
                    ? 'bg-metin-gold/20 border-metin-gold text-metin-gold'
                    : 'border-metin-gold/30 text-metin-light/70 hover:border-metin-gold/50 hover:text-metin-light bg-black/40'
                }`}
                title={button.name}
              >
                <span className="text-lg">{button.icon}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-grow">
            <Backpack
              backpackItems={currentPageItems}
              onEquip={handleEquip}
            />
          </div>
          
          {/* Butoane de navigare */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-2 mb-1 text-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-1 rounded transition-colors ${
                  currentPage === 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-metin-gold hover:text-metin-light'
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-1 rounded transition-colors ${
                    currentPage === page
                      ? 'bg-metin-gold text-metin-dark'
                      : 'text-metin-light hover:bg-metin-brown hover:text-metin-gold'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-1 rounded transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-metin-gold hover:text-metin-light'
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;