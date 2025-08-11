
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Log to Supabase for audit trail
      if (user) {
        await supabase.from('security_logs').insert({
          user_id: user.id,
          event_type: event,
          details: details,
          ip_address: 'client-side', // In production, get from server
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }).catch(() => {
          // Fail silently if security_logs table doesn't exist yet
          console.log('Security logging not yet configured');
        });
      }
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

      // Try to get admin configuration from Supabase settings first
      const { data: configData } = await supabase
        .from('admin_config')
        .select('config')
        .single()
        .catch(() => ({ data: null }));

      let currentAdminEmails = defaultAdminEmails;
      
      if (configData?.config?.adminEmails) {
        currentAdminEmails = configData.config.adminEmails;
        setAdminConfig(configData.config);
      }

      const hasAdminAccess = currentAdminEmails.includes(user.email || '');
      
      if (hasAdminAccess !== isAdmin) {
        await logSecurityEvent('admin_access_check', {
          user_email: user.email,
          access_granted: hasAdminAccess,
          config_source: configData ? 'database' : 'default'
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
