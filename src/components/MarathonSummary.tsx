
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { QuestionAttempt } from '../types/marathon';

interface MarathonSummaryProps {
  attempts: QuestionAttempt[];
  onBack: () => void;
  onRestart: () => void;
  sessionPoints: number;
}

const MarathonSummary: React.FC<MarathonSummaryProps> = ({
  attempts,
  onBack,
  onRestart,
  sessionPoints
}) => {
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  const averageTime = attempts.length > 0 ? Math.round(totalTimeSpent / attempts.length) : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const subjectBreakdown = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.subject]) {
      acc[attempt.subject] = { total: 0, correct: 0 };
    }
    acc[attempt.subject].total += 1;
    if (attempt.isCorrect) acc[attempt.subject].correct += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  // Calculate weak topics
  const topicStats: { [key: string]: { total: number; correct: number; subject: string } } = {};
  attempts.forEach(attempt => {
    const key = attempt.topic;
    if (!topicStats[key]) {
      topicStats[key] = { total: 0, correct: 0, subject: attempt.subject };
    }
    topicStats[key].total += 1;
    if (attempt.isCorrect) topicStats[key].correct += 1;
  });

  const weakTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      subject: stats.subject,
      totalAttempts: stats.total,
      correctAttempts: stats.correct,
      accuracy: stats.correct / stats.total,
    }))
    .filter(topic => topic.totalAttempts >= 2 && topic.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marathon Complete!</h1>
          <p className="text-xl text-gray-600">Here's your detailed performance summary</p>
        </div>

        {/* Main Performance Metrics */}
        <Card className="p-8 mb-8 bg-white shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
              <div className="text-lg text-gray-600">Questions Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">{correctAnswers}</div>
              <div className="text-lg text-gray-600">Questions Correct</div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">{accuracy}%</div>
            <div className="text-lg text-gray-600">Overall Accuracy</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{formatTime(totalTimeSpent)}</div>
              <div className="text-lg text-gray-600">Total Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{formatTime(averageTime)}</div>
              <div className="text-lg text-gray-600">Average Time per Question</div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Performance by Subject</h3>
            <div className="space-y-4">
              {Object.entries(subjectBreakdown).map(([subject, stats]) => {
                const subjectAccuracy = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={subject}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium capitalize">{subject}</span>
                      <span className="text-sm text-gray-600">
                        {stats.correct}/{stats.total} ({subjectAccuracy}%)
                      </span>
                    </div>
                    <Progress value={subjectAccuracy} className="h-2" />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Areas for Improvement
            </h3>
            {weakTopics.length > 0 ? (
              <div className="space-y-3">
                {weakTopics.slice(0, 5).map((topic, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-gray-600 capitalize">{topic.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {Math.round(topic.accuracy * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {topic.correctAttempts}/{topic.totalAttempts}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Great job! No weak areas identified yet.</p>
            )}
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={onBack} variant="outline" size="lg">
            Back to Dashboard
          </Button>
          <Button onClick={onRestart} className="bg-orange-600 hover:bg-orange-700" size="lg">
            Start New Marathon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarathonSummary;
