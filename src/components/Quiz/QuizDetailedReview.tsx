
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

interface QuizDetailedReviewProps {
  onBack: () => void;
}

const QuizDetailedReview: React.FC<QuizDetailedReviewProps> = ({ onBack }) => {
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('currentQuizResult');
    if (data) {
      setQuizData(JSON.parse(data));
    }
  }, []);

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading quiz results...</div>
        </div>
      </div>
    );
  }

  const { questions, answers } = quizData;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mr-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summary
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detailed Quiz Review</h1>
        </div>

        <div className="space-y-6">
          {questions.map((question: Question, index: number) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const userOptionLetter = userAnswer !== null ? String.fromCharCode(65 + userAnswer) : 'No Answer';
            const correctOptionLetter = String.fromCharCode(65 + question.correctAnswer);

            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{question.question}</p>

                {/* Only show image if hasImage is true */}
                {question.hasImage && question.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={question.imageUrl} 
                      alt="Question diagram" 
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 mb-4">
                  {question.options?.map((option: string, optionIndex: number) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    const isUserAnswer = userAnswer === optionIndex;
                    const isCorrectAnswer = question.correctAnswer === optionIndex;

                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded border ${
                          isCorrectAnswer
                            ? 'bg-green-50 border-green-300'
                            : isUserAnswer
                              ? 'bg-red-50 border-red-300'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{optionLetter}.</span>
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-green-600 font-medium">✓ Correct</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-auto text-red-600 font-medium">✗ Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                  <p className="text-blue-700 text-sm">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            Back to Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailedReview;
