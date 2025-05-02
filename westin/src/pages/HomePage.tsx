'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormState } from '../hooks/useFormState';
import { useFormValidation } from '../features/authentication/hooks/useFormValidation';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import MainLayout from '../layouts/MainLayout';
import FormContainer from '../components/ui/FormContainer';
import { LoginForm, RegisterForm, ResetPasswordForm, ResetPasswordConfirmForm } from '../features/authentication';
import { APP_NAME, APP_SUBTITLE } from '../data/constants';
import { passwordService } from '../services/api';

const HomePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

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
    setFormMode,
    resetForm,
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

  // Use auth handlers hook
  const { handleLogin, handleRegister, handleResetPassword } = useAuthHandlers({
    username,
    password,
    email,
    confirmPassword,
    isFormValid,
    setResetSuccessMessage,
    switchToLogin
  });

  // Verifică token-ul de resetare
  useEffect(() => {
    if (!resetToken) return;

    setIsValidatingToken(true);
    
    const validateToken = async () => {
      try {
        await passwordService.validateToken(resetToken);
        setIsValidToken(true);
        setFormMode('reset-confirm');
      } catch (error: any) {
        setTokenError(error.message || 'Token-ul de resetare este invalid sau a expirat');
        setIsValidToken(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [resetToken]);

  // Dacă URL-ul conține un token, verifică-l și afișează formularul corespunzător
  if (resetToken) {
    if (isValidatingToken) {
      return (
        <MainLayout>
          <FormContainer title={APP_NAME} subtitle={APP_SUBTITLE}>
            <div className="text-center text-metin-light">
              <p>Se verifică token-ul de resetare...</p>
            </div>
          </FormContainer>
        </MainLayout>
      );
    }

    if (!isValidToken) {
      return (
        <MainLayout>
          <FormContainer title={APP_NAME} subtitle={APP_SUBTITLE}>
            <div className="p-4 bg-red-500/20 border border-red-600 rounded-lg text-metin-light text-center">
              <p>{tokenError || 'Token-ul de resetare este invalid sau a expirat'}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 py-2 px-4 bg-gradient-to-b from-metin-gold to-metin-gold/80 text-metin-dark font-bold rounded-lg shadow-md transition-all duration-300 hover:from-metin-gold/90 hover:to-metin-gold/70"
              >
                Înapoi la login
              </button>
            </div>
          </FormContainer>
        </MainLayout>
      );
    }
  }

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

        {formMode === 'reset-confirm' && resetToken && (
          <ResetPasswordConfirmForm 
            token={resetToken} 
            onSuccess={() => {
              setResetSuccessMessage('Parola a fost schimbată cu succes');
              setTimeout(() => {
                switchToLogin();
                router.push('/');
              }, 3000);
            }}
          />
        )}
      </FormContainer>
    </MainLayout>
  );
};

export default HomePage;