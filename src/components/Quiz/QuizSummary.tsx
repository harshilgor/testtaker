
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Check, X, FileText } from 'lucide-react';

interface QuizSummaryProps {
  mode: 'quiz' | 'marathon';
  userName: string;
  quizResults: any;
  sessionPoints: number;
  onComplete: (results: any) => void;
  onViewDetailed?: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({
  mode,
  userName,
  quizResults,
  sessionPoints,
  onComplete,
  onViewDetailed
}) => {
  const accuracy = Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100);

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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === 'marathon' ? 'Marathon' : 'Quiz'} Complete!
            </h2>
            <p className="text-slate-600">Great job, {userName}!</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Questions Attempted</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{quizResults.totalQuestions}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Check className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Correct Answers</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{quizResults.correctAnswers}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="flex items-center justify-center mb-2">
                <X className="h-6 w-6 text-slate-600 mr-2" />
                <span className="text-sm text-slate-700 font-medium">Wrong Answers</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{quizResults.totalQuestions - quizResults.correctAnswers}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Points Earned</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{sessionPoints}</div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
            <div className="text-slate-600">Overall Accuracy</div>
          </div>

          <div className="flex justify-center space-x-4">
            {onViewDetailed && (
              <Button
                onClick={onViewDetailed}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Results
              </Button>
            )}
            <Button
              onClick={() => onComplete(quizResults)}
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

export default QuizSummary;
