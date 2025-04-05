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
  experience: {
    current: number;
    percentage: number;
  };
  rank?: number;
  duelsWon?: number; // Adăugăm câmpurile opționale
  duelsLost?: number;
  motto?: string;
}