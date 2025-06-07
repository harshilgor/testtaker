import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, Target, Award } from 'lucide-react';
import QuestionImage from './QuestionImage';
import { calculatePoints } from '@/services/pointsService';

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

interface QuizViewProps {
  questions: Question[];
  onBack: () => void;
  subject: string;
  topics: string[];
  userName: string;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onBack, subject, topics, userName }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    const question = questions[currentQuestionIndex];
    
    // Calculate points using the standard point system
    const pointsEarned = isCorrect ? calculatePoints(question.difficulty, true) : 0;
    setScore(prev => prev + pointsEarned);
    
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!answered) {
      setShowExplanation(true);
      return;
    }

    setShowExplanation(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleSubmit = () => {
    const quizResult = {
      score: Math.round((correctAnswers / questions.length) * 100),
      questions: questions,
      answers: answers,
      subject: subject,
      topics: topics,
      date: new Date().toLocaleDateString(),
      userName: userName
    };

    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    storedResults.push(quizResult);
    localStorage.setItem('quizResults', JSON.stringify(storedResults));
    onBack();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <Card>
          <CardContent className="p-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <Button variant="ghost" onClick={onBack} className="mr-4">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{formatTime(time)}</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1 text-gray-500" />
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-green-500" />
                  <span>Score: {score}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>
              {currentQuestion.hasImage && currentQuestion.imageUrl && (
                <QuestionImage imageUrl={currentQuestion.imageUrl} alt="Question Image" />
              )}
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start ${selectedAnswer === index ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                >
                  {option}
                </Button>
              ))}
            </div>

            {answered && (
              <div className="mt-6 p-4 rounded-md">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <div className="text-green-600 font-semibold">Correct!</div>
                ) : (
                  <div className="text-red-600 font-semibold">Incorrect.</div>
                )}
                <p className="text-gray-700 mt-2">
                  Explanation: {currentQuestion.explanation}
                </p>
              </div>
            )}

            {showExplanation && !answered && (
              <div className="mt-6 p-4 rounded-md">
                <div className="text-yellow-600 font-semibold">Please select an answer.</div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={isLastQuestion ? handleSubmit : handleNextQuestion}>
                {isLastQuestion ? (
                  <>
                    Submit
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizView;
