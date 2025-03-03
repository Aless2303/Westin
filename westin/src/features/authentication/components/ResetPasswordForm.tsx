import React from 'react';

interface ResetPasswordFormProps {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  isFormValid: boolean;
  resetSuccessMessage: string;
  handleResetPassword: (e: React.FormEvent) => void;
  switchToLogin: () => void;
  setIsFormValid: (value: boolean) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  username,
  setUsername,
  email,
  setEmail,
  isFormValid,
  resetSuccessMessage,
  handleResetPassword,
  switchToLogin,
  setIsFormValid
}) => {
  // Validation function
  const validateForm = (u: string, e: string) => {
    const isUsernameValid = u.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    
    setIsFormValid(isUsernameValid && isEmailValid);
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-medium text-metin-light">Resetare parolă</h2>
        <p className="text-metin-light/70 mt-2">
          Introdu numele de jucător și adresa de email asociată contului tău
        </p>
      </div>

      {resetSuccessMessage && (
        <div className="p-3 bg-green-800/40 border border-green-700 rounded-lg text-metin-light text-center">
          {resetSuccessMessage}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Nume jucător
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateForm(e.target.value, email);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="Introdu numele tău de erou"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-metin-light/90 tracking-wide">
          Adresă de email
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateForm(username, e.target.value);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="email@exemplu.com"
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
          Trimite instrucțiuni
        </button>
        <button
          type="button"
          onClick={switchToLogin}
          className="w-full py-3 px-4 bg-gradient-to-b from-metin-red to-metin-red/80 text-metin-light font-bold rounded-lg shadow-md transition-all duration-300 hover:from-metin-red/90 hover:to-metin-red/70 hover:shadow-lg active:transform active:scale-98"
        >
          Înapoi la login
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;