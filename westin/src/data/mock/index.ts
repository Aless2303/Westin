// Mock data exports
export { default as mockCharacter } from './character';
export { default as mockMobs } from './mobs';
export { default as mockInventory } from './inventory';
export { default as mockPlayers } from './players';
export { default as mockReports } from './reports';

// Exportăm totul ca un singur obiect pentru a fi mai ușor de importat
import mockCharacter from './character';
import mockMobs from './mobs';
import mockInventory from './inventory';
import mockPlayers from './players';
import mockReports from './reports';

// Pentru a le importa pe toate deodată: import mockData from 'src/data/mock'
const mockData = {
  character: mockCharacter,
  mobs: mockMobs,
  inventory: mockInventory,
  players: mockPlayers,
  reports: mockReports
};

export default mockData; 