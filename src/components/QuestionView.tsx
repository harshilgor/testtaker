
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Flag, ArrowRight, ArrowLeft } from 'lucide-react';
import { Question, getRandomQuestion } from '../data/questions';

interface QuestionViewProps {
  subject: 'math' | 'english';
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  subject,
  onAnswer,
  onNext,
  onPrevious,
  canGoPrevious = false,
  questionNumber = 1,
  totalQuestions = 10
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestion();
  }, [subject]);

  const loadQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await getRandomQuestion(subject);
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsFlagged(false);
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(correct);
  };

  const handleNext = () => {
    loadQuestion();
    onNext();
  };

  const toggleFlag = () => {
    setIsFlagged(!isFlagged);
  };

  if (isLoading || !currentQuestion) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading question...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)] max-w-6xl mx-auto">
      {/* Left side - Question content */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 border-slate-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Question {questionNumber} of {totalQuestions}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subject === 'math' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {subject === 'math' ? 'Math' : 'English'}
                </span>
                <Button
                  onClick={toggleFlag}
                  variant="outline"
                  size="sm"
                  className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
                >
                  <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Answer options and actions */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 border-slate-200">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-medium mb-4 text-slate-900">
              Select your answer:
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : showResult && index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium mr-3 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {showResult && (
                        <div className="flex items-center">
                          {index === currentQuestion.correctAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {selectedAnswer === index && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                {showResult && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    {canGoPrevious && onPrevious && (
                      <Button onClick={onPrevious} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!showResult ? (
                      <Button 
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionView;
