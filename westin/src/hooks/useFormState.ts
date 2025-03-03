import { useState } from 'react';

type FormMode = 'login' | 'register' | 'reset';

export const useFormState = () => {
  // Form fields state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  
  // Form mode state
  const [formMode, setFormMode] = useState<FormMode>('login');

  // Reset form fields
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setIsFormValid(false);
  };

  // Switch form modes
  const switchToLogin = () => {
    resetForm();
    setFormMode('login');
  };

  const switchToRegister = () => {
    resetForm();
    setFormMode('register');
  };

  const switchToReset = () => {
    resetForm();
    setFormMode('reset');
  };

  return {
    // Form fields
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
    
    // Form mode
    formMode,
    setFormMode,
    
    // Actions
    resetForm,
    switchToLogin,
    switchToRegister,
    switchToReset
  };
};