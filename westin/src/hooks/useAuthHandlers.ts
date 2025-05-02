// src/hooks/useAuthHandlers.ts
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

interface UseAuthHandlersProps {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  isFormValid: boolean;
  setResetSuccessMessage: (message: string) => void;
  switchToLogin: () => void;
}

export const useAuthHandlers = ({
  username,
  password,
  email,
  confirmPassword,
  isFormValid,
  setResetSuccessMessage,
  switchToLogin
}: UseAuthHandlersProps) => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login event
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsLoading(true);
      setError(null);
      
      try {
        const success = await login(username, password);
        
        if (success) {
          router.push('/game');
        } else {
          setError('Autentificare eșuată. Verifică username-ul și parola.');
        }
      } catch (error) {
        setError('A apărut o eroare la autentificare.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle registration event
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsLoading(true);
      setError(null);
      
      try {
        await authService.register({
          username,
          email,
          password,
          characterName: username, // Folosim username-ul ca nume inițial
          race: 'Warrior', // Valoare implicită, va fi schimbată în pagina FirstLoginPage
          gender: 'Masculin' // Valoare implicită, va fi schimbată în pagina FirstLoginPage
        });
        
        // Redirecționează la login
        switchToLogin();
      } catch (error: any) {
        setError(error.message || 'A apărut o eroare la înregistrare.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle password reset event
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Implementarea reală ar trebui să facă o cerere la backend
        // Momentan simulăm un răspuns de succes
        setTimeout(() => {
          setResetSuccessMessage(`Un email cu instrucțiuni de resetare a parolei a fost trimis la adresa ${email}.`);
          
          // Reset form after 5 seconds and return to login page
          setTimeout(() => {
            switchToLogin();
            setResetSuccessMessage('');
          }, 5000);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        setError('A apărut o eroare la trimiterea instrucțiunilor de resetare.');
        setIsLoading(false);
      }
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleResetPassword,
    isLoading,
    error
  };
};