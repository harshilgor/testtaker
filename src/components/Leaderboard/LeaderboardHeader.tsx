
import React from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TimeFrame = 'all-time' | 'weekly' | 'monthly';

interface LeaderboardHeaderProps {
  onBack: () => void;
  timeFrame: TimeFrame;
  setTimeFrame: (frame: TimeFrame) => void;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ onBack, timeFrame, setTimeFrame }) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
      
      {/* Time Frame Selection */}
      <div className="flex space-x-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
        <Button
          onClick={() => setTimeFrame('all-time')}
          variant={timeFrame === 'all-time' ? 'default' : 'ghost'}
          className={`rounded-lg transition-all ${
            timeFrame === 'all-time' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          All Time
        </Button>
        <Button
          onClick={() => setTimeFrame('weekly')}
          variant={timeFrame === 'weekly' ? 'default' : 'ghost'}
          className={`rounded-lg transition-all ${
            timeFrame === 'weekly' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          This Week
        </Button>
        <Button
          onClick={() => setTimeFrame('monthly')}
          variant={timeFrame === 'monthly' ? 'default' : 'ghost'}
          className={`rounded-lg transition-all ${
            timeFrame === 'monthly' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          This Month
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardHeader;
