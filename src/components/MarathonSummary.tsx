
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { MarathonSession, QuestionAttempt, WeakTopic } from '../types/marathon';

interface MarathonSummaryProps {
  session: MarathonSession | null;
  attempts: QuestionAttempt[];
  weakTopics: WeakTopic[];
  onBack: () => void;
  onRestart: () => void;
}

const MarathonSummary: React.FC<MarathonSummaryProps> = ({
  session,
  attempts,
  weakTopics,
  onBack,
  onRestart
}) => {
  if (!session) return null;

  const totalTime = session.endTime 
    ? session.endTime.getTime() - session.startTime.getTime()
    : 0;
  
  const hours = Math.floor(totalTime / (1000 * 60 * 60));
  const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

  const accuracy = session.totalQuestions > 0 
    ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
    : 0;

  const averageTime = attempts.length > 0
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / attempts.length / 1000)
    : 0;

  const subjectBreakdown = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.subject]) {
      acc[attempt.subject] = { total: 0, correct: 0 };
    }
    acc[attempt.subject].total += 1;
    if (attempt.isCorrect) acc[attempt.subject].correct += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marathon Complete!</h1>
          <p className="text-xl text-gray-600">Here's how you performed</p>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Questions</h3>
            <p className="text-3xl font-bold text-blue-600">{session.totalQuestions}</p>
          </Card>

          <Card className="p-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Accuracy</h3>
            <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Time Spent</h3>
            <p className="text-xl font-bold text-purple-600">
              {hours > 0 && `${hours}h `}{minutes}m {seconds}s
            </p>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Avg Time</h3>
            <p className="text-3xl font-bold text-orange-600">{averageTime}s</p>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Performance by Subject */}
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

          {/* Areas for Improvement */}
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

        {/* Session Details */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Session Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Answer Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-medium text-green-600">{session.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect Answers:</span>
                  <span className="font-medium text-red-600">{session.incorrectAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Show Answer Used:</span>
                  <span className="font-medium text-yellow-600">{session.showAnswerUsed}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Settings Used</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subjects:</span>
                  <span className="font-medium capitalize">{session.subjects.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-medium capitalize">{session.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Adaptive Learning:</span>
                  <span className="font-medium">{session.adaptiveLearning ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
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
