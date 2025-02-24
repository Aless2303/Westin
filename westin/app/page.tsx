'use client';

import { useState } from 'react';

export default function Home() {
  // State pentru câmpuri de login și înregistrare
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  
  // State pentru a controla ce formular se afișează (login, înregistrare sau resetare parolă)
  const [formMode, setFormMode] = useState<'login' | 'register' | 'reset'>('login');

  // Verificare validitate formular de login
  const checkLoginFormValidity = (username: string, password: string) => {
    setIsFormValid(username.trim().length > 0 && password.trim().length > 0);
  };

  // Verificare validitate formular de înregistrare
  const checkRegisterFormValidity = (username: string, password: string, confirmPassword: string, email: string) => {
    const isUsernameValid = username.trim().length > 0;
    const isPasswordValid = password.trim().length > 0;
    const isConfirmPasswordValid = password === confirmPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    setIsFormValid(isUsernameValid && isPasswordValid && isConfirmPasswordValid && isEmailValid);
  };

  // Verificare validitate formular de resetare parolă
  const checkResetFormValidity = (username: string, email: string) => {
    const isUsernameValid = username.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    setIsFormValid(isUsernameValid && isEmailValid);
  };

  // Gestionare eveniment de login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Login attempt with:', { username, password });
      // Aici vei adăuga logica reală de login mai târziu (conectare la backend)
    }
  };

  // Gestionare eveniment de înregistrare
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Register attempt with:', { username, password, email });
      // Aici vei adăuga logica reală de înregistrare mai târziu (conectare la backend)
      
      // Resetare formular și întoarcere la pagina de login
      resetForm();
      setFormMode('login');
      
      // Aici ar trebui adăugat un mesaj de succes pentru utilizator
    }
  };

  // Gestionare eveniment de resetare parolă
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Password reset request for:', { username, email });
      // Aici vei adăuga logica reală de resetare mai târziu (conectare la backend)
      
      // Afișează mesajul de succes
      setResetSuccessMessage(`Un email cu instrucțiuni de resetare a parolei a fost trimis la adresa ${email}.`);
      
      // Resetare formular după 5 secunde și întoarcere la pagina de login
      setTimeout(() => {
        resetForm();
        setFormMode('login');
        setResetSuccessMessage('');
      }, 5000);
    }
  };

  // Resetarea formularului
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setIsFormValid(false);
  };

  // Comutare la formularul de login
  const switchToLogin = () => {
    resetForm();
    setFormMode('login');
  };

  // Comutare la formularul de înregistrare
  const switchToRegister = () => {
    resetForm();
    setFormMode('register');
  };

  // Comutare la formularul de resetare parolă
  const switchToReset = () => {
    resetForm();
    setFormMode('reset');
  };

  return (
    <div 
      className="min-h-screen w-full h-full flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url('/westin.jpg')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(14, 9, 6, 0.4)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="relative w-full max-w-md p-8 bg-metin-dark/90 backdrop-blur-lg rounded-xl border-2 border-metin-gold/30 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-up">
        {/* Decorative elements */}
        <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-metin-gold/60 rounded-tl-lg"></div>
        <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-metin-gold/60 rounded-tr-lg"></div>
        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-metin-gold/60 rounded-bl-lg"></div>
        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-metin-gold/60 rounded-br-lg"></div>
        
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif text-metin-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse-slow">
            Westin
          </h1>
          <p className="mt-2 text-metin-light/80 font-medium italic text-lg">
            Unde Vestul întâlnește Orientul
          </p>
          <div className="mx-auto mt-4 w-16 h-16 bg-metin-red/30 rounded-full border border-metin-gold/50 flex items-center justify-center animate-spin-slow overflow-hidden">
            <span className="text-metin-gold text-2xl font-bold">⚔</span>
          </div>
        </div>

        {formMode === 'login' && (
          // Formular de login
          <form onSubmit={handleLogin} className="space-y-5">
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
                    checkLoginFormValidity(e.target.value, password);
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkLoginFormValidity(username, e.target.value);
                  }}
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
          </form>
        )}

        {formMode === 'register' && (
          // Formular de înregistrare
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
                    checkRegisterFormValidity(e.target.value, password, confirmPassword, email);
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
                    checkRegisterFormValidity(username, password, confirmPassword, e.target.value);
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
                    checkRegisterFormValidity(username, e.target.value, confirmPassword, email);
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
                    checkRegisterFormValidity(username, password, e.target.value, email);
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
        )}

        {formMode === 'reset' && (
          // Formular de resetare parolă
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
                    checkResetFormValidity(e.target.value, email);
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
                    checkResetFormValidity(username, e.target.value);
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
        )}
      </div>
    </div>
  );
}