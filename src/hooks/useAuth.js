import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getMe } from '../services/authService';
export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && !user) {
      getMe().then(res => setUser(res.data)).catch(() => logout());
    }
  }, [isAuthenticated]);
  return { user, isAuthenticated, logout };
};
