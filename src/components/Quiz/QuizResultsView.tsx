
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Trophy } from 'lucide-react';

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

interface QuizResultsViewProps {
  questions: Question[];
  answers: (number | null)[];
  feedbackPreference: 'immediate' | 'end';
  onBack: () => void;
  userName: string;
  subject: string;
  topics: string[];
}

const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  questions,
  answers,
  feedbackPreference,
  onBack,
  userName,
  subject,
  topics
}) => {
  const correctAnswers = answers.reduce((count, answer, index) => {
    return answer === questions[index].correctAnswer ? count + 1 : count;
  }, 0);

  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  const totalScore = correctAnswers * 10;

  if (feedbackPreference === 'end') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="text-center mb-6">
              <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                accuracy >= 70 ? 'bg-blue-100' : accuracy >= 50 ? 'bg-slate-100' : 'bg-red-100'
              }`}>
                <Trophy className={`h-10 w-10 ${
                  accuracy >= 70 ? 'text-blue-600' : accuracy >= 50 ? 'text-slate-600' : 'text-red-600'
                }`} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
              <p className="text-slate-600">Great job, {userName}!</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Correct Answers</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{correctAnswers}</div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center justify-center mb-2">
                  <X className="h-6 w-6 text-slate-600 mr-2" />
                  <span className="text-sm text-slate-700 font-medium">Wrong Answers</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{questions.length - correctAnswers}</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
              <div className="text-slate-600">Overall Accuracy</div>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;

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
                    {question.options.map((option, optionIndex) => {
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
              accuracy >= 70 ? 'bg-blue-100' : accuracy >= 50 ? 'bg-slate-100' : 'bg-red-100'
            }`}>
              <Trophy className={`h-10 w-10 ${
                accuracy >= 70 ? 'text-blue-600' : accuracy >= 50 ? 'text-slate-600' : 'text-red-600'
              }`} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
            <p className="text-slate-600">Great job, {userName}!</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Check className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Correct Answers</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{correctAnswers}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="flex items-center justify-center mb-2">
                <X className="h-6 w-6 text-slate-600 mr-2" />
                <span className="text-sm text-slate-700 font-medium">Wrong Answers</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{questions.length - correctAnswers}</div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
            <div className="text-slate-600">Overall Accuracy</div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                const quizResult = {
                  score: accuracy,
                  questions: questions,
                  answers: answers,
                  subject: subject,
                  topics: topics,
                  date: new Date().toLocaleDateString(),
                  userName: userName,
                  totalScore: totalScore,
                  correctAnswers: correctAnswers,
                  totalQuestions: questions.length
                };

                sessionStorage.setItem('currentQuizResult', JSON.stringify(quizResult));
                window.location.hash = 'quiz-detailed-results';
              }}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
            >
              Review Questions
            </Button>
            <Button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsView;
