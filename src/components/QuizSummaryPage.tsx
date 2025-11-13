
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, Clock, Target, BookOpen, TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { Subject } from '@/types/common';
import { QuizQuestion } from '@/types/question';
import CollapsibleQuestionReview from '@/components/CollapsibleQuestionReview';
import { calculatePoints, calculateXP } from '@/services/pointsService';

interface QuizSummaryPageProps {
  questions: QuizQuestion[];
  answers: (number | null)[];
  topics: string[];
  timeElapsed: number;
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
  userName: string;
  subject: Subject;
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
  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length;
  
  const incorrectAnswers = questions.length - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
  
  // Calculate points and XP using the service functions
  const pointsEarned = questions.reduce((total, question, index) => {
    const userAnswer = answers[index];
    const correctAnswer = question.correctAnswer ?? (question as any).correct_answer;
    const isCorrect = userAnswer === correctAnswer;
    const difficulty = question.difficulty || 'medium';
    return total + calculatePoints(difficulty, isCorrect);
  }, 0);

  const xpEarned = questions.reduce((total, question, index) => {
    const userAnswer = answers[index];
    const correctAnswer = question.correctAnswer ?? (question as any).correct_answer;
    const isCorrect = userAnswer === correctAnswer;
    const difficulty = question.difficulty || 'medium';
    return total + calculateXP(difficulty, isCorrect);
  }, 0);

  // Calculate skill breakdown
  const skillBreakdown = React.useMemo(() => {
    const skillMap = new Map<string, {
      skill: string;
      total: number;
      correct: number;
      easy: { total: number; correct: number; points: number; xp: number };
      medium: { total: number; correct: number; points: number; xp: number };
      hard: { total: number; correct: number; points: number; xp: number };
      totalPoints: number;
      totalXP: number;
    }>();

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer ?? (question as any).correct_answer;
      const isCorrect = userAnswer === correctAnswer;
      const difficulty = (question.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';
      const skill = (question as any).skill || question.topic || (question as any).domain || 'General';
      
      if (!skillMap.has(skill)) {
        skillMap.set(skill, {
          skill,
          total: 0,
          correct: 0,
          easy: { total: 0, correct: 0, points: 0, xp: 0 },
          medium: { total: 0, correct: 0, points: 0, xp: 0 },
          hard: { total: 0, correct: 0, points: 0, xp: 0 },
          totalPoints: 0,
          totalXP: 0
        });
      }

      const skillData = skillMap.get(skill)!;
      skillData.total++;
      if (isCorrect) {
        skillData.correct++;
      }

      // Update difficulty-specific stats
      const diffData = skillData[difficulty];
      diffData.total++;
      if (isCorrect) {
        diffData.correct++;
        const points = calculatePoints(difficulty, true);
        const xp = calculateXP(difficulty, true);
        diffData.points += points;
        diffData.xp += xp;
        skillData.totalPoints += points;
        skillData.totalXP += xp;
      } else {
        const xp = calculateXP(difficulty, false);
        diffData.xp += xp;
        skillData.totalXP += xp;
      }
    });

    return Array.from(skillMap.values()).sort((a, b) => b.total - a.total);
  }, [questions, answers]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! You're mastering this material!";
    if (percentage >= 80) return "Great job! You have a solid understanding.";
    if (percentage >= 70) return "Good work! Keep practicing to improve.";
    if (percentage >= 60) return "Not bad! Focus on areas that need improvement.";
    return "Keep studying! You'll get better with practice.";
  };

  // Calculate topic-wise performance
  const topicPerformance = topics.reduce((acc, topic) => {
    const topicQuestions = questions.filter(q => q.topic === topic);
    const topicCorrectAnswers = topicQuestions.filter((q, index) => {
      const globalIndex = questions.findIndex(question => question.id === q.id);
      return answers[globalIndex] === q.correctAnswer;
    }).length;
    
    acc[topic] = {
      total: topicQuestions.length,
      correct: topicCorrectAnswers,
      percentage: topicQuestions.length > 0 ? Math.round((topicCorrectAnswers / topicQuestions.length) * 100) : 0
    };
    
    return acc;
  }, {} as Record<string, { total: number; correct: number; percentage: number }>);

  const strongestTopic = Object.entries(topicPerformance).reduce((best, current) => 
    current[1].percentage > (best?.[1]?.percentage || 0) ? current : best, null as [string, any] | null);
    
  const weakestTopic = Object.entries(topicPerformance).reduce((worst, current) => 
    current[1].percentage < (worst?.[1]?.percentage || 100) ? current : worst, null as [string, any] | null);

  const avgTimePerQuestion = Math.round(timeElapsed / questions.length);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={onBackToDashboard}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quiz Complete</h1>
          <p className="text-gray-600 text-sm">Review your performance and track your progress</p>
        </div>

        {/* Summary Stats Card */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className={`text-5xl font-semibold mb-2 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-sm text-gray-600 mb-4">{getScoreMessage(scorePercentage)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-green-600 mb-1">{correctAnswers}</div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-red-600 mb-1">{incorrectAnswers}</div>
                <div className="text-xs text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-blue-600 mb-1">{formatTime(timeElapsed)}</div>
                <div className="text-xs text-gray-600">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-purple-600 mb-1">{pointsEarned}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-semibold mb-1 ${xpEarned >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {xpEarned >= 0 ? '+' : ''}{xpEarned}
                </div>
                <div className="text-xs text-gray-600">XP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Performance Breakdown */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Skill Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {skillBreakdown.map((skill, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{skill.skill}</h3>
                      <p className="text-sm text-gray-600">
                        {skill.correct}/{skill.total} correct
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1.5 text-purple-600 font-semibold mb-1">
                        <Award className="h-3.5 w-3.5" />
                        <span className="text-sm">{skill.totalPoints}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-semibold text-sm ${skill.totalXP >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{skill.totalXP >= 0 ? '+' : ''}{skill.totalXP}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Difficulty Breakdown */}
                  <div className="flex gap-4 pt-3 border-t border-gray-100">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => {
                      const diffData = skill[diff];
                      if (diffData.total === 0) return null;
                      return (
                        <div key={diff} className="flex-1">
                          <div className={`text-xs font-medium mb-1 ${
                            diff === 'easy' ? 'text-green-700' :
                            diff === 'medium' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-0.5">
                            {diffData.correct}/{diffData.total}
                          </div>
                          <div className="text-xs text-gray-500">
                            {diffData.points} pts • {diffData.xp >= 0 ? '+' : ''}{diffData.xp} XP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        {topics.length > 0 && (
          <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Topic Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {Object.entries(topicPerformance).map(([topic, performance]) => (
                  <div key={topic} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900">{topic}</h3>
                      <span className="text-sm font-semibold text-gray-700">
                        {performance.correct}/{performance.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${performance.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Highlights */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Highlights</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {strongestTopic && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50/50 border border-green-200/50">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900">
                      Strongest: {strongestTopic[0]}
                    </p>
                    <p className="text-xs text-green-700">
                      {strongestTopic[1].correct}/{strongestTopic[1].total} correct ({strongestTopic[1].percentage}%)
                    </p>
                  </div>
                </div>
              )}
              
              {weakestTopic && weakestTopic[1].percentage < 70 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50/50 border border-red-200/50">
                  <TrendingDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900">
                      Needs improvement: {weakestTopic[0]}
                    </p>
                    <p className="text-xs text-red-700">
                      {weakestTopic[1].correct}/{weakestTopic[1].total} correct ({weakestTopic[1].percentage}%)
                    </p>
                  </div>
                </div>
              )}

              {avgTimePerQuestion < 30 && scorePercentage < 70 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50/50 border border-yellow-200/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-900">
                      Consider slowing down
                    </p>
                    <p className="text-xs text-yellow-700">
                      Averaged {avgTimePerQuestion}s per question
                    </p>
                  </div>
                </div>
              )}

              {scorePercentage >= 90 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-200/50">
                  <Trophy className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900">
                      Excellent performance!
                    </p>
                    <p className="text-xs text-blue-700">
                      Consider challenging yourself with harder questions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <CollapsibleQuestionReview questions={questions.map(q => ({ ...q, subject: q.subject || '', difficulty: q.difficulty || 'medium' }))} answers={answers} />

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={onRetakeQuiz}
            variant="outline"
            className="rounded-xl"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
          <Button
            onClick={onBackToDashboard}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
