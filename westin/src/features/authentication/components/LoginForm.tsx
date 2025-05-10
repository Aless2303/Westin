// src/features/authentication/components/LoginForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface LoginFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isFormValid: boolean;
  switchToRegister: () => void;
  switchToReset: () => void;
  setIsFormValid: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  isFormValid,
  switchToRegister,
  switchToReset,
  setIsFormValid
}) => {
  const router = useRouter();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle username change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsFormValid(e.target.value.trim().length > 0 && password.trim().length > 0);
    setLoginError(null);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsFormValid(username.trim().length > 0 && e.target.value.trim().length > 0);
    setLoginError(null);
  };

  // Handle the login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormValid) {
      setIsLoading(true);
      try {
        const success = await login(username, password);
        
        if (success) {
          router.push('/game');
        } else {
          setLoginError('Utilizator sau parolă incorecte');
        }
      } catch (error: any) {
        if (error.isBanned) {
          setLoginError('Acest cont a fost blocat. Pentru detalii, contactați milea84.am@gmail.com');
        } else {
          setLoginError('A apărut o eroare. Te rugăm să încerci din nou.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Nume jucător
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="Introdu numele tău de erou"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Parolă
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="••••••••"
          />
        </div>
      </div>

      {loginError && (
        <div className="bg-red-500/20 border border-red-600 text-red-100 px-4 py-2 rounded-lg">
          {loginError}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          className={`w-full py-3 px-4 bg-gradient-to-b from-metin-gold to-metin-gold/80 text-metin-dark font-bold rounded-lg shadow-md transition-all duration-300 ${
            !isFormValid || isLoading
              ? "opacity-60 cursor-not-allowed"
              : "hover:from-metin-gold/90 hover:to-metin-gold/70 hover:shadow-lg active:transform active:scale-98"
          }`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Se încarcă...' : 'Intră în luptă'}
        </button>
        <button
          type="button"
          onClick={switchToRegister}
          className="w-full py-3 px-4 bg-gradient-to-b from-metin-red to-metin-red/80 text-metin-light font-bold rounded-lg shadow-md transition-all duration-300 hover:from-metin-red/90 hover:to-metin-red/70 hover:shadow-lg active:transform active:scale-98"
        >
          Înscrie-te gratuit!
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={switchToReset}
          className="inline-block text-metin-gold/80 hover:text-metin-gold underline transition-all duration-300 text-md"
        >
          Ai uitat parola?
        </button>
      </div>

    </form>
  );
};

export default LoginForm;