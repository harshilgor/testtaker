
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flag, FlagOff, ChevronRight, Clock } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface QuizAnswerPanelProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  feedbackPreference: 'immediate' | 'end';
  showFeedback: boolean;
  isCorrect: boolean;
  onNext: () => void;
  loading: boolean;
  isSubmitted: boolean;
  isLastQuestion?: boolean;
  onSubmitQuiz?: () => void;
}

const QuizAnswerPanel: React.FC<QuizAnswerPanelProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag,
  currentQuestionIndex,
  totalQuestions,
  feedbackPreference,
  showFeedback,
  isCorrect,
  onNext,
  loading,
  isSubmitted,
  isLastQuestion = false,
  onSubmitQuiz
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFlag}
              className={`${isFlagged ? 'text-orange-600' : 'text-gray-400'} hover:text-orange-600`}
            >
              {isFlagged ? <Flag className="h-4 w-4" /> : <FlagOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === question.correctAnswer;
            
            let optionStyle = "border-gray-200 hover:border-gray-300";
            
            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle = "border-green-500 bg-green-50";
              } else if (isSelected && !isCorrectOption) {
                optionStyle = "border-red-500 bg-red-50";
              }
            } else if (isSelected) {
              optionStyle = "border-blue-500 bg-blue-50";
            }

            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 ${optionStyle}`}
                onClick={() => !isSubmitted && onAnswerSelect(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium
                      ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                      {optionLabels[index]}
                    </div>
                    <span className="text-gray-900">{option}</span>
                    {showFeedback && isCorrectOption && (
                      <span className="ml-auto text-green-600 font-semibold">✓</span>
                    )}
                    {showFeedback && isSelected && !isCorrectOption && (
                      <span className="ml-auto text-red-600 font-semibold">✗</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showFeedback && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </span>
              </div>
              <p className="text-blue-800 text-sm">{question.explanation}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <Clock className="h-4 w-4 inline mr-1" />
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          
          <div className="flex space-x-2">
            {isLastQuestion && selectedAnswer !== null ? (
              <Button
                onClick={onSubmitQuiz}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <>
                {feedbackPreference === 'immediate' && selectedAnswer !== null && !isSubmitted && (
                  <Button
                    onClick={onNext}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Submit Answer
                  </Button>
                )}
                
                {!isLastQuestion && (feedbackPreference === 'end' || isSubmitted) && (
                  <Button
                    onClick={onNext}
                    disabled={selectedAnswer === null}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnswerPanel;
