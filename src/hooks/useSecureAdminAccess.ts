
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminConfig {
  adminEmails: string[];
  adminUserIds: string[];
}

export const useSecureAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const { user } = useAuth();

  // Secure admin configuration - can be moved to Supabase settings later
  const defaultAdminEmails = [
    'suhailyusuf.ny@gmail.com'
  ];

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const logSecurityEvent = async (event: string, details: any = {}) => {
    try {
      console.log(`Security Event: ${event}`, details);
      
      // In the future, this would log to a security_logs table
      // For now, we just log to console
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // For now, use the default admin emails
      // In the future, this could be fetched from a database configuration
      let currentAdminEmails = defaultAdminEmails;

      const hasAdminAccess = currentAdminEmails.includes(user.email || '');
      
      if (hasAdminAccess !== isAdmin) {
        await logSecurityEvent('admin_access_check', {
          user_email: user.email,
          access_granted: hasAdminAccess,
          config_source: 'default'
        });
      }

      setIsAdmin(hasAdminAccess);
    } catch (error) {
      console.error('Error checking admin access:', error);
      await logSecurityEvent('admin_access_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const revokeAdminAccess = async () => {
    await logSecurityEvent('admin_access_revoked', {
      user_email: user?.email
    });
    setIsAdmin(false);
  };

  return {
    isAdmin,
    loading,
    adminConfig,
    checkAdminAccess,
    revokeAdminAccess,
    logSecurityEvent
  };
};
