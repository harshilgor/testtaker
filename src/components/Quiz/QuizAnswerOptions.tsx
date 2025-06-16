
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SATMultipleChoice from '../SAT/SATMultipleChoice';
import { ArrowRight } from 'lucide-react';

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

interface QuizAnswerOptionsProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  showCorrectAnswer: boolean;
  isCorrect: boolean;
  feedbackPreference: 'immediate' | 'end';
  hasAnswered: boolean;
  onNext?: () => void;
  canGoNext?: boolean;
}

const QuizAnswerOptions: React.FC<QuizAnswerOptionsProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer,
  isCorrect,
  feedbackPreference,
  hasAnswered,
  onNext,
  canGoNext = false
}) => {
  const rationales = {
    correct: question.explanation,
    incorrect: {
      A: question.explanation,
      B: question.explanation,
      C: question.explanation,
      D: question.explanation,
    }
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-6 text-gray-900">
          Answer Choices
        </h3>
        
        <SATMultipleChoice
          options={question.options}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={onAnswerSelect}
          eliminatedOptions={new Set()}
          onEliminateOption={() => {}}
          rationales={rationales}
          correctAnswer={question.correctAnswer}
          showExplanations={feedbackPreference === 'immediate' && showCorrectAnswer}
        />

        {/* Next Question Button */}
        {hasAnswered && canGoNext && onNext && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onNext}
              className="flex items-center gap-2"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizAnswerOptions;
