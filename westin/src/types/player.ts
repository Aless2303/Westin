// Tipul de date pentru jucători (folosit pentru dueluri)
export interface PlayerType {
  id: string;
  name: string;
  level: number;
  race: string;
  gender: string;
  x: number;
  y: number;
  image: string;
  hp: {
    current: number;
    max: number;
  };
  attack: number;
  defense: number;
} 