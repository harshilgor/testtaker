
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Flag, 
  Calculator as CalculatorIcon, 
  Lightbulb, 
  Eye, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
}

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
  feedbackPreference?: 'immediate' | 'end';
  onAnswerSelect: (answerIndex: number) => void;
  onFlag: () => void;
  onToggleCalculator: () => void;
  onGetHint: () => void;
  onShowAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  hideExplanation?: boolean;
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
  feedbackPreference = 'immediate',
  onAnswerSelect,
  onFlag,
  onToggleCalculator,
  onGetHint,
  onShowAnswer,
  onPrevious,
  onNext,
  onSubmit,
  hideExplanation = false
}) => {
  const selectedAnswer = answers[currentQuestionIndex];
  const isFlagged = flaggedQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (mode === 'marathon' && showAnswer) return;
    onAnswerSelect(answerIndex);
  };

  const shouldShowExplanation = () => {
    if (mode === 'marathon') {
      return showExplanation;
    }
    
    // In quiz mode, show explanation based on feedback preference
    if (feedbackPreference === 'immediate' && selectedAnswer !== null) {
      return true;
    }
    
    return false;
  };

  return (
    <div className={mode === 'quiz' ? 'lg:col-span-3' : 'w-full'}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">
              {mode === 'marathon' ? 'Marathon Question' : `Question ${currentQuestionIndex + 1}`}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.subject === 'math' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {currentQuestion.subject === 'math' ? 'Math' : 'English'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <Button
                onClick={onFlag}
                variant="outline"
                size="sm"
                className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
              >
                <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <h2 className="text-lg font-semibold mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const shouldShowCorrect = mode === 'marathon' && showAnswer;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={mode === 'marathon' && showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? shouldShowCorrect
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : shouldShowCorrect && isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${showAnswer && mode === 'marathon' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                    </div>
                    {shouldShowCorrect && (
                      <div className="flex items-center">
                        {isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Marathon Mode Controls */}
          {mode === 'marathon' && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                onClick={onToggleCalculator}
                variant="outline"
                size="sm"
                className={calculatorOpen ? 'bg-blue-50' : ''}
              >
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Calculator
              </Button>
              
              <Button
                onClick={onGetHint}
                variant="outline"
                size="sm"
                disabled={hintsUsed >= 3}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Hint ({3 - hintsUsed} left)
              </Button>
              
              <Button
                onClick={onShowAnswer}
                variant="outline"
                size="sm"
                disabled={showAnswer || selectedAnswer === null}
              >
                <Eye className="h-4 w-4 mr-2" />
                Show Answer
              </Button>
            </div>
          )}

          {/* Hint Display */}
          {mode === 'marathon' && hintText && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-semibold text-yellow-800">Hint</span>
              </div>
              <p className="text-yellow-700 text-sm">{hintText}</p>
            </div>
          )}

          {/* Inline Explanation Section for Immediate Feedback in Quiz Mode */}
          {shouldShowExplanation() && !hideExplanation && (
            <div className="max-h-96 overflow-y-auto">
              <div className={`p-4 rounded-lg mb-6 ${
                mode === 'marathon' && selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-50 border border-green-200'
                  : mode === 'marathon'
                    ? 'bg-red-50 border border-red-200'
                    : selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-semibold ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                {/* Correct Answer Explanation */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Correct Answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                  </h4>
                  <p className={`text-sm ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'text-green-700'
                      : 'text-gray-700'
                  }`}>
                    {currentQuestion.rationales?.correct || currentQuestion.explanation}
                  </p>
                </div>

                {/* Incorrect Answer Explanation */}
                {selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer && currentQuestion.rationales?.incorrect && (
                  <div className="bg-red-100 border border-red-200 rounded p-3">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Why {String.fromCharCode(65 + selectedAnswer)} is Wrong:
                    </h4>
                    <p className="text-red-700 text-sm">
                      {currentQuestion.rationales.incorrect[String.fromCharCode(65 + selectedAnswer) as keyof typeof currentQuestion.rationales.incorrect]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Marathon Mode Answer Explanation */}
          {mode === 'marathon' && showExplanation && (
            <div className={`p-4 rounded-lg mb-6 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <span className={`font-semibold ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className={`text-sm ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {currentQuestion.rationales?.correct || currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div>
              {mode === 'quiz' && currentQuestionIndex > 0 && (
                <Button onClick={onPrevious} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {mode === 'quiz' && (
                <>
                  {!isLastQuestion ? (
                    <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
                      Next Question
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
                      Submit Quiz
                    </Button>
                  )}
                </>
              )}

              {mode === 'marathon' && (
                <Button 
                  onClick={onNext} 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={selectedAnswer === null}
                >
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizContent;
