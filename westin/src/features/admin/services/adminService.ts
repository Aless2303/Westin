// Serviciu pentru funcționalitățile de administrare

const API_URL = 'http://localhost:5000/api';

// Funcție auxiliară pentru a face cereri HTTP cu autentificare
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
      let errorMessage = 'A apărut o eroare la server.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('API Error Details:', errorData);
      } catch (jsonError) {
        console.error('Failed to parse error response:', jsonError);
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
};

export const adminService = {
  // Obține toți jucătorii (personajele)
  getAllPlayers: async () => {
    try {
      return await fetchWithAuth('/admin/players');
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },
  
  // Obține un jucător specific după ID
  getPlayerById: async (playerId: string) => {
    try {
      return await fetchWithAuth(`/admin/players/${playerId}`);
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      throw error;
    }
  },
  
  // Actualizează un jucător
  updatePlayer: async (playerId: string, playerData: {
    name?: string;
    level?: number;
    race?: string;
    gender?: string;
    hp?: { current: number; max: number };
    stamina?: { current: number; max: number };
    experience?: { current: number; percentage?: number; required: number };
    money?: { cash: number; bank: number };
    attack?: number;
    defense?: number;
    duelsWon?: number;
    duelsLost?: number;
    motto?: string;
  }) => {
    try {
      // Validăm datele înainte de a le trimite
      if (playerData.experience) {
        // Asigură-te că valorile sunt numere pozitive
        if (playerData.experience.current !== undefined && 
            (isNaN(playerData.experience.current) || playerData.experience.current < 0)) {
          throw new Error('Experiența curentă trebuie să fie un număr pozitiv.');
        }
        
        if (playerData.experience.required !== undefined && 
            (isNaN(playerData.experience.required) || playerData.experience.required <= 0)) {
          throw new Error('Experiența necesară trebuie să fie un număr pozitiv mai mare ca zero.');
        }
      }
      
      console.log('Sending player data update:', playerData);
      return await fetchWithAuth(`/admin/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(playerData),
      });
    } catch (error) {
      console.error(`Error updating player ${playerId}:`, error);
      throw error;
    }
  },
  
  // Șterge un jucător
  deletePlayer: async (playerId: string) => {
    try {
      return await fetchWithAuth(`/admin/players/${playerId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting player ${playerId}:`, error);
      throw error;
    }
  },

  // Banează/Debanează un jucător
  toggleBanStatus: async (playerId: string, isBanned: boolean) => {
    try {
      return await fetchWithAuth(`/admin/players/${playerId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ isBanned }),
      });
    } catch (error) {
      console.error(`Error toggling ban status for player ${playerId}:`, error);
      throw error;
    }
  },
};

export default adminService; 