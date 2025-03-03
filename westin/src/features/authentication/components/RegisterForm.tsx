import React from 'react';

interface RegisterFormProps {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isFormValid: boolean;
  handleRegister: (e: React.FormEvent) => void;
  switchToLogin: () => void;
  setIsFormValid: (value: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isFormValid,
  handleRegister,
  switchToLogin,
  setIsFormValid
}) => {
  // Validation function
  const validateForm = (
    u: string, 
    e: string, 
    p: string, 
    cp: string
  ) => {
    const isUsernameValid = u.trim().length > 0;
    const isPasswordValid = p.trim().length > 0;
    const isConfirmPasswordValid = p === cp;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    
    setIsFormValid(isUsernameValid && isPasswordValid && isConfirmPasswordValid && isEmailValid);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
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
              validateForm(e.target.value, email, password, confirmPassword);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="Alege numele tău de erou"
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
              validateForm(username, e.target.value, password, confirmPassword);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="email@exemplu.com"
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
            onChange={(e) => {
              setPassword(e.target.value);
              validateForm(username, email, e.target.value, confirmPassword);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="••••••••"
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
              validateForm(username, email, password, e.target.value);
            }}
            className="w-full px-4 py-3 bg-metin-brown/70 text-metin-light placeholder-metin-light/40 border border-metin-gold/20 rounded-lg focus:outline-none focus:border-metin-gold/60 focus:ring-1 focus:ring-metin-red/50 transition-all duration-300 hover:border-metin-gold/40"
            placeholder="••••••••"
          />
        </div>
        {password !== confirmPassword && confirmPassword && (
          <p className="text-metin-red text-sm">Parolele nu corespund!</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          className={`w-full py-3 px-4 bg-gradient-to-b from-metin-red to-metin-red/80 text-metin-light font-bold rounded-lg shadow-md transition-all duration-300 ${
            !isFormValid
              ? "opacity-60 cursor-not-allowed"
              : "hover:from-metin-red/90 hover:to-metin-red/70 hover:shadow-lg active:transform active:scale-98"
          }`}
          disabled={!isFormValid}
        >
          Creează cont
        </button>
        <button
          type="button"
          onClick={switchToLogin}
          className="w-full py-3 px-4 bg-gradient-to-b from-metin-gold to-metin-gold/80 text-metin-dark font-bold rounded-lg shadow-md transition-all duration-300 hover:from-metin-gold/90 hover:to-metin-gold/70 hover:shadow-lg active:transform active:scale-98"
        >
          Înapoi la login
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;