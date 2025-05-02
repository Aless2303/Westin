'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService, characterService } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  characterId: string;
  hasCreatedCharacter: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
  hasCreatedCharacter: boolean;
  markCharacterCreated: (characterId: string, characterData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasCreatedCharacter, setHasCreatedCharacter] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verifică dacă există un token salvat în localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Încearcă să obții profilul utilizatorului utilizând token-ul
      authService.getProfile()
        .then(userData => {
          setCurrentUser({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            isAdmin: userData.isAdmin,
            characterId: userData.characterId,
            hasCreatedCharacter: userData.hasCreatedCharacter || false,
          });
          setIsAdmin(userData.isAdmin);
          setHasCreatedCharacter(userData.hasCreatedCharacter || false);
        })
        .catch(() => {
          // În caz de eroare, șterge token-ul și setează utilizatorul ca null
          localStorage.removeItem('token');
          setCurrentUser(null);
          setIsAdmin(false);
          setHasCreatedCharacter(false);
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
        hasCreatedCharacter: response.hasCreatedCharacter || false,
      });
      
      setIsAdmin(response.isAdmin);
      setHasCreatedCharacter(response.hasCreatedCharacter || false);
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
    setHasCreatedCharacter(false);
  };

  // Funcție pentru a marca personajul ca fiind creat
  const markCharacterCreated = async (characterId: string, characterData: any): Promise<boolean> => {
    try {
      const response = await characterService.updateCharacterCreation(characterId, characterData);
      setHasCreatedCharacter(true);
      
      // Actualizează și utilizatorul curent
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          hasCreatedCharacter: true
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to mark character as created:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isAdmin, 
      loading,
      hasCreatedCharacter,
      markCharacterCreated
    }}>
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