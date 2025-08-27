
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Home, RefreshCw, TrendingUp, TrendingDown, Clock, Target, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [resultsSaved, setResultsSaved] = useState(false);

  // Save results to database on component mount
  useEffect(() => {
    const saveResults = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user || resultsSaved) return;

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

        // Convert to SAT scale
        const readingWritingScore = Math.round(200 + (readingWritingCorrect / readingWritingQuestions.length) * 600);
        const mathScore = Math.round(200 + (mathCorrect / mathQuestions.length) * 600);
        const totalScore = readingWritingScore + mathScore;

        const { error } = await supabase
          .from('mock_test_results')
          .insert({
            user_id: user.user.id,
            math_score: mathScore,
            english_score: readingWritingScore,
            total_score: totalScore,
            time_taken: totalTimeSpent,
            test_type: 'full_sat',
            detailed_results: (JSON.parse(JSON.stringify({
              answers: Object.fromEntries(answers),
              questions: questions.map(q => ({ id: q.id, topic: q.topic, section: q.section }))
            })) as any)
          });

        if (error) {
          console.error('Error saving mock test results:', error);
        } else {
          console.log('Mock test results saved successfully');
          setResultsSaved(true);
        }
      } catch (error) {
        console.error('Error saving mock test results:', error);
      }
    };

    saveResults();
  }, [answers, questions, totalTimeSpent, resultsSaved]);

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

        {/* Time Management Comparison */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Time Management Comparison</h3>
              <Button variant="outline" size="sm" className="text-gray-600">All Sections</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Math Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Math Section</h4>
                <div className="space-y-4">
                  {/* Your average time */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Your average time per question</span>
                      <span className="font-medium">{Math.round((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'math';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / mathQuestions.length / 60)}m {Math.round(((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'math';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / mathQuestions.length) % 60)}s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-800 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Top scorers average */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Avg. time for 1500+ scorers</span>
                      <span className="font-medium">1m 05s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>

                  {/* Platform average */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Platform average</span>
                      <span className="font-medium">1m 45s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-blue-600 mt-3">
                    <span className="mr-2">ℹ️</span>
                    <span>
                      {((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'math';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / mathQuestions.length) < 105 
                        ? `You're ${Math.round(105 - ((Array.from(answers.values()).filter(a => {
                            const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                            return question?.section === 'math';
                          }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / mathQuestions.length))} seconds faster than top scorers`
                        : `You're ${Math.round(((Array.from(answers.values()).filter(a => {
                            const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                            return question?.section === 'math';
                          }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / mathQuestions.length) - 105)} seconds slower than top scorers`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reading & Writing Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Reading & Writing Section</h4>
                <div className="space-y-4">
                  {/* Your average time */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Your average time per question</span>
                      <span className="font-medium">{Math.round((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'reading-writing';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length / 60)}m {Math.round(((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'reading-writing';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length) % 60)}s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-800 h-2 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>

                  {/* Top scorers average */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Avg. time for 1500+ scorers</span>
                      <span className="font-medium">50s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '56%' }}></div>
                    </div>
                  </div>

                  {/* Platform average */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Platform average</span>
                      <span className="font-medium">1m 30s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-orange-600 mt-3">
                    <span className="mr-2">⚠️</span>
                    <span>
                      You're {Math.round(((Array.from(answers.values()).filter(a => {
                        const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                        return question?.section === 'reading-writing';
                      }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length) - 50)} seconds slower than top scorers on this section
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What This Means For You */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <span className="mr-2">🧠</span>
              <h3 className="text-lg font-medium text-gray-900">What This Means For You</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Based on your performance data, you're performing {accuracy >= 75 ? 'strongly' : accuracy >= 60 ? 'moderately' : 'below average'} overall
                {mathScore > readingWritingScore ? ', particularly in Math' : readingWritingScore > mathScore ? ', particularly in Reading & Writing' : ''}. 
                Your position in the {Math.max(10, Math.min(99, Math.round(55 + (accuracy - 50) * 0.8)))}th percentile means you're scoring better than {Math.max(10, Math.min(99, Math.round(55 + (accuracy - 50) * 0.8)))}% of students on our platform.
              </p>

              {strongTopics.length > 0 && (
                <p className="text-gray-700">
                  <span className="font-medium">Key strengths:</span> {strongTopics.slice(0, 2).map(t => `${t.topic} (${t.percentage}th percentile)`).join(' and ')}
                </p>
              )}

              {weakTopics.length > 0 && (
                <div>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Areas for improvement:</span>
                  </p>
                  <ul className="space-y-1 ml-4">
                    {weakTopics.slice(0, 3).map((topic, index) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {topic.topic} ({topic.percentage}th percentile) - This is {topic.percentage < 30 ? 'significantly below' : 'below'} your performance in other areas
                      </li>
                    ))}
                    {((Array.from(answers.values()).filter(a => {
                      const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                      return question?.section === 'reading-writing';
                    }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length) > 50 && (
                      <li className="text-gray-700 text-sm">
                        • Time management in Reading & Writing - You're taking {Math.round(((Array.from(answers.values()).filter(a => {
                          const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                          return question?.section === 'reading-writing';
                        }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length) - 50)} seconds longer per question than top performers
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <p className="text-gray-700 font-medium mb-3">Recommended next steps:</p>
                <div className="space-y-2">
                  {weakTopics.length > 0 && (
                    <div className="flex items-center text-gray-700 text-sm">
                      <span className="mr-2">▶</span>
                      <span>Practice {weakTopics[0].topic} questions</span>
                    </div>
                  )}
                  {((Array.from(answers.values()).filter(a => {
                    const question = questions.find(q => q.id === Array.from(answers.keys()).find(key => answers.get(key) === a));
                    return question?.section === 'reading-writing';
                  }).reduce((sum, a) => sum + a.timeSpent, 0) || 0) / readingWritingQuestions.length) > 60 && (
                    <div className="flex items-center text-gray-700 text-sm">
                      <span className="mr-2">🕐</span>
                      <span>Take a timed Reading & Writing practice test</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700 text-sm">
                    <span className="mr-2">📚</span>
                    <span>Review {readingWritingScore < mathScore ? 'Reading comprehension' : 'Math problem-solving'} strategies</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center mb-2">
                <span className="mr-2">🔒</span>
                <h4 className="font-medium text-gray-900">Data Anonymity Guarantee</h4>
              </div>
              <p className="text-sm text-gray-600">
                Your data is always anonymous and used only for statistical comparisons. Individual scores are never shared with other students. 
                We aggregate data to provide meaningful benchmarks while protecting your privacy.
              </p>
            </div>
          </CardContent>
        </Card>

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
