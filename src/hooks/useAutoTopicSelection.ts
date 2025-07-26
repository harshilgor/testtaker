
import { useEffect, useState } from 'react';

interface AutoTopicSelection {
  subject: 'math' | 'english';
  topic: string;
  questionCount: number;
}

export const useAutoTopicSelection = () => {
  const [autoSelection, setAutoSelection] = useState<AutoTopicSelection | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selectedQuizTopic');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAutoSelection(parsed);
        // Clear after reading
        localStorage.removeItem('selectedQuizTopic');
      } catch (error) {
        console.error('Error parsing auto topic selection:', error);
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
