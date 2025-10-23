import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { QuizQuestion } from '@/types/question';

interface QuizSummaryProps {
  questions: QuizQuestion[];
  answers: (number | null)[];
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
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
  onBackToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate quiz statistics
  const quizStats = useMemo(() => {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((question, index) => {
      const userAnswer = answers[index];
      return userAnswer !== null && question.correct_answer === userAnswer;
    }).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeSpent = 0; // This would come from actual timing data

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      timeSpent
    };
  }, [questions, answers]);

  // Categorize mistakes
  const mistakeCategories = useMemo(() => {
    const categories: Record<string, MistakeCategory> = {};

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer !== null && question.correct_answer === userAnswer;
      
      if (!isCorrect && userAnswer !== null) {
        const subject = question.subject || 'General';
        const category = question.topic || question.skill || 'General Practice';
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

  const getCategoryColor = (category: MistakeCategory) => {
    return category.isHighPriority ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  };

  const getCategoryTextColor = (category: MistakeCategory) => {
    return category.isHighPriority ? 'text-red-800' : 'text-yellow-800';
  };

  const getCategoryIconColor = (category: MistakeCategory) => {
    return category.isHighPriority ? 'text-red-500' : 'text-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Review All Mistakes</h1>
          <div className="flex justify-center gap-8 text-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quizStats.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{quizStats.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{quizStats.totalQuestions - quizStats.correctAnswers}</div>
              <div className="text-sm text-gray-600">Mistakes</div>
            </div>
          </div>
        </div>

        {/* Mistake Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {mistakeCategories.map((category, index) => (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-md transition-all duration-200 ${getCategoryColor(category)}`}
              onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold ${getCategoryTextColor(category)}`}>
                    {category.count}
                  </div>
                  <ArrowUpRight className={`h-4 w-4 ${getCategoryIconColor(category)}`} />
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-600">{category.subject}</div>
                  <div className={`font-semibold ${getCategoryTextColor(category)}`}>
                    {category.category}
                  </div>
                </div>

                {selectedCategory === category.category && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">Questions to review:</div>
                    <div className="space-y-1">
                      {category.questions.slice(0, 3).map((question, qIndex) => (
                        <div key={qIndex} className="text-xs text-gray-700 truncate">
                          Question {questions.indexOf(question) + 1}
                        </div>
                      ))}
                      {category.questions.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{category.questions.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Mistakes Message */}
        {mistakeCategories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Score!</h3>
              <p className="text-gray-600">You got all questions correct. Great job!</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={onRetakeQuiz}
            variant="outline"
            className="px-6 py-3"
          >
            <Target className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
          <Button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;