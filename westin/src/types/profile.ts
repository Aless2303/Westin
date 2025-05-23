// Profile types
export interface ProfileType {
  _id: string;
  name: string;
  level: number;
  race: string;
  gender: string;
  background: string;
  image?: string;
  hp: {
    current: number;
    max: number;
  };
  stamina: {
    current: number;
    max: number;
  };
  experience: {
    current: number;
    percentage: number;
  };
  duelsWon?: number;
  duelsLost?: number;
  motto?: string;
}

// Type for the equipment slots displayed in the profile
export type EquipmentPosition = 
  | 'weapon'     // 1 in the matrix
  | 'boots'      // 2 in the matrix
  | 'necklace'   // 3 in the matrix
  | 'bracelet'   // 4 in the matrix
  | 'earrings'   // 5 in the matrix
  | 'helmet'     // 6 in the matrix
  | 'armor'      // 7 in the matrix
  | 'shield';    // 8 in the matrix