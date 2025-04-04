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
  },
  {
    id: "player3",
    name: "ShadowArcher",
    level: 132,
    race: "Ninja",
    gender: "Masculin",
    x: 520,
    y: 410,
    image: "/Races/Masculin/Ninja.png",
    hp: {
      current: 6100,
      max: 6400
    },
    attack: 5800,
    defense: 210,
    experience: {
      current: 290100,
      percentage: 92
    },
    rank: 3
  },
  {
    id: "player4",
    name: "DarkSorcerer",
    level: 118,
    race: "Sura",
    gender: "Feminin",
    x: 610,
    y: 520,
    image: "/Races/Feminin/Sura.png",
    hp: {
      current: 5900,
      max: 6100
    },
    attack: 6200,
    defense: 190,
    experience: {
      current: 214000,
      percentage: 78
    },
    rank: 4
  },
  {
    id: "player5",
    name: "IronFist",
    level: 99,
    race: "Warrior",
    gender: "Masculin",
    x: 550,
    y: 480,
    image: "/Races/Masculin/Warrior.png",
    hp: {
      current: 7500,
      max: 7500
    },
    attack: 3800,
    defense: 320,
    experience: {
      current: 178400,
      percentage: 45
    },
    rank: 5
  }
];

export default mockPlayers; 