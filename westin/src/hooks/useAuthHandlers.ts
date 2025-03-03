import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

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

  // Handle login event
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Login attempt with:', { username, password });
      // Here you would integrate with backend authentication
      const success = await login(username, password);
      
      if (success) {
        router.push('/game');
      }
    }
  };

  // Handle registration event
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Register attempt with:', { username, password, email });
      // Here you would add the actual registration logic with backend integration
      
      // Reset form and return to login page
      switchToLogin();
      
      // Here you would add success message for the user
    }
  };

  // Handle password reset event
  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Password reset request for:', { username, email });
      // Here you would add the actual reset logic with backend integration
      
      // Display success message
      setResetSuccessMessage(`Un email cu instrucțiuni de resetare a parolei a fost trimis la adresa ${email}.`);
      
      // Reset form after 5 seconds and return to login page
      setTimeout(() => {
        switchToLogin();
        setResetSuccessMessage('');
      }, 5000);
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleResetPassword
  };
};