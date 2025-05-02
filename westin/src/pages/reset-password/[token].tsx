// src/pages/reset-password/[token].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { passwordService } from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import FormContainer from '../../components/ui/FormContainer';
import { ResetPasswordConfirmForm } from '../../features/authentication';
import { APP_NAME, APP_SUBTITLE } from '../../data/constants';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Verificăm token-ul
    const checkToken = async () => {
      try {
        await passwordService.validateToken(token as string);
        setIsValidToken(true);
      } catch (error: any) {
        setError(error.message || 'Token-ul de resetare este invalid sau a expirat');
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  if (!token || isLoading) {
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
            <p>{error || 'Token-ul de resetare este invalid sau a expirat'}</p>
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

  return (
    <MainLayout>
      <FormContainer title={APP_NAME} subtitle={APP_SUBTITLE}>
        <ResetPasswordConfirmForm token={token as string} />
      </FormContainer>
    </MainLayout>
  );
};

export default ResetPasswordPage;