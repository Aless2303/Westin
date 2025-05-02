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




// Exportă serviciile pentru a fi utilizate în aplicație
export default {
  auth: authService,
  password: passwordService,
  // Aici poți adăuga alte servicii pentru alte funcționalități
};