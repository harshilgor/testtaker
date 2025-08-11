
// DEPRECATED: Use useSecureAdminAccess instead
// This file is kept for backward compatibility

import { useSecureAdminAccess } from './useSecureAdminAccess';

export const useAdminAccess = () => {
  const { isAdmin, loading } = useSecureAdminAccess();
  
  // Log deprecation warning
  console.warn('⚠️ useAdminAccess is deprecated. Please migrate to useSecureAdminAccess for enhanced security.');
  
  return { isAdmin, loading };
};
