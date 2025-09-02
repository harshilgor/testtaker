import React from 'react';
import ReviewMistakes from '@/components/Performance/ReviewMistakes';
// import QuestsSection from '@/components/Quests/QuestsSection';

interface LearnPageProps {
  userName: string;
  onBack: () => void;
}

const LearnPage: React.FC<LearnPageProps> = ({ userName, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learn & Improve</h1>
        </div>

        {/* Review Mistakes Section */}
        <div className="mb-8">
          <ReviewMistakes userName={userName} />
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
