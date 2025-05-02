import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const AuthCheck: React.FC = () => {
  const { currentUser, hasCreatedCharacter, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Dacă nu este autentificat, redirecționăm la pagina de login
      if (!currentUser) {
        router.push('/');
      } 
      // Dacă este autentificat, dar nu a creat personajul, redirecționăm la first-login
      else if (currentUser && !hasCreatedCharacter) {
        // Excludem redirecționarea dacă suntem deja pe pagina first-login
        if (window.location.pathname !== '/first-login') {
          router.push('/first-login');
        }
      }
      // Dacă este autentificat și a creat personajul, dar încearcă să acceseze first-login
      else if (currentUser && hasCreatedCharacter && window.location.pathname === '/first-login') {
        router.push('/game');
      }
    }
  }, [currentUser, hasCreatedCharacter, loading, router]);

  return null;
};

export default AuthCheck;