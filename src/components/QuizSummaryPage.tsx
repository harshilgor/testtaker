
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award, Target, Clock, BookOpen, TrendingUp } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
}

interface QuizSummaryPageProps {
  questions: Question[];
  answers: (number | null)[];
  topics: string[];
  timeElapsed: number;
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
  userName: string;
  subject: string;
}

const QuizSummaryPage: React.FC<QuizSummaryPageProps> = ({
  questions,
  answers,
  topics,
  timeElapsed,
  onRetakeQuiz,
  onBackToDashboard,
  userName,
  subject
}) => {
  const correctAnswersCount = answers.filter((answer, index) => 
    answer === questions[index]?.correctAnswer
  ).length;
  
  const totalQuestions = questions.length;
  const accuracy = Math.round((correctAnswersCount / totalQuestions) * 100);
  const incorrectAnswers = totalQuestions - correctAnswersCount;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate topic performance
  const topicPerformance = topics.reduce((acc, topic) => {
    const topicQuestions = questions.filter(q => q.topic === topic);
    const topicCorrect = topicQuestions.filter((q, index) => 
      answers[questions.indexOf(q)] === q.correctAnswer
    ).length;
    
    acc[topic] = {
      total: topicQuestions.length,
      correct: topicCorrect,
      accuracy: topicQuestions.length > 0 ? Math.round((topicCorrect / topicQuestions.length) * 100) : 0
    };
    return acc;
  }, {} as Record<string, { total: number; correct: number; accuracy: number }>);

  // Performance highlights
  const getPerformanceHighlights = () => {
    const highlights = [];
    
    if (accuracy >= 90) {
      highlights.push("🎯 Outstanding performance! You're mastering these topics.");
    } else if (accuracy >= 80) {
      highlights.push("💪 Great job! You're showing strong understanding.");
    } else if (accuracy >= 70) {
      highlights.push("📈 Good work! Keep practicing to improve further.");
    } else {
      highlights.push("📚 Focus on reviewing the concepts for better results.");
    }

    // Find strongest topic
    const strongestTopic = Object.entries(topicPerformance)
      .sort(([,a], [,b]) => b.accuracy - a.accuracy)[0];
    if (strongestTopic && strongestTopic[1].accuracy >= 80) {
      highlights.push(`🌟 Excellent work in ${strongestTopic[0]}!`);
    }

    // Find weakest topic
    const weakestTopic = Object.entries(topicPerformance)
      .sort(([,a], [,b]) => a.accuracy - b.accuracy)[0];
    if (weakestTopic && weakestTopic[1].accuracy < 60) {
      highlights.push(`💡 Consider reviewing ${weakestTopic[0]} concepts.`);
    }

    return highlights;
  };

  const performanceHighlights = getPerformanceHighlights();

  const handleReviewQuestion = (questionIndex: number) => {
    // This would ideally navigate to a question review page
    console.log('Review question:', questionIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-lg text-gray-600">
            Great job completing your {subject} quiz on {topics.join(', ')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-xs text-muted-foreground">Total attempted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Correct</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{correctAnswersCount}</div>
              <p className="text-xs text-muted-foreground">Answered correctly</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accuracy}%</div>
              <p className="text-xs text-muted-foreground">Overall accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              <p className="text-xs text-muted-foreground">Time taken</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Performance Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{highlight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Topic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(topicPerformance).map(([topic, stats]) => (
                  <div key={topic}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{topic}</span>
                      <span className="text-sm text-gray-500">{stats.correct}/{stats.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.accuracy >= 80 ? 'bg-green-500' :
                          stats.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stats.accuracy}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stats.accuracy}% accuracy</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Review Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            Question {index + 1} - {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{question.question}</p>
                        <div className="text-xs text-gray-500">
                          Topic: {question.topic} • Difficulty: {question.difficulty}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewQuestion(index)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetakeQuiz}
            variant="outline"
            className="px-8 py-3"
          >
            Retake Quiz
          </Button>
          <Button
            onClick={onBackToDashboard}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
