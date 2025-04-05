import { PlayerType } from "../../types/player";

// Jucători hardcodați pentru dueluri
export const mockPlayers: PlayerType[] = [
  {
    id: "player1",
    name: "KnightShadow",
    level: 120,
    race: "Warrior",
    gender: "Masculin",
    x: 484,
    y: 353,
    image: "/Races/Masculin/Warrior.png",
    hp: {
      current: 8200,
      max: 8200
    },
    attack: 4300,
    defense: 350,
    experience: {
      current: 234500,
      percentage: 87
    },
    rank: 1
  },
  {
    id: "player2",
    name: "WizardFrost",
    level: 145,
    race: "Shaman",
    gender: "Feminin",
    x: 689,
    y: 498,
    image: "/Races/Feminin/Shaman.png",
    hp: {
      current: 5800,
      max: 5800
    },
    attack: 6500,
    defense: 180,
    experience: {
      current: 318700,
      percentage: 65
    },
    rank: 2
  }
];

export default mockPlayers; 