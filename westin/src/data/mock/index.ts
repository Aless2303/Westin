// Mock data exports
export { default as mockCharacter } from './character';
export { default as mockMobs } from './mobs';
export { default as mockInventory } from './inventory';
export { default as mockPlayers } from './players';
export { default as mockReports } from './reports';
export { default as mockChat } from './chat';
export { users, authenticateUser, isAdminUser } from './users';

// Exportăm totul ca un singur obiect pentru a fi mai ușor de importat
import mockCharacter from './character';
import mockMobs from './mobs';
import mockInventory from './inventory';
import mockPlayers from './players';
import mockReports from './reports';
import mockChat from './chat';
import mockProfile from './profile';
import { items, itemsByCategory, allCategories } from './market-items';
import { users, authenticateUser, isAdminUser } from './users';

// Pentru a le importa pe toate deodată: import mockData from 'src/data/mock'
const mockData = {
  character: mockCharacter,
  mobs: mockMobs,
  inventory: mockInventory,
  players: mockPlayers,
  reports: mockReports,
  chat: mockChat,
  profile: mockProfile,
  users,
  auth: {
    authenticateUser,
    isAdminUser
  },
  market: {
    items,
    itemsByCategory,
    allCategories
  }
};

export default mockData; 