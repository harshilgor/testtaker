
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Subject } from '../pages/Index';
import { getRandomQuestion } from '../data/questions';

interface QuizViewProps {
  subject: Subject;
  selectedTopics: string[];
  questionCount: number;
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
}

interface Question {
  id: string;
  subject: 'math' | 'english';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  questions: Question[];
  answers: (number | null)[];
  score: number;
  completed: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({
  subject,
  selectedTopics,
  questionCount,
  userName,
  onBack,
  onBackToDashboard
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    // Generate questions based on selected topics
    const generatedQuestions = Array.from({ length: questionCount }, () => 
      getRandomQuestion(subject)
    );
    setQuestions(generatedQuestions);
    setAnswers(new Array(questionCount).fill(null));
  }, [subject, selectedTopics, questionCount]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      questions,
      answers,
      score: Math.round((correctAnswers / questionCount) * 100),
      completed: true
    };

    // Store quiz result in localStorage for dashboard
    const existingQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingQuizzes.push({
      ...result,
      subject,
      topics: selectedTopics,
      date: new Date().toISOString(),
      userName
    });
    localStorage.setItem('quizResults', JSON.stringify(existingQuizzes));

    // Store wrong answers for future practice
    const wrongAnswers = questions.filter((_, index) => answers[index] !== questions[index].correctAnswer);
    if (wrongAnswers.length > 0) {
      const existingWrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers') || '[]');
      existingWrongAnswers.push(...wrongAnswers);
      localStorage.setItem('wrongAnswers', JSON.stringify(existingWrongAnswers));
    }

    setQuizResult(result);
    setShowResults(true);
  };

  const answeredQuestions = answers.filter(answer => answer !== null).length;
  const progress = (answeredQuestions / questionCount) * 100;

  if (showResults && quizResult) {
    const percentage = quizResult.score;
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
                percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {percentage >= 70 ? (
                  <Check className="h-10 w-10 text-green-600" />
                ) : (
                  <X className={`h-10 w-10 ${percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600">Great job, {userName}!</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="text-4xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-gray-600">
                {questions.reduce((count, question, index) => 
                  count + (answers[index] === question.correctAnswer ? 1 : 0), 0
                )} out of {questionCount} questions correct
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onBackToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Create Another Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {subject === 'math' ? 'Math' : 'English'} Quiz
              </h1>
              <p className="text-gray-600">
                {answeredQuestions}/{questionCount} questions answered
              </p>
            </div>
            
            <div className="text-right min-w-[100px]">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Question {questionIndex + 1}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    question.subject === 'math' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {question.subject === 'math' ? 'Mathematics' : 'English'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {question.question}
                </h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[questionIndex] === optionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-3 text-gray-500">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Button
            onClick={handleSubmitQuiz}
            disabled={answeredQuestions < questionCount}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            Submit Quiz ({answeredQuestions}/{questionCount} answered)
          </Button>
          {answeredQuestions < questionCount && (
            <p className="text-center text-gray-600 mt-3 text-sm">
              Please answer all questions before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
