import React from 'react';
import { useFormState } from '../hooks/useFormState';
import { useFormValidation } from '../features/authentication/hooks/useFormValidation';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import MainLayout from '../layouts/MainLayout';
import FormContainer from '../components/ui/FormContainer';
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