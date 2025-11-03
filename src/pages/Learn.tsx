import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ReviewMistakes from '@/components/Performance/ReviewMistakes';
import DomainSelector from '@/components/Learn/DomainSelector';
import { useHasSolvedQuestions } from '@/hooks/useHasSolvedQuestions';
import { useData } from '@/contexts/DataContext';
import { useQuestTracking } from '@/hooks/useQuestTracking';
// import QuestsSection from '@/components/Quests/QuestsSection';

interface LearnPageProps {
  userName: string;
  onBack: () => void;
}

const LearnPage: React.FC<LearnPageProps> = ({ userName, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasSolvedQuestions, loading } = useHasSolvedQuestions(user);
  const { questionAttempts, isInitialized } = useData();
  const { trackEvent } = useQuestTracking();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Track learn page visit for quest completion
  useEffect(() => {
    if (user?.id) {
      trackEvent('visit_learn');
    }
  }, [user?.id, trackEvent]);

  const handleTakeQuiz = () => {
    navigate('/quiz');
  };

  // Calculate mistakes from question attempts
  const mistakesData = React.useMemo(() => {
    if (!isInitialized || !questionAttempts.length) return [];
    return questionAttempts.filter(attempt => !attempt.is_correct);
  }, [questionAttempts, isInitialized]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learn & Improve</h1>
        </div>

        {/* Content area - blur only this section */}
        <div className={`${!hasSolvedQuestions ? 'blur-sm pointer-events-none' : ''}`}>
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Left Column: Domain Selector */}
            <div className="lg:sticky lg:top-20 self-start">
              <DomainSelector 
                selectedDomain={selectedDomain} 
                onDomainSelect={setSelectedDomain}
              />
            </div>

            {/* Right Column: Review Mistakes Section */}
            <div>
              <ReviewMistakes userName={userName} selectedDomain={selectedDomain} />
            </div>
          </div>

          {/* Quests Section - Temporarily disabled due to errors */}
          {/* <div className="mb-8">
            <QuestsSection userName={userName} />
          </div> */}
        </div>
      </div>

      {/* Simple overlay message when user hasn't solved questions */}
      {!hasSolvedQuestions && (
        <div className="fixed top-20 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Solve some questions first</h2>
            <p className="text-gray-600 mb-6">
              Take a practice quiz to unlock all learning features and get personalized recommendations.
            </p>
            <button
              onClick={handleTakeQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Practice Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnPage;
