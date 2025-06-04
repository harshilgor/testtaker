import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { recordQuestionAttempt } from '@/services/pointsService';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  correct_rationale: string;
  incorrect_rationale_a: string;
  incorrect_rationale_b: string;
  incorrect_rationale_c: string;
  incorrect_rationale_d: string;
  section: string;
  skill: string;
  difficulty: string;
}

interface QuizViewProps {
  selectedTopics: string[];
  numberOfQuestions: number;
  subject: 'math' | 'english';
  userName: string;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  selectedTopics,
  numberOfQuestions,
  subject,
  userName,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [sessionId] = useState(`quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['quiz-questions', subject, selectedTopics, numberOfQuestions],
    queryFn: async () => {
      console.log('Fetching questions for quiz:', { subject, selectedTopics, numberOfQuestions });
      
      const section = subject === 'math' ? 'math' : 'reading-writing';
      
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('section', section)
        .in('skill', selectedTopics)
        .not('question_text', 'is', null)
        .limit(numberOfQuestions);

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      console.log('Fetched questions:', data?.length);
      return data || [];
    },
  });

  useEffect(() => {
    if (questions.length > 0 && !startTime) {
      setStartTime(new Date());
      setSelectedAnswers(new Array(questions.length).fill(null));
    }
  }, [questions, startTime]);

  useEffect(() => {
    if (startTime && !showResults) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, showResults]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  }, [questions, selectedAnswers]);

  const handleSubmitQuiz = async () => {
    if (!startTime) return;

    const score = calculateScore();
    const endTime = new Date();
    const totalTimeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user');
        return;
      }

      // Record individual question attempts and calculate points
      let totalPointsEarned = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = selectedAnswers[i];
        const isCorrect = userAnswer === question.correct_answer;
        
        // Ensure difficulty is one of the allowed values
        const difficulty = question.difficulty && ['easy', 'medium', 'hard'].includes(question.difficulty) 
          ? question.difficulty as 'easy' | 'medium' | 'hard'
          : 'medium';
        
        try {
          const points = await recordQuestionAttempt({
            question_id: String(question.id), // Convert to string to ensure type compatibility
            session_id: sessionId,
            session_type: 'quiz',
            is_correct: isCorrect,
            difficulty: difficulty,
            subject: subject,
            topic: question.skill || 'general',
            time_spent: Math.floor(totalTimeSpent / questions.length)
          });
          
          totalPointsEarned += points;
        } catch (error) {
          console.error('Error recording question attempt:', error);
        }
      }

      // Store quiz result in local storage for performance dashboard
      const quizResult = {
        score,
        questions,
        answers: selectedAnswers,
        subject,
        topics: selectedTopics,
        date: new Date().toISOString(),
        userName,
        sessionId,
        timeSpent: totalTimeSpent,
        pointsEarned: totalPointsEarned
      };

      const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      existingResults.push(quizResult);
      localStorage.setItem('quizResults', JSON.stringify(existingResults));

      console.log(`Quiz completed! Score: ${score}%, Points earned: ${totalPointsEarned}`);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }

    setShowResults(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button onClick={onBack} variant="outline" className="flex items-center mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Loading Quiz...</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparing your quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button onClick={onBack} variant="outline" className="flex items-center mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Error</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {error ? 'Failed to load quiz questions.' : 'No questions available for the selected topics.'}
            </p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = questions.filter((q, i) => selectedAnswers[i] === q.correct_answer).length;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
                  <div className="text-gray-600">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{correctAnswers}/{questions.length}</div>
                  <div className="text-gray-600">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
                  <div className="text-gray-600">Time Taken</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline">
                {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showAnswers ? 'Hide' : 'Show'} Answers
              </Button>
              <Button onClick={onBack}>Back to Topics</Button>
            </div>

            {showAnswers && (
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correct_answer;
                  
                  return (
                    <Card key={question.id} className="text-left">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        
                        <p className="text-gray-800 mb-4">{question.question_text}</p>
                        
                        <div className="space-y-2">
                          {['A', 'B', 'C', 'D'].map((option) => {
                            const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string;
                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer = question.correct_answer === option;
                            
                            let optionClass = "p-3 rounded border ";
                            if (isCorrectAnswer) {
                              optionClass += "bg-green-100 border-green-300";
                            } else if (isUserAnswer && !isCorrect) {
                              optionClass += "bg-red-100 border-red-300";
                            } else {
                              optionClass += "bg-gray-50 border-gray-200";
                            }
                            
                            return (
                              <div key={option} className={optionClass}>
                                <span className="font-medium">{option}.</span> {optionText}
                                {isUserAnswer && <span className="ml-2 text-sm">(Your answer)</span>}
                                {isCorrectAnswer && <span className="ml-2 text-sm text-green-600">(Correct)</span>}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded">
                          <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                          <p className="text-blue-800">{question.correct_rationale}</p>
                        </div>
                        
                        {userAnswer && userAnswer !== question.correct_answer && (
                          <div className="mt-4 p-4 bg-red-50 rounded">
                            <h4 className="font-medium text-red-900 mb-2">Why {userAnswer} is incorrect:</h4>
                            <p className="text-red-800">
                              {question[`incorrect_rationale_${userAnswer.toLowerCase()}` as keyof Question] as string}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button onClick={onBack} variant="outline" className="flex items-center mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz
            </h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600">Time Elapsed</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h2>
            
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
                const isSelected = selectedAnswers[currentQuestionIndex] === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option}.</span> {optionText}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={selectedAnswers.some(answer => answer === null)}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
