import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Clock, Target, BookOpen, Brain, RefreshCw, Eye } from 'lucide-react';
import { SATQuestion } from '../data/satQuestions';

interface SATResultsProps {
  userName: string;
  moduleResults: Array<{
    section: 'reading-writing' | 'math';
    module: 1 | 2;
    score: number;
    totalQuestions: number;
    timeUsed: number;
  }>;
  answers: Map<string, any>;
  allQuestions: SATQuestion[];
  onBack: () => void;
  onRetake: () => void;
}

const SATResults: React.FC<SATResultsProps> = ({
  userName,
  moduleResults,
  answers,
  allQuestions,
  onBack,
  onRetake
}) => {
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [reviewSection, setReviewSection] = useState<'reading-writing' | 'math' | 'all'>('all');

  // Calculate scores (simplified scoring - in real SAT, it's more complex)
  const calculateSectionScore = (section: 'reading-writing' | 'math') => {
    const sectionResults = moduleResults.filter(r => r.section === section);
    const totalCorrect = sectionResults.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = sectionResults.reduce((sum, r) => sum + r.totalQuestions, 0);
    
    // Convert to 800-point scale (simplified)
    const percentage = totalCorrect / totalQuestions;
    return Math.round(200 + (percentage * 600));
  };

  const readingWritingScore = calculateSectionScore('reading-writing');
  const mathScore = calculateSectionScore('math');
  const totalScore = readingWritingScore + mathScore;

  // Calculate topic-wise performance
  const getTopicPerformance = () => {
    const topicStats: Record<string, { correct: number; total: number }> = {};
    
    allQuestions.forEach(question => {
      const userAnswer = answers.get(question.id);
      if (userAnswer) {
        if (!topicStats[question.topic]) {
          topicStats[question.topic] = { correct: 0, total: 0 };
        }
        topicStats[question.topic].total++;
        if (userAnswer.answer === question.correctAnswer) {
          topicStats[question.topic].correct++;
        }
      }
    });

    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));
  };

  const topicPerformance = getTopicPerformance();
  const totalTimeSpent = moduleResults.reduce((sum, r) => sum + r.timeUsed, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getQuestionsBySection = (section: 'reading-writing' | 'math' | 'all') => {
    if (section === 'all') return allQuestions;
    return allQuestions.filter(q => q.section === section);
  };

  if (showDetailedReview) {
    const questionsToReview = getQuestionsBySection(reviewSection);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setShowDetailedReview(false)}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setReviewSection('all')}
                variant={reviewSection === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All Questions
              </Button>
              <Button
                onClick={() => setReviewSection('reading-writing')}
                variant={reviewSection === 'reading-writing' ? 'default' : 'outline'}
                size="sm"
              >
                Reading & Writing
              </Button>
              <Button
                onClick={() => setReviewSection('math')}
                variant={reviewSection === 'math' ? 'default' : 'outline'}
                size="sm"
              >
                Math
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {questionsToReview.map((question, index) => {
              const userAnswer = answers.get(question.id);
              const isCorrect = userAnswer?.answer === question.correctAnswer;
              
              return (
                <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
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
                    {question.question}
                  </h3>
                  
                  {question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-900'
                              : optionIndex === userAnswer?.answer && !isCorrect
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
                          {optionIndex === userAnswer?.answer && userAnswer.answer !== question.correctAnswer && (
                            <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'grid-in' && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Your Answer:</span>
                        <span className={`font-mono text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {userAnswer?.answer || 'No answer'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                        <span className="font-mono text-lg text-green-600">
                          {question.correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SAT Practice Test Complete!</h1>
          <p className="text-gray-600">Great job, {userName}!</p>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">{totalScore}</div>
            <div className="text-gray-600">Total SAT Score (out of 1600)</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800 mb-1">{readingWritingScore}</div>
              <div className="text-blue-600 text-sm">Reading and Writing</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800 mb-1">{mathScore}</div>
              <div className="text-green-600 text-sm">Math</div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Questions Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {moduleResults.reduce((sum, r) => sum + r.totalQuestions, 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Time Spent</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(totalTimeSpent)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-2">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Overall Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((moduleResults.reduce((sum, r) => sum + r.score, 0) / 
                moduleResults.reduce((sum, r) => sum + r.totalQuestions, 0)) * 100)}%
            </div>
          </div>
        </div>

        {/* Topic Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
            Performance by Topic
          </h3>
          <div className="space-y-4">
            {topicPerformance.map((topic) => (
              <div key={topic.topic}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                  <span className="text-sm text-gray-600">
                    {topic.correct}/{topic.total} ({topic.percentage}%)
                  </span>
                </div>
                <Progress value={topic.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setShowDetailedReview(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Eye className="h-4 w-4 mr-2" />
            Review All Questions
          </Button>
          <Button
            onClick={onRetake}
            variant="outline"
            className="px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retake Test
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="px-6"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SATResults;
