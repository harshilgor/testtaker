
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Flag, Calculator as CalculatorIcon, Lightbulb, Eye, GraduationCap, Check, X } from 'lucide-react';
import { Question } from '@/data/questions';

interface QuizContentProps {
  mode: 'quiz' | 'marathon';
  currentQuestion: Question;
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  showAnswer: boolean;
  showExplanation: boolean;
  hintText: string;
  hintsUsed: number;
  isLastQuestion: boolean;
  calculatorOpen: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onFlag: () => void;
  onToggleCalculator: () => void;
  onGetHint: () => void;
  onShowAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  mode,
  currentQuestion,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  showAnswer,
  showExplanation,
  hintText,
  hintsUsed,
  isLastQuestion,
  calculatorOpen,
  onAnswerSelect,
  onFlag,
  onToggleCalculator,
  onGetHint,
  onShowAnswer,
  onPrevious,
  onNext,
  onSubmit
}) => {
  return (
    <Card className={`${mode === 'quiz' ? 'lg:col-span-3' : ''} border-slate-200`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentQuestion.subject === 'math' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {currentQuestion.subject === 'math' ? 'Mathematics' : 'English'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {currentQuestion.subject === 'math' && (
              <Button
                onClick={onToggleCalculator}
                variant="outline"
                size="sm"
                className={calculatorOpen ? 'bg-blue-50 border-blue-300' : ''}
              >
                <CalculatorIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={onFlag}
              variant="outline"
              size="sm"
              className={flaggedQuestions[currentQuestionIndex] ? 'text-yellow-600 border-yellow-300' : ''}
            >
              <Flag className={`h-4 w-4 ${flaggedQuestions[currentQuestionIndex] ? 'fill-yellow-400' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-6 leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Answer Options with Rationales */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestionIndex] === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const isIncorrect = showAnswer && isSelected && !isCorrect;
            const showRationale = mode === 'marathon' && showExplanation;
            
            return (
              <div key={index} className="space-y-2">
                <button
                  onClick={() => onAnswerSelect(index)}
                  disabled={mode === 'marathon' && showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    mode === 'marathon' && showAnswer
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isIncorrect
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-3 text-gray-500">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>

                {/* Show individual option rationales in marathon mode */}
                {showRationale && currentQuestion.rationales && (
                  <div className="ml-8">
                    {isCorrect && currentQuestion.rationales.correct && (
                      <Card className="p-3 bg-green-50 border-green-200">
                        <div className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm text-green-800">
                            <strong>Correct:</strong> {currentQuestion.rationales.correct}
                          </p>
                        </div>
                      </Card>
                    )}
                    
                    {!isCorrect && currentQuestion.rationales.incorrect && (
                      (() => {
                        const optionLetter = String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D';
                        const incorrectRationale = currentQuestion.rationales.incorrect[optionLetter];
                        return incorrectRationale ? (
                          <Card className="p-3 bg-red-50 border-red-200">
                            <div className="flex items-start space-x-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5" />
                              <p className="text-sm text-red-800">
                                <strong>Why this is incorrect:</strong> {incorrectRationale}
                              </p>
                            </div>
                          </Card>
                        ) : null;
                      })()
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Marathon Mode Hints */}
        {mode === 'marathon' && hintText && (
          <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-yellow-800">{hintText}</p>
            </div>
          </Card>
        )}

        {/* Marathon Mode Explanation */}
        {mode === 'marathon' && showExplanation && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          {mode === 'marathon' ? (
            <>
              <div className="flex space-x-2">
                {!showAnswer && hintsUsed < 3 && (
                  <Button onClick={onGetHint} variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Hint ({hintsUsed}/3)
                  </Button>
                )}
                
                {!showAnswer && (
                  <Button onClick={onShowAnswer} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Show Answer
                  </Button>
                )}
                
                {showExplanation && (
                  <Button variant="outline" size="sm">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Teach Me This Concept
                  </Button>
                )}
              </div>

              <Button
                onClick={isLastQuestion ? onSubmit : onNext}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLastQuestion ? 'Complete Marathon' : 'Next Question'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onPrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizContent;
