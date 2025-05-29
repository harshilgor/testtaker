
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'harshilgor06@gmail.com';

export const useAdminAccess = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  return {
    isAdmin,
    adminEmail: ADMIN_EMAIL
  };
};
