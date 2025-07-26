
import { useEffect, useState } from 'react';

interface AutoTopicSelection {
  subject: 'math' | 'english';
  topic: string;
  questionCount: number;
  autoStart?: boolean;
}

export const useAutoTopicSelection = () => {
  const [autoSelection, setAutoSelection] = useState<AutoTopicSelection | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selectedQuizTopic');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Auto-selection loaded from localStorage:', parsed);
        setAutoSelection(parsed);
        // Clear after reading
        localStorage.removeItem('selectedQuizTopic');
      } catch (error) {
        console.error('Error parsing auto topic selection:', error);
        localStorage.removeItem('selectedQuizTopic');
      }
    }
  }, []);

  const clearAutoSelection = () => {
    setAutoSelection(null);
    localStorage.removeItem('selectedQuizTopic');
  };

  return {
    autoSelection,
    clearAutoSelection
  };
};
