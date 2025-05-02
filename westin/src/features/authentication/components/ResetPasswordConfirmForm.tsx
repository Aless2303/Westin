// src/features/authentication/components/ResetPasswordConfirmForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { passwordService } from '../../../services/api';

interface ResetPasswordConfirmFormProps {
  token: string;
}

const ResetPasswordConfirmForm: React.FC<ResetPasswordConfirmFormProps> = ({ token }) => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation function
  const validateForm = (p: string, cp: string) => {
    const isPasswordValid = p.length >= 6;
    const isConfirmPasswordValid = p === cp;
    
    setIsFormValid(isPasswordValid && isConfirmPasswordValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await passwordService.resetPassword(token, newPassword);
      setSuccess('Parola a fost schimbată cu succes');
      
      // Redirecționare către pagina de login după 3 secunde
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'A apărut o eroare la resetarea parolei');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-medium text-metin-light">Resetare parolă</h2>
        <p className="text-metin-light/70 mt-2">
          Setează o nouă parolă pentru contul tău
        </p>
      </div>

      {success && (
        <div className="p-3 bg-green-800/40 border border-green-700 rounded-lg text-metin-light text-center">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Parolă nouă
        </label>
        <div className="relative">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validateForm(e.target.value, confirmPassword);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="Introduceți noua parolă"
            minLength={6}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Confirmă parola
        </label>
        <div className="relative">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateForm(newPassword, e.target.value);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="Confirmați parola"
            required
          />
        </div>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-metin-red text-sm">Parolele nu coincid!</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-600 rounded-lg text-metin-light text-center">
          {error}
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
          {isLoading ? 'Se procesează...' : 'Resetează parola'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full py-3 px-4 bg-gradient-to-b from-metin-red to-metin-red/80 text-metin-light font-bold rounded-lg shadow-md transition-all duration-300 hover:from-metin-red/90 hover:to-metin-red/70 hover:shadow-lg active:transform active:scale-98"
        >
          Înapoi la login
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordConfirmForm;