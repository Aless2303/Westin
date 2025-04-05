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
  money: {
    cash: number;
    bank: number;
  };
  x: number;
  y: number;
  attack: number;
  defense: number;
  // Atribute de status
  attributes: {
    vitality: number;
    intelligence: number;
    strength: number;
    dexterity: number;
  };
  // Puncte disponibile pentru a fi distribuite
  availablePoints: number;
  // Șansa critică și damage-ul critică (derivate din intelligence)
  critChance: number;
  critDamage: number;
} 