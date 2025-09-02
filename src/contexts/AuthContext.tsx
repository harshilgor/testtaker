
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication cleanup utility
const cleanupAuthState = () => {
  console.log('Cleaning up authentication state...');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Also clean up mock authentication data
  localStorage.removeItem('mockSession');
  localStorage.removeItem('mockUser');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Check for mock authentication first
    const mockSession = localStorage.getItem('mockSession');
    const mockUser = localStorage.getItem('mockUser');
    
    if (mockSession === 'true' && mockUser) {
      try {
        const userData = JSON.parse(mockUser);
        console.log('Mock authentication detected:', userData.email);
        setUser(userData as any);
        setSession({ user: userData as any } as any);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing mock user data:', error);
        localStorage.removeItem('mockSession');
        localStorage.removeItem('mockUser');
      }
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully:', session.user.email);
          // Defer any additional data fetching to prevent deadlocks
          setTimeout(() => {
            console.log('Authentication complete, user ready');
          }, 0);
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          cleanupAuthState();
        }
        
        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session check:', session?.user?.email || 'No session');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Check if user is using mock authentication
      const mockSession = localStorage.getItem('mockSession');
      if (mockSession === 'true') {
        console.log('Signing out from mock authentication');
        localStorage.removeItem('mockSession');
        localStorage.removeItem('mockUser');
        setUser(null);
        setSession(null);
        console.log('Mock sign out complete');
        return;
      }
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global sign out error (continuing):', err);
      }
      
      // Update local state
      setUser(null);
      setSession(null);
      
      console.log('Sign out complete');
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
