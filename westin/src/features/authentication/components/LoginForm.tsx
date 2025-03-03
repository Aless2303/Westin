// src/features/authentication/components/LoginForm.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isFormValid: boolean;
  handleLogin: (e: React.FormEvent) => void;
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
  handleLogin,
  switchToRegister,
  switchToReset,
  setIsFormValid
}) => {
  // Aici trebuie pus useRouter() - în interiorul componentei
  const router = useRouter();

  // Handle username change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsFormValid(e.target.value.trim().length > 0 && password.trim().length > 0);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsFormValid(username.trim().length > 0 && e.target.value.trim().length > 0);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
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

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          className={`w-full py-3 px-4 bg-gradient-to-b from-metin-gold to-metin-gold/80 text-metin-dark font-bold rounded-lg shadow-md transition-all duration-300 ${
            !isFormValid
              ? "opacity-60 cursor-not-allowed"
              : "hover:from-metin-gold/90 hover:to-metin-gold/70 hover:shadow-lg active:transform active:scale-98"
          }`}
          disabled={!isFormValid}
        >
          Intră în luptă
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

      {/* Adăugăm butonul pentru pagina jocului */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => router.push('/game')}
          className="w-full py-3 px-4 bg-gradient-to-b from-blue-500 to-blue-600 text-metin-light font-bold rounded-lg shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
        >
          Acces pagină joc
        </button>
      </div>
    </form>
  );
};

export default LoginForm;