
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  // Add incorrect rationales
  incorrect_rationale_a?: string;
  incorrect_rationale_b?: string;
  incorrect_rationale_c?: string;
  incorrect_rationale_d?: string;
}

interface QuizResult {
  score: number;
  questions: Question[];
  answers: (number | null)[];
  subject: string;
  topics: string[];
  date: string;
  userName: string;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface QuizDetailedReviewProps {
  onBack: () => void;
}

const QuizDetailedReview: React.FC<QuizDetailedReviewProps> = ({ onBack }) => {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    // Get the most recent quiz result from localStorage
    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    if (storedResults.length > 0) {
      setQuizResult(storedResults[storedResults.length - 1]);
    }
  }, []);

  if (!quizResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">No quiz results found</div>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const getIncorrectRationale = (question: Question, selectedAnswer: number): string => {
    const optionMap = ['a', 'b', 'c', 'd'];
    const selectedOption = optionMap[selectedAnswer];
    
    switch (selectedOption) {
      case 'a':
        return question.incorrect_rationale_a || 'This answer is incorrect.';
      case 'b':
        return question.incorrect_rationale_b || 'This answer is incorrect.';
      case 'c':
        return question.incorrect_rationale_c || 'This answer is incorrect.';
      case 'd':
        return question.incorrect_rationale_d || 'This answer is incorrect.';
      default:
        return 'This answer is incorrect.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Detailed Review</h1>
        </div>

        <div className="space-y-6">
          {quizResult.questions.map((question, index) => {
            const userAnswer = quizResult.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const wasAnswered = userAnswer !== null;

            return (
              <Card key={index} className="border-l-4 border-l-gray-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        Q{index + 1}
                      </span>
                      {wasAnswered ? (
                        isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {question.question}
                      </h3>

                      {/* Question Image */}
                      {question.hasImage && question.imageUrl && (
                        <div className="mb-4">
                          <img 
                            src={question.imageUrl} 
                            alt="Question diagram" 
                            className="max-w-full h-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      {/* Answer Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-50 border-green-300'
                                : optionIndex === userAnswer
                                ? 'bg-red-50 border-red-300'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="text-gray-900">{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                              {optionIndex === userAnswer && optionIndex !== question.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explanations */}
                      <div className="space-y-3">
                        {/* Correct Answer Explanation */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Correct Answer Explanation</span>
                          </div>
                          <p className="text-green-700 text-sm">{question.explanation}</p>
                        </div>

                        {/* Incorrect Answer Explanation (if user got it wrong) */}
                        {wasAnswered && !isCorrect && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">
                                Why Your Answer ({String.fromCharCode(65 + userAnswer!)}) Was Incorrect
                              </span>
                            </div>
                            <p className="text-red-700 text-sm">
                              {getIncorrectRationale(question, userAnswer!)}
                            </p>
                          </div>
                        )}

                        {/* Unanswered notification */}
                        {!wasAnswered && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Not Answered</span>
                            </div>
                            <p className="text-yellow-700 text-sm">You didn't provide an answer for this question.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizDetailedReview;
