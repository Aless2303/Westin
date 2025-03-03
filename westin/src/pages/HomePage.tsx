import React from 'react';
import { useFormState } from '../hooks/useFormState';
import { useFormValidation } from '../features/authentication/hooks/useFormValidation';
import MainLayout from '../layouts/MainLayout';
import FormContainer from '../components/ui/FormContainer'
import { LoginForm, RegisterForm, ResetPasswordForm } from '../features/authentication';
import { APP_NAME, APP_SUBTITLE } from '../data/constants';

const HomePage: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
    isFormValid,
    setIsFormValid,
    resetSuccessMessage,
    setResetSuccessMessage,
    formMode,
    switchToLogin,
    switchToRegister,
    switchToReset
  } = useFormState();

  // Use form validation hook
  useFormValidation(
    formMode,
    username,
    password,
    confirmPassword,
    email,
    setIsFormValid
  );

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
      switchToLogin();
      
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
        switchToLogin();
        setResetSuccessMessage('');
      }, 5000);
    }
  };

  return (
    <MainLayout>
      <FormContainer title={APP_NAME} subtitle={APP_SUBTITLE}>
        {formMode === 'login' && (
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            isFormValid={isFormValid}
            handleLogin={handleLogin}
            switchToRegister={switchToRegister}
            switchToReset={switchToReset}
            setIsFormValid={setIsFormValid}
          />
        )}

        {formMode === 'register' && (
          <RegisterForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isFormValid={isFormValid}
            handleRegister={handleRegister}
            switchToLogin={switchToLogin}
            setIsFormValid={setIsFormValid}
          />
        )}

        {formMode === 'reset' && (
          <ResetPasswordForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            isFormValid={isFormValid}
            resetSuccessMessage={resetSuccessMessage}
            handleResetPassword={handleResetPassword}
            switchToLogin={switchToLogin}
            setIsFormValid={setIsFormValid}
          />
        )}
      </FormContainer>
    </MainLayout>
  );
};

export default HomePage;