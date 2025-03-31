import { Report } from "../../features/reports/types";

// Rapoarte inițiale de test
export const mockReports: Report[] = [
  {
    id: '1',
    type: 'duel',
    subject: 'Duel: KnightShadow vs Ravensword',
    timestamp: new Date(2024, 2, 15, 14, 30),
    content: 'Ai câștigat duelul împotriva jucătorului KnightShadow și ai primit 2500 yang și 800 puncte de experiență.',
    read: false,
    playerName: 'KnightShadow',
    result: 'victory'
  },
  {
    id: '2',
    type: 'attack',
    subject: 'Raport de atac: Metin de Foc',
    timestamp: new Date(2024, 2, 14, 9, 45),
    content: 'Ai învins Metinul de Foc și ai primit 5000 yang și 10000 puncte de experiență.',
    read: true,
    mobName: 'Metin de Foc',
    mobType: 'metin',
    result: 'victory'
  },
  {
    id: '3',
    type: 'attack',
    subject: 'Raport de atac: Lordul Dragon',
    timestamp: new Date(2024, 2, 12, 18, 20),
    content: 'Ai învins Lordul Dragon și ai primit iteme rare și 15000 puncte de experiență!',
    read: false,
    mobName: 'Lordul Dragon',
    mobType: 'boss',
    result: 'victory'
  },
  {
    id: '4',
    type: 'duel',
    subject: 'Duel: ShadowNinja vs Ravensword',
    timestamp: new Date(2024, 2, 10, 21, 15),
    content: 'Ai pierdut duelul împotriva jucătorului ShadowNinja. Trebuie să te antrenezi mai mult!',
    read: true,
    playerName: 'ShadowNinja',
    result: 'defeat'
  },
  {
    id: '5',
    type: 'attack',
    subject: 'Raport de atac: Metin de Gheață',
    timestamp: new Date(2024, 2, 8, 20, 0),
    content: 'Atacul tău asupra Metinului de Gheață a eșuat. Pregătește-te mai bine pentru următoarea încercare.',
    read: false,
    mobName: 'Metin de Gheață',
    mobType: 'metin',
    result: 'defeat'
  }
];

export default mockReports; 