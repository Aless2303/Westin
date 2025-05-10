// Serviciu pentru interacțiunea cu API-ul

// URL-ul de bază al API-ului
const API_URL = 'http://localhost:5000/api';

// Funcție auxiliară pentru a face cereri HTTP
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Obține token-ul de autentificare din localStorage
  const token = localStorage.getItem('token');
  
  // Adaugă header-ele de autentificare dacă token-ul există
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  try {
    // Execută cererea
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });
    
    // Verifică dacă cererea a reușit
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'A apărut o eroare la server.' }));
      const error = new Error(errorData.message || 'A apărut o eroare la server.') as Error & { response?: { status: number, data: any } };
      error.response = { 
        status: response.status,
        data: errorData 
      };
      throw error;
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Servicii pentru autentificare
export const authService = {
  // Înregistrează un utilizator nou
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    characterName: string;
    race: string;
    gender: string;
  }) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Autentifică un utilizator
  login: async (username: string, password: string) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  // Obține profilul utilizatorului autentificat
  getProfile: async () => {
    return fetchWithAuth('/auth/profile');
  },
};

export const passwordService = {
  // Solicită resetarea parolei
  requestReset: async (username: string, email: string) => {
    return fetchWithAuth('/password/request-reset', {
      method: 'POST',
      body: JSON.stringify({ username, email }),
    });
  },
  
  // Validează token-ul de resetare
  validateToken: async (token: string) => {
    return fetchWithAuth(`/password/validate-token/${token}`);
  },
  
  // Resetează parola
  resetPassword: async (token: string, newPassword: string) => {
    return fetchWithAuth('/password/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

export const characterService = {
  // Actualizează detaliile personajului și marchează crearea ca finalizată
  updateCharacterCreation: async (characterId: string, characterData: Record<string, unknown>) => {
    return fetchWithAuth(`/characters/${characterId}/creation-complete`, {
      method: 'PUT',
      body: JSON.stringify(characterData),
    });
  },
  
  // Obține informații despre personaj
  getCharacter: async (characterId: string) => {
    return fetchWithAuth(`/characters/${characterId}`);
  },
  
  // Actualizează poziția personajului pe hartă
  updatePosition: async (characterId: string, x: number, y: number) => {
    return fetchWithAuth(`/characters/${characterId}/position`, {
      method: 'PUT',
      body: JSON.stringify({ x, y }),
    });
  },
  
  // Actualizează statisticile personajului (HP, stamina)
  updateStats: async (characterId: string, stats: { hp?: number, stamina?: number }) => {
    return fetchWithAuth(`/characters/${characterId}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  },
  
  // Actualizează banii personajului
  updateMoney: async (characterId: string, money: { cash?: number, bank?: number }) => {
    return fetchWithAuth(`/characters/${characterId}/money`, {
      method: 'PUT',
      body: JSON.stringify(money),
    });
  },
  
  // Obține clasamentul tuturor personajelor
  getLeaderboard: async () => {
    return fetchWithAuth('/characters/leaderboard');
  },
  
  // Obține experiența necesară pentru avansarea la nivelul următor
  getRequiredExperience: async (characterId: string) => {
    return fetchWithAuth(`/characters/${characterId}/required-exp`);
  },
};

// Inventory service
export const inventoryService = {
  // Obține inventarul personajului
  getInventory: async (characterId: string) => {
    return fetchWithAuth(`/inventory/${characterId}`);
  },
  
  // Adaugă un item în inventar
  addItem: async (characterId: string, itemId: string, quantity: number = 1, slot?: number) => {
    return fetchWithAuth(`/inventory/${characterId}/items`, {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity, slot }),
    });
  },
  
  // Echipează un item
  equipItem: async (characterId: string, itemId: string, slotType: string) => {
    return fetchWithAuth(`/inventory/${characterId}/equip`, {
      method: 'PUT',
      body: JSON.stringify({ itemId, slotType }),
    });
  },
  
  // Dezechipează un item
  unequipItem: async (characterId: string, slotType: string) => {
    return fetchWithAuth(`/inventory/${characterId}/unequip`, {
      method: 'PUT',
      body: JSON.stringify({ slotType }),
    });
  },
};

// Works
export const workService = {
  // Obține muncile personajului
  getWorks: async (characterId: string) => {
    return fetchWithAuth(`/works/${characterId}`);
  },
  
  // Creează o muncă nouă
  createWork: async (characterId: string, workData: Record<string, unknown>) => {
    return fetchWithAuth(`/works/${characterId}`, {
      method: 'POST',
      body: JSON.stringify(workData),
    });
  },
  
  // Șterge o muncă
  deleteWork: async (characterId: string, workId: string) => {
    return fetchWithAuth(`/works/${characterId}/${workId}`, {
      method: 'DELETE',
    });
  },
  
  // Actualizează o muncă
  updateWork: async (characterId: string, workId: string, workData: Record<string, unknown>) => {
    return fetchWithAuth(`/works/${characterId}/${workId}`, {
      method: 'PUT',
      body: JSON.stringify(workData),
    });
  },
};

// Reports
export const reportService = {
  // Obține rapoartele personajului
  getReports: async (characterId: string) => {
    return fetchWithAuth(`/reports/${characterId}`);
  },
  
  // Marchează un raport ca citit
  markAsRead: async (characterId: string, reportId: string) => {
    return fetchWithAuth(`/reports/${characterId}/${reportId}/read`, {
      method: 'PUT',
    });
  },
  
  // Marchează toate rapoartele ca citite
  markAllAsRead: async (characterId: string) => {
    return fetchWithAuth(`/reports/${characterId}/read-all`, {
      method: 'PUT',
    });
  },
  
  // Șterge un raport
  deleteReport: async (characterId: string, reportId: string) => {
    return fetchWithAuth(`/reports/${characterId}/${reportId}`, {
      method: 'DELETE',
    });
  },
  
  // Șterge mai multe rapoarte
  deleteMultipleReports: async (characterId: string, reportIds: string[]) => {
    return fetchWithAuth(`/reports/${characterId}/multiple`, {
      method: 'DELETE',
      body: JSON.stringify({ reportIds }),
    });
  },
  
  // Creează un nou raport
  createReport: async (characterId: string, reportData: {
    type: string;
    subject: string;
    content: string;
    read?: boolean;
    playerName?: string;
    mobName?: string;
    mobType?: string;
    result?: string;
    combatStats?: {
      playerHpLost: number;
      damageDealt: number;
      expGained: number;
      yangGained: number;
      totalRounds: number;
      remainingMobHp: number;
    };
  }) => {
    return fetchWithAuth(`/reports/${characterId}`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },
};

// Items service
export const itemService = {
  // Obține toate itemele
  getAllItems: async () => {
    return fetchWithAuth('/items');
  },
  
  // Obține un item specific
  getItem: async (itemId: string) => {
    return fetchWithAuth(`/items/${itemId}`);
  },
  
  // Obține itemele în funcție de filtru
  getItemsByFilter: async (filters: {
    type?: string;
    category?: string;
    raceRestriction?: string;
    requiredLevel?: number;
  }) => {
    // Construiește query string-ul
    const queryParams = new URLSearchParams();
    
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.raceRestriction) queryParams.append('raceRestriction', filters.raceRestriction);
    if (filters.requiredLevel) queryParams.append('requiredLevel', filters.requiredLevel.toString());
    
    const queryString = queryParams.toString();
    return fetchWithAuth(`/items/filter${queryString ? `?${queryString}` : ''}`);
  }
};

// Exportă serviciile pentru a fi utilizate în aplicație
export default {
  auth: authService,
  password: passwordService,
  character: characterService,
  inventory: inventoryService,
  work: workService,
  report: reportService,
  item: itemService
};