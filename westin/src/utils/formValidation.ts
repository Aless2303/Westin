/**
 * Validates login form fields
 * @param username Username value
 * @param password Password value
 * @returns Whether the form is valid
 */
export const validateLoginForm = (username: string, password: string): boolean => {
    return username.trim().length > 0 && password.trim().length > 0;
  };
  
  /**
   * Validates registration form fields
   * @param username Username value
   * @param password Password value
   * @param confirmPassword Password confirmation
   * @param email Email address
   * @returns Whether the form is valid
   */
  export const validateRegisterForm = (
    username: string,
    password: string,
    confirmPassword: string,
    email: string
  ): boolean => {
    const isUsernameValid = username.trim().length > 0;
    const isPasswordValid = password.trim().length > 0;
    const isConfirmPasswordValid = password === confirmPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    return isUsernameValid && isPasswordValid && isConfirmPasswordValid && isEmailValid;
  };
  
  /**
   * Validates password reset form fields
   * @param username Username value
   * @param email Email address
   * @returns Whether the form is valid
   */
  export const validateResetForm = (username: string, email: string): boolean => {
    const isUsernameValid = username.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    return isUsernameValid && isEmailValid;
  };