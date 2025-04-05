import { CharacterType } from '../../types/character';

// Datele hardcodate pentru caracterul principal
export const mockCharacterData: CharacterType = {
  name: "Ravensword",
  level: 134,
  race: "Ninja",
  gender: "Masculin",
  background: "/Backgrounds/western2.jpg",
  hp: {
    current: 6339,
    max: 7500,
  },
  stamina: {
    current: 84,
    max: 100,
  },
  experience: {
    current: 12345,
    percentage: 63,
  },
  x: 350,
  y: 611,
  attack: 5000,
  defense: 200
};

export default mockCharacterData; 
