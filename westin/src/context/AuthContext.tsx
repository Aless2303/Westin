'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  characterId: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verifică dacă există un token salvat în localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Încearcă să obții profilul utilizatorului utilizând token-ul
      authService.getProfile()
        .then(userData => {
          setCurrentUser(userData);
          setIsAdmin(userData.isAdmin);
        })
        .catch(() => {
          // În caz de eroare, șterge token-ul și setează utilizatorul ca null
          localStorage.removeItem('token');
          setCurrentUser(null);
          setIsAdmin(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
      
      // Salvează token-ul în localStorage
      localStorage.setItem('token', response.token);
      
      // Setează utilizatorul curent
      setCurrentUser({
        _id: response._id,
        username: response.username,
        email: response.email,
        isAdmin: response.isAdmin,
        characterId: response.characterId,
      });
      
      setIsAdmin(response.isAdmin);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;