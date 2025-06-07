
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Award } from 'lucide-react';

interface MarathonSummaryProps {
  sessionStats: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    showAnswerUsed: number;
    timeSpent: number;
    pointsEarned: number;
  };
  onBackToDashboard: () => void;
  onBackToSettings: () => void;
  userName: string;
}

const MarathonSummary: React.FC<MarathonSummaryProps> = ({
  sessionStats,
  onBackToDashboard,
  onBackToSettings,
  userName
}) => {
  const accuracy = sessionStats.totalQuestions > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100) 
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
              accuracy >= 70 ? 'bg-blue-100' : accuracy >= 50 ? 'bg-slate-100' : 'bg-red-100'
            }`}>
              <Trophy className={`h-10 w-10 ${
                accuracy >= 70 ? 'text-blue-600' : accuracy >= 50 ? 'text-slate-600' : 'text-red-600'
              }`} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Marathon Complete!</h2>
            <p className="text-slate-600">Great job, {userName}!</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Questions Attempted</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{sessionStats.totalQuestions}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Correct Answers</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{sessionStats.correctAnswers}</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-red-600 mr-2" />
                <span className="text-sm text-red-700 font-medium">Wrong Answers</span>
              </div>
              <div className="text-2xl font-bold text-red-800">{sessionStats.incorrectAnswers}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-sm text-purple-700 font-medium">Total Points Earned</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">{sessionStats.pointsEarned}</div>
              <div className="text-xs text-purple-600 mt-1">Easy: 3pts • Medium: 6pts • Hard: 9pts</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
              <div className="text-slate-600">Overall Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-slate-600 mr-2" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">{formatTime(sessionStats.timeSpent)}</div>
              <div className="text-slate-600">Time Spent</div>
            </div>
          </div>

          {sessionStats.showAnswerUsed > 0 && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 mb-8 text-center">
              <div className="text-sm text-orange-700 mb-1">Show Answer Used</div>
              <div className="text-lg font-bold text-orange-800">{sessionStats.showAnswerUsed} times</div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onBackToSettings}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
            >
              New Marathon
            </Button>
            <Button
              onClick={onBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarathonSummary;
