import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our authentication state
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  username: null,
  login: async () => false,
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps app and makes auth object available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Login function - would connect to your backend
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // This would be replaced with actual API call
      console.log('Login attempt with:', { username, password });
      
      // Simulate successful login
      setIsAuthenticated(true);
      setUsername(username);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
  };

  // Value provided to consuming components
  const value = {
    isAuthenticated,
    username,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;