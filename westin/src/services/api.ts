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
  
  // Execută cererea
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  // Verifică dacă cererea a reușit
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'A apărut o eroare la server.' }));
    throw new Error(error.message || 'A apărut o eroare la server.');
  }
  
  return response.json();
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

// Exportă serviciile pentru a fi utilizate în aplicație
export default {
  auth: authService,
  // Aici poți adăuga alte servicii pentru alte funcționalități
};