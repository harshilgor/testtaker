
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Flag, Calculator as CalculatorIcon } from 'lucide-react';
import { Question, getRandomQuestion } from '../data/questions';
import Calculator from './Calculator';

interface QuizViewProps {
  subject: string;
  topics: string[];
  numQuestions: number;
  onBack: () => void;
  onComplete: (results: any) => void;
  userName: string;
}

const QuizView: React.FC<QuizViewProps> = ({
  subject,
  topics,
  numQuestions,
  onBack,
  onComplete,
  userName
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  useEffect(() => {
    const generatedQuestions = Array.from({ length: numQuestions }, () => 
      getRandomQuestion(subject === 'math' ? 'math' : 'english')
    );
    setQuestions(generatedQuestions);
    setAnswers(new Array(numQuestions).fill(null));
    setFlaggedQuestions(new Array(numQuestions).fill(false));
  }, [subject, numQuestions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    const score = Math.round((answers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length / questions.length) * 100);

    const results = {
      score,
      questions,
      answers,
      subject,
      topics,
      date: new Date().toISOString(),
      userName,
      timeSpent: Math.floor(timeSpent / 1000)
    };

    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingResults.push(results);
    localStorage.setItem('quizResults', JSON.stringify(existingResults));

    onComplete(results);
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <div className="text-sm text-gray-600">
            {Math.floor(timeSpent / 60000)}:{((timeSpent % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium border ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white border-blue-600'
                        : answers[index] !== null
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    } ${flaggedQuestions[index] ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card className="lg:col-span-3">
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
                      onClick={() => setCalculatorOpen(!calculatorOpen)}
                      variant="outline"
                      size="sm"
                      className={calculatorOpen ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      <CalculatorIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleFlag}
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

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[currentQuestionIndex] === index
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
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => goToQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculator */}
      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};

export default QuizView;
