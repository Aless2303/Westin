// Tipul de date pentru elementele din inventar
export interface InventoryItem {
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

// Tipul de date pentru slot-urile echipate
export interface EquipmentSlot {
  id: string;
  name: string;
  item: InventoryItem | null;
  gridArea: string;
  size: 'small' | 'medium' | 'large';
} 