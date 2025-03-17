// Define the base mob type interface
export interface MobType {
    name: string;
    x: number;
    y: number;
    type: "boss" | "metin";
    level: number;
    hp: number;
    attack: number;
    exp: number;
    yang: number;
    image: string;
  }