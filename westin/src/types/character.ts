// Tipul de date pentru caracter
export interface CharacterType {
  name: string;
  level: number;
  race: string;
  gender: string;
  background: string;
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
  x: number;
  y: number;
  attack: number;
  defense: number;
} 