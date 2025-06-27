
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Eye, Home, RefreshCw, TrendingUp } from 'lucide-react';

interface MockTestAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

interface MockTestQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface SATMockTestResultsProps {
  answers: Map<string, MockTestAnswer>;
  questions: MockTestQuestion[];
  totalTimeSpent: number;
  onRetakeTest: () => void;
  onBackToHome: () => void;
}

const SATMockTestResults: React.FC<SATMockTestResultsProps> = ({
  answers,
  questions,
  totalTimeSpent,
  onRetakeTest,
  onBackToHome
}) => {
  const [showReview, setShowReview] = useState(false);

  // Calculate scores
  const readingWritingQuestions = questions.filter(q => q.section === 'reading-writing');
  const mathQuestions = questions.filter(q => q.section === 'math');
  
  const readingWritingCorrect = readingWritingQuestions.filter(q => {
    const answer = answers.get(q.id);
    return answer?.isCorrect;
  }).length;
  
  const mathCorrect = mathQuestions.filter(q => {
    const answer = answers.get(q.id);
    return answer?.isCorrect;
  }).length;

  const totalCorrect = readingWritingCorrect + mathCorrect;
  const totalQuestions = questions.length;
  const accuracy = Math.round((totalCorrect / totalQuestions) * 100);

  // Convert to SAT scale (simplified calculation)
  const readingWritingScore = Math.round(200 + (readingWritingCorrect / readingWritingQuestions.length) * 600);
  const mathScore = Math.round(200 + (mathCorrect / mathQuestions.length) * 600);
  const totalScore = readingWritingScore + mathScore;

  // Mock data for comparison (in real app, this would come from backend)
  const percentileRank = Math.min(95, Math.round((totalScore / 1600) * 100));
  const improvementFromLast = 40; // Mock improvement

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  if (showReview) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setShowReview(false)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowUp className="h-4 w-4 rotate-90" />
              <span>Back to Results</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Question Review</h1>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers.get(question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              
              return (
                <Card key={question.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          question.section === 'reading-writing' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {question.section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
                        </span>
                        <span className="text-sm text-gray-600">{question.topic}</span>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {question.content}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-900'
                              : optionIndex === userAnswer?.selectedAnswer && !isCorrect
                              ? 'bg-red-50 border-red-300 text-red-900'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">(Correct Answer)</span>
                          )}
                          {optionIndex === userAnswer?.selectedAnswer && userAnswer.selectedAnswer !== question.correctAnswer && (
                            <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">SAT Practice Test Complete!</h1>
          <p className="text-indigo-200">Your detailed performance breakdown</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Total Score Panel - Left Side */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Total Score</h2>
              
              <div className="text-6xl md:text-7xl font-bold mb-4">{totalScore}</div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-green-400 text-green-900 px-4 py-2 rounded-full flex items-center space-x-2">
                  <ArrowUp className="h-4 w-4" />
                  <span className="font-medium">{improvementFromLast} pts</span>
                </div>
                <span className="text-indigo-200">from Your Last Test</span>
              </div>

              {/* Goal Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-indigo-200">Goal:</span>
                  <span className="text-sm text-indigo-200">1560</span>
                </div>
                <div className="bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (totalScore / 1560) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-indigo-300 mt-1">
                  <span>400</span>
                  <span>1600</span>
                </div>
              </div>

              {/* Section Scores */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reading & Writing</h3>
                  <div className="text-3xl font-bold">{readingWritingScore}</div>
                  <div className="text-indigo-300">{readingWritingCorrect}/{readingWritingQuestions.length}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Math</h3>
                  <div className="text-3xl font-bold">{mathScore}</div>
                  <div className="text-indigo-300">{mathCorrect}/{mathQuestions.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Comparison - Right Side */}
          <div className="space-y-6">
            {/* Percentile Comparison */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Your Score & Percentile</h2>
                <p className="text-indigo-200 mb-4">
                  You scored higher than {percentileRank}% of test takers.
                </p>
                
                {/* Mock Bell Curve */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 100">
                    <path
                      d="M 0 80 Q 100 20 200 30 Q 300 20 400 80"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                    </defs>
                    {/* You marker */}
                    <circle cx={320} cy={35} r="4" fill="#10B981" />
                    <text x={325} y={30} fill="white" fontSize="12" fontWeight="bold">You</text>
                  </svg>
                </div>
                
                <p className="text-xs text-indigo-300 mt-2">
                  Aggregate data has been normalized to remove outliers and abstracted for ease of
                  reading. Differences can exist between test-takers.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-400 to-green-500 text-green-900">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
                  <div className="text-4xl font-bold">{accuracy}%</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-300 to-pink-300 text-purple-900">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Total Time</h3>
                  <div className="text-4xl font-bold">{formatTime(totalTimeSpent)}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setShowReview(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 flex items-center space-x-2"
          >
            <Eye className="h-5 w-5" />
            <span>Review All Questions</span>
          </Button>
          
          <Button
            onClick={onRetakeTest}
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 flex items-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Retake Test</span>
          </Button>
          
          <Button
            onClick={onBackToHome}
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 flex items-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SATMockTestResults;
