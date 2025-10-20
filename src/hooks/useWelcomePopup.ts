import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface UseWelcomePopupReturn {
  showWelcomePopup: boolean;
  closeWelcomePopup: () => void;
  triggerWelcomePopup: () => void;
}

export const useWelcomePopup = (user: User | null): UseWelcomePopupReturn => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if this is a new user (first time logging in)
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`);
      const isNewUser = !hasSeenWelcome;
      
      // Also check if user was created recently (within last 5 minutes)
      const userCreatedAt = new Date(user.created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isRecentlyCreated = userCreatedAt > fiveMinutesAgo;
      
      // Only show for genuinely new users who haven't seen it before
      if (isNewUser && isRecentlyCreated) {
        // Small delay to ensure the dashboard is fully loaded
        const timer = setTimeout(() => {
          setShowWelcomePopup(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const closeWelcomePopup = () => {
    setShowWelcomePopup(false);
    if (user) {
      // Mark that user has seen the welcome popup
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  };

  const triggerWelcomePopup = () => {
    setShowWelcomePopup(true);
  };

  return {
    showWelcomePopup,
    closeWelcomePopup,
    triggerWelcomePopup
  };
};
