import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface UsePracticeTestPromptReturn {
  showPracticeTestPrompt: boolean;
  dismissPracticeTestPrompt: () => void;
  triggerPracticeTestPrompt: () => void;
}

export const usePracticeTestPrompt = (user: User | null): UsePracticeTestPromptReturn => {
  const [showPracticeTestPrompt, setShowPracticeTestPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has taken any practice tests
      const hasTakenPracticeTest = localStorage.getItem(`practice_test_taken_${user.id}`);
      const isNewUser = !hasTakenPracticeTest;
      
      // Also check if user was created recently (within last 10 minutes)
      const userCreatedAt = new Date(user.created_at);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const isRecentlyCreated = userCreatedAt > tenMinutesAgo;
      
      // Only show for new users who haven't taken practice tests
      if (isNewUser && isRecentlyCreated) {
        // Small delay to ensure the page is fully loaded
        const timer = setTimeout(() => {
          setShowPracticeTestPrompt(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const dismissPracticeTestPrompt = () => {
    setShowPracticeTestPrompt(false);
    if (user) {
      // Mark that user has dismissed the prompt (but not taken a test)
      localStorage.setItem(`practice_test_prompt_dismissed_${user.id}`, 'true');
    }
  };

  const triggerPracticeTestPrompt = () => {
    setShowPracticeTestPrompt(true);
  };

  return {
    showPracticeTestPrompt,
    dismissPracticeTestPrompt,
    triggerPracticeTestPrompt
  };
};
