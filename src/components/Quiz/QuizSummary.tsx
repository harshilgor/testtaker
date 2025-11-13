// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { QuizQuestion } from '@/types/question';
import { calculatePoints, calculateXP } from '@/services/pointsService';

interface QuizSummaryProps {
  questions: QuizQuestion[];
  answers: (number | null)[];
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
  onTakeSimilarQuiz?: () => void;
}

interface MistakeCategory {
  subject: string;
  category: string;
  count: number;
  questions: QuizQuestion[];
  isHighPriority: boolean;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({
  questions,
  answers,
  onRetakeQuiz,
  onBackToDashboard,
  onTakeSimilarQuiz
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate quiz statistics
  const quizStats = useMemo(() => {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((question, index) => {
      const userAnswer = answers[index];
      // @ts-expect-error - Type mismatch between QuizQuestion and database schema
      const correctAnswer = question.correctAnswer ?? question.correct_answer;
      return userAnswer !== null && correctAnswer === userAnswer;
    }).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate points and XP using the service functions
    let totalPoints = 0;
    let totalXP = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      // @ts-expect-error - Type mismatch
      const correctAnswer = question.correctAnswer ?? question.correct_answer;
      const isCorrect = userAnswer !== null && correctAnswer === userAnswer;
      const difficulty = question.difficulty || 'medium';
      
      totalPoints += calculatePoints(difficulty, isCorrect);
      totalXP += calculateXP(difficulty, isCorrect);
    });

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      pointsEarned: totalPoints,
      xpEarned: totalXP
    };
  }, [questions, answers]);

  // Calculate skill breakdown
  const skillBreakdown = useMemo(() => {
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
      // @ts-expect-error - Type mismatch
      const correctAnswer = question.correctAnswer ?? question.correct_answer;
      const isCorrect = userAnswer !== null && correctAnswer === userAnswer;
      const difficulty = (question.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';
      // @ts-expect-error - Type mismatch
      const skill = question.skill || question.topic || (question as any).domain || 'General';
      
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

  // Categorize mistakes
  const mistakeCategories = useMemo(() => {
    const categories: Record<string, MistakeCategory> = {};

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      // @ts-expect-error - Type mismatch
      const correctAnswer = question.correctAnswer ?? question.correct_answer;
      const isCorrect = userAnswer !== null && correctAnswer === userAnswer;
      
      if (!isCorrect && userAnswer !== null) {
        const subject = question.subject || 'General';
        // @ts-expect-error - Property may not exist on type
        const category = question.topic || question.domain || 'General Practice';
        const key = `${subject}: ${category}`;

        if (!categories[key]) {
          categories[key] = {
            subject,
            category,
            count: 0,
            questions: [],
            isHighPriority: false
          };
        }

        categories[key].count++;
        categories[key].questions.push(question);
      }
    });

    // Mark high priority categories (2+ mistakes)
    Object.values(categories).forEach(category => {
      category.isHighPriority = category.count >= 2;
    });

    return Object.values(categories).sort((a, b) => b.count - a.count);
  }, [questions, answers]);

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quiz Results</h1>
          <p className="text-gray-600 text-sm">Review your performance and track your progress</p>
        </div>

        {/* Summary Stats Card */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-gray-900 mb-1">{quizStats.accuracy.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-green-600 mb-1">{quizStats.correctAnswers}</div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-red-600 mb-1">{quizStats.totalQuestions - quizStats.correctAnswers}</div>
                <div className="text-xs text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-purple-600 mb-1">{quizStats.pointsEarned}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-semibold mb-1 ${quizStats.xpEarned >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {quizStats.xpEarned >= 0 ? '+' : ''}{quizStats.xpEarned}
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

        {/* Mistakes Section */}
        {mistakeCategories.length > 0 && (
          <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Areas to Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mistakeCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      category.isHighPriority
                        ? 'bg-red-50/50 border-red-200/50 hover:bg-red-50'
                        : 'bg-yellow-50/50 border-yellow-200/50 hover:bg-yellow-50'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-600 mb-0.5">{category.subject}</div>
                        <div className={`font-semibold text-sm truncate ${
                          category.isHighPriority ? 'text-red-900' : 'text-yellow-900'
                        }`}>
                          {category.category}
                        </div>
                      </div>
                      <div className={`ml-2 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        category.isHighPriority
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {category.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfect Score Message */}
        {mistakeCategories.length === 0 && (
          <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Perfect Score!</h3>
              <p className="text-sm text-gray-600">You got all questions correct. Great job!</p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Question Review */}
        {selectedCategory && (
          <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Question Review</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="h-8 w-8 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {mistakeCategories
                  .find(cat => cat.category === selectedCategory)
                  ?.questions.map((question, index) => {
                    const questionIndex = questions.indexOf(question);
                    const userAnswer = answers[questionIndex];
                    // @ts-expect-error - Type mismatch
                    const correctAnswer = question.correctAnswer ?? question.correct_answer;
                    const isCorrect = userAnswer !== null && correctAnswer === userAnswer;
                    
                    return (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Question {questionIndex + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              question.difficulty?.toLowerCase() === 'easy' ? 'bg-green-100 text-green-700' :
                              question.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {question.difficulty || 'Medium'}
                            </span>
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-800">{question.question}</p>
                        </div>
                        
                        <div className="space-y-1.5 mb-3">
                          {question.options?.map((option, optIndex) => {
                            // @ts-expect-error - Type mismatch
                            const correctAnswer = question.correctAnswer ?? question.correct_answer;
                            return (
                              <div
                                key={optIndex}
                                className={`p-2 rounded border text-sm ${
                                  optIndex === correctAnswer
                                    ? 'bg-green-50 border-green-200 text-green-900'
                                    : optIndex === userAnswer
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                {optIndex === correctAnswer && (
                                  <span className="ml-2 text-xs font-medium">✓ Correct</span>
                                )}
                                {optIndex === userAnswer && optIndex !== correctAnswer && (
                                  <span className="ml-2 text-xs font-medium">✗ Your answer</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Rationale Section */}
                        <div className="space-y-2">
                          <div className="p-2.5 bg-green-50 rounded border-l-2 border-green-400">
                            <p className="text-xs text-green-800">
                              <strong>Correct:</strong> {question.explanation || 'This is the correct answer based on the question requirements.'}
                            </p>
                          </div>
                          
                          {!isCorrect && userAnswer !== null && (
                            <div className="p-2.5 bg-red-50 rounded border-l-2 border-red-400">
                              <p className="text-xs text-red-800">
                                <strong>Incorrect:</strong> {
                                  question.explanation 
                                    ? `The correct answer is ${String.fromCharCode(65 + correctAnswer)}. ${question.explanation}` 
                                    : `The correct answer is ${String.fromCharCode(65 + correctAnswer)}.`
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={onRetakeQuiz}
            variant="outline"
            className="rounded-xl"
          >
            <Target className="h-4 w-4 mr-2" />
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

export default QuizSummary;
