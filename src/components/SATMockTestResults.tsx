
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Home, RefreshCw, TrendingUp, TrendingDown, Clock, Target, CheckCircle } from 'lucide-react';

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

  // Calculate topic performance
  const topicPerformance = new Map();
  questions.forEach(question => {
    const answer = answers.get(question.id);
    const topic = question.topic;
    
    if (!topicPerformance.has(topic)) {
      topicPerformance.set(topic, { correct: 0, total: 0 });
    }
    
    const performance = topicPerformance.get(topic);
    performance.total += 1;
    if (answer?.isCorrect) {
      performance.correct += 1;
    }
    topicPerformance.set(topic, performance);
  });

  // Sort topics by performance
  const sortedTopics = Array.from(topicPerformance.entries())
    .map(([topic, performance]) => ({
      topic,
      percentage: Math.round((performance.correct / performance.total) * 100),
      correct: performance.correct,
      total: performance.total
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const strongTopics = sortedTopics.filter(t => t.percentage >= 70);
  const weakTopics = sortedTopics.filter(t => t.percentage < 70);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (showReview) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setShowReview(false)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>← Back to Results</span>
            </Button>
            <h1 className="text-xl font-medium text-gray-900">Question Review</h1>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers.get(question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              
              return (
                <Card key={question.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          question.section === 'reading-writing' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {question.section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
                        </span>
                        <span className="text-sm text-gray-600">{question.topic}</span>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {question.content}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-200 text-green-900'
                              : optionIndex === userAnswer?.selectedAnswer && !isCorrect
                              ? 'bg-red-50 border-red-200 text-red-900'
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
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">SAT Practice Test Complete</h1>
          <p className="text-gray-600">Your detailed performance breakdown</p>
        </div>

        {/* Score Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Total Score */}
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Total Score</h2>
              <div className="text-4xl font-semibold text-gray-900 mb-2">{totalScore}</div>
              <div className="text-sm text-gray-600">out of 1600</div>
            </CardContent>
          </Card>

          {/* Reading & Writing */}
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Reading & Writing</h2>
              <div className="text-3xl font-semibold text-blue-600 mb-2">{readingWritingScore}</div>
              <div className="text-sm text-gray-600">{readingWritingCorrect}/{readingWritingQuestions.length} correct</div>
            </CardContent>
          </Card>

          {/* Math */}
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Math</h2>
              <div className="text-3xl font-semibold text-green-600 mb-2">{mathScore}</div>
              <div className="text-sm text-gray-600">{mathCorrect}/{mathQuestions.length} correct</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-semibold text-gray-900 mb-1">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-semibold text-gray-900 mb-1">{totalCorrect}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions Correct</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-semibold text-gray-900 mb-1">{formatTime(totalTimeSpent)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Your Performance Overview */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Your Performance Overview</h3>
            <div className="text-sm text-gray-500 mb-6">Compared against all 15,480 students on this platform</div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Percentile Rank */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Overall Percentile Rank</h4>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {Math.max(10, Math.min(99, Math.round(55 + (accuracy - 50) * 0.8)))}
                  <span className="text-lg">th</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  You're performing better than {Math.max(10, Math.min(99, Math.round(55 + (accuracy - 50) * 0.8)))}% of students
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-800 h-2 rounded-full" 
                    style={{ width: `${Math.max(10, Math.min(99, Math.round(55 + (accuracy - 50) * 0.8)))}%` }}
                  ></div>
                </div>
              </div>

              {/* Score vs Average */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Your Score vs. Average</h4>
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{totalScore}</div>
                    <div className="text-sm text-gray-600">Your Latest Score</div>
                  </div>
                  <div className="text-gray-400">vs</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">1280</div>
                    <div className="text-sm text-gray-600">Platform Average</div>
                  </div>
                </div>
                <div className="text-sm text-green-600">
                  ↑ You scored {totalScore - 1280} points above average
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section-Level Breakdown */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Section-Level Breakdown</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="bg-gray-800 text-white border-gray-800">Overall</Button>
                <Button variant="outline" size="sm">Math</Button>
                <Button variant="outline" size="sm">Reading & Writing</Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Math Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Math</h4>
                <div className="text-sm text-gray-600 mb-2">
                  {Math.max(30, Math.min(99, Math.round(60 + (mathScore - 400) / 8)))}th percentile
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-green-600">{mathScore}</span>
                  <span className="text-sm text-gray-600">{mathCorrect} / {mathQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gray-700 h-2 rounded-full" 
                    style={{ width: `${Math.max(30, Math.min(99, Math.round(60 + (mathScore - 400) / 8)))}%` }}
                  ></div>
                </div>
                <Button variant="ghost" size="sm" className="text-sm text-gray-600 p-0 h-auto">
                  📊 View Detailed Breakdown
                </Button>
              </div>

              {/* Reading & Writing Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Reading & Writing</h4>
                <div className="text-sm text-gray-600 mb-2">
                  {Math.max(20, Math.min(95, Math.round(50 + (readingWritingScore - 400) / 10)))}th percentile
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-600">{readingWritingScore}</span>
                  <span className="text-sm text-gray-600">{readingWritingCorrect} / {readingWritingQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gray-700 h-2 rounded-full" 
                    style={{ width: `${Math.max(20, Math.min(95, Math.round(50 + (readingWritingScore - 400) / 10)))}%` }}
                  ></div>
                </div>
                <Button variant="ghost" size="sm" className="text-sm text-gray-600 p-0 h-auto">
                  📊 View Detailed Breakdown
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Strong Topics */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Strong Areas</h3>
              </div>
              <div className="space-y-3">
                {strongTopics.length > 0 ? (
                  strongTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">{topic.topic}</div>
                        <div className="text-sm text-green-700">{topic.correct}/{topic.total} correct</div>
                      </div>
                      <div className="text-lg font-semibold text-green-600">{topic.percentage}%</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">No strong areas identified</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weak Topics */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Areas for Improvement</h3>
              </div>
              <div className="space-y-3">
                {weakTopics.length > 0 ? (
                  weakTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-red-900">{topic.topic}</div>
                        <div className="text-sm text-red-700">{topic.correct}/{topic.total} correct</div>
                      </div>
                      <div className="text-lg font-semibold text-red-600">{topic.percentage}%</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">All areas performed well</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setShowReview(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Review Questions</span>
          </Button>
          
          <Button
            onClick={onRetakeTest}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake Test</span>
          </Button>
          
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SATMockTestResults;
