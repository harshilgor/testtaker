import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReviewMistakes from '@/components/Performance/ReviewMistakes';
import DomainSelector from '@/components/Learn/DomainSelector';
import { useData } from '@/contexts/DataContext';
import { useQuestTracking } from '@/hooks/useQuestTracking';
// import QuestsSection from '@/components/Quests/QuestsSection';

interface LearnPageProps {
  userName: string;
  onBack: () => void;
}

const LearnPage: React.FC<LearnPageProps> = ({ userName, onBack }) => {
  const { user } = useAuth();
  const { questionAttempts, isInitialized } = useData();
  const { trackEvent } = useQuestTracking();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Track learn page visit for quest completion
  useEffect(() => {
    if (user?.id) {
      trackEvent('visit_learn');
    }
  }, [user?.id, trackEvent]);

  // Calculate mistakes from question attempts
  const mistakesData = React.useMemo(() => {
    if (!isInitialized || !questionAttempts.length) return [];
    return questionAttempts.filter(attempt => !attempt.is_correct);
  }, [questionAttempts, isInitialized]);


  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learn & Improve</h1>
        </div>

        {/* Content area */}
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
  );
};

export default LearnPage;
