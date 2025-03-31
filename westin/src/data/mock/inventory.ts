import { InventoryItem, EquipmentSlot } from '../../types/inventory';

// Funcție pentru generarea path-urilor de imagini pentru echipament
export const getItemPath = (type: string, raceSpecific: boolean = false, playerRace: string = 'Ninja', level: number = 1) => {
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

// Generează echipamentul pentru un caracter cu un nivel specific
export const generateEquipment = (playerRace: string, characterLevel: number = 25): EquipmentSlot[] => {
  const equippedItems: Record<string, InventoryItem | null> = {
    weapon: {
      id: 'weapon-1',
      name: `${playerRace} Armă Posedată`,
      imagePath: getItemPath('Weapons', true, playerRace, characterLevel),
      type: 'weapon',
      stackable: false,
      stats: { attack: 120, strength: 15, criticalHit: 7 },
      description: 'Armă posedată pentru luptători experimentați.',
      requiredLevel: characterLevel,
    },
    helmet: {
      id: 'helmet-1',
      name: `${playerRace} Coif Posedat`,
      imagePath: getItemPath('Coif', true, playerRace, characterLevel),
      type: 'helmet',
      stackable: false,
      stats: { defense: 45, intelligence: 10, hp: 50 },
      description: 'Coif posedat pentru luptători experimentați.',
      requiredLevel: characterLevel,
    },
    armor: {
      id: 'armor-1',
      name: `${playerRace} Armură Posedată`,
      imagePath: getItemPath('Armours', true, playerRace, characterLevel),
      type: 'armor',
      stackable: false,
      stats: { defense: 75, hp: 120, resistFire: 10, resistIce: 5 },
      description: 'Armură posedată pentru luptători experimentați.',
      requiredLevel: characterLevel,
    },
    shield: {
      id: 'shield-1',
      name: 'Scut Posedat',
      imagePath: getItemPath('Scut', false, playerRace, characterLevel),
      type: 'shield',
      stackable: false,
      stats: { defense: 35, blockRate: 15, resistPoison: 8 },
      description: 'Scut posedat ce oferă protecție solidă.',
      requiredLevel: characterLevel,
    },
    earrings: {
      id: 'earrings-1',
      name: 'Cercei Posedați',
      imagePath: getItemPath('Cercei', false, playerRace, characterLevel),
      type: 'earrings',
      stackable: false,
      stats: { intelligence: 15, mp: 50, magicBoost: 5 },
      description: 'Cercei care sporesc abilitățile magice.',
      requiredLevel: characterLevel,
    },
    bracelet: {
      id: 'bracelet-1',
      name: 'Brățară Posedată',
      imagePath: getItemPath('Bratara', false, playerRace, characterLevel),
      type: 'bracelet',
      stackable: false,
      stats: { attackSpeed: 10, dexterity: 8, criticalHit: 3 },
      description: 'Brățară ce oferă viteză de atac.',
      requiredLevel: characterLevel,
    },
    necklace: {
      id: 'necklace-1',
      name: 'Colier Posedat',
      imagePath: getItemPath('Colier', false, playerRace, characterLevel),
      type: 'necklace',
      stackable: false,
      stats: { magicResist: 10, hp: 50, mp: 50 },
      description: 'Colier care conferă rezistență magică.',
      requiredLevel: characterLevel,
    },
    boots: {
      id: 'boots-1',
      name: 'Papuci Posedați',
      imagePath: getItemPath('Papuci', false, playerRace, characterLevel),
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
};

// Elemente pentru rucsac/inventar
export const mockBackpackItems: (InventoryItem | null)[] = [
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
  // Completați cu restul elementelor conform nevoilor
];

export default {
  getItemPath,
  generateEquipment,
  mockBackpackItems
}; 