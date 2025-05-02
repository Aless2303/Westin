// src/features/authentication/hooks/useFormValidation.ts
import { useEffect } from 'react';
import { validateLoginForm, validateRegisterForm, validateResetForm } from '../../../utils/formValidation';

export const useFormValidation = (
  formMode: 'login' | 'register' | 'reset' | 'reset-confirm',
  username: string,
  password: string,
  confirmPassword: string,
  email: string,
  setIsFormValid: (isValid: boolean) => void
) => {
  useEffect(() => {
    if (formMode === 'login') {
      setIsFormValid(validateLoginForm(username, password));
    } else if (formMode === 'register') {
      setIsFormValid(validateRegisterForm(username, password, confirmPassword, email));
    } else if (formMode === 'reset') {
      setIsFormValid(validateResetForm(username, email));
    } 
    // Nu validăm aici pentru reset-confirm, deoarece folosim validarea locală în componentă
  }, [formMode, username, password, confirmPassword, email, setIsFormValid]);
};