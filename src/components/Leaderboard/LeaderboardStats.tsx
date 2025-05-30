
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LeaderboardHeader from './LeaderboardHeader';

interface LeaderboardStatsProps {
  onBack: () => void;
  isLoading?: boolean;
  error?: any;
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ onBack, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-4 md:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <LeaderboardHeader onBack={onBack} />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-4 md:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <LeaderboardHeader onBack={onBack} />
          <Card className="border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600 text-center">Failed to load leaderboard. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default LeaderboardStats;
