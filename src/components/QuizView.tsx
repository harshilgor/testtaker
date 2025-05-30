import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Flag, Calculator as CalculatorIcon, Trophy, Target, Check, X, Clock, Lightbulb, Eye, GraduationCap } from 'lucide-react';
import { Question, getRandomQuestion } from '../data/questions';
import Calculator from './Calculator';
import { getQuestionsBySubject, getQuestionsByTopics, questionService } from '../data/questions';
import { recordQuestionAttempt, getUserTotalPoints, calculatePoints } from '@/services/pointsService';
import { supabase } from '@/integrations/supabase/client';

interface QuizViewProps {
  subject: string;
  topics: string[];
  numQuestions: number;
  onBack: () => void;
  onComplete: (results: any) => void;
  userName: string;
  mode?: 'quiz' | 'marathon';
}

const QuizView: React.FC<QuizViewProps> = ({
  subject,
  topics,
  numQuestions,
  onBack,
  onComplete,
  userName,
  mode = 'quiz'
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [finalTimeSpent, setFinalTimeSpent] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [sessionId] = useState(() => `${mode}-${Date.now()}-${Math.random()}`);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  
  // Marathon mode specific states
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let loadedQuestions;
        if (topics.length > 0) {
          loadedQuestions = await getQuestionsByTopics(
            subject === 'math' ? 'math' : 'english',
            topics,
            numQuestions
          );
        } else {
          loadedQuestions = await getQuestionsBySubject(
            subject === 'math' ? 'math' : 'english',
            numQuestions
          );
        }
        
        setQuestions(loadedQuestions);
        setAnswers(new Array(loadedQuestions.length).fill(null));
        setFlaggedQuestions(new Array(loadedQuestions.length).fill(false));
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();
    loadUserPoints();
  }, [subject, numQuestions, topics]);

  const loadUserPoints = async () => {
    const points = await getUserTotalPoints();
    setTotalPoints(points);
  };

  useEffect(() => {
    if (showSummary || finalTimeSpent !== null) return;
    
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, showSummary, finalTimeSpent]);

  // Reset marathon states when question changes
  useEffect(() => {
    if (mode === 'marathon') {
      setShowAnswer(false);
      setShowExplanation(false);
      setHintsUsed(0);
      setHintText('');
    }
  }, [currentQuestionIndex, mode]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (mode === 'marathon' && showAnswer) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      
      try {
        // Record the attempt and earn points
        const points = await recordQuestionAttempt({
          question_id: currentQuestion.id,
          session_id: sessionId,
          session_type: mode === 'marathon' ? 'marathon' : 'quiz',
          is_correct: isCorrect,
          difficulty: currentQuestion.difficulty || 'medium',
          subject: currentQuestion.subject,
          topic: currentQuestion.topic || 'general',
          time_spent: Math.floor((Date.now() - startTime) / 1000)
        });

        setSessionPoints(prev => prev + points);
        await loadUserPoints();
      } catch (error) {
        console.error('Error recording answer:', error);
      }

      // Track question usage
      questionService.trackQuestionUsage(currentQuestion.id, mode === 'marathon' ? 'marathon' : 'quiz');
    }
  };

  const handleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getHint = () => {
    const hints = [
      "Think about what type of problem this is and what approach you should use.",
      "Break down the problem step by step. What information are you given?",
      "Consider the key concepts or formulas that might apply to this question."
    ];
    
    if (hintsUsed < hints.length) {
      setHintText(hints[hintsUsed]);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (mode === 'marathon') {
      // In marathon mode, move to next question immediately
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
      // Regular quiz mode
      goToQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1));
    }
  };

  const handleSubmit = async () => {
    const finalTime = Date.now() - startTime;
    setFinalTimeSpent(finalTime);
    
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);

    const results = {
      score,
      questions,
      answers,
      subject,
      topics,
      date: new Date().toISOString(),
      userName,
      timeSpent: Math.floor(finalTime / 1000),
      correctAnswers,
      totalQuestions: questions.length,
      mode,
      pointsEarned: sessionPoints
    };

    setQuizResults(results);
    setShowSummary(true);

    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingResults.push(results);
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const displayTime = finalTimeSpent !== null ? finalTimeSpent : timeSpent;

  if (showSummary && quizResults) {
    const accuracy = Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100);
    
    return (
      <div className="min-h-screen bg-white py-8 px-4">
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
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {mode === 'marathon' ? 'Marathon' : 'Quiz'} Complete!
              </h2>
              <p className="text-slate-600">Great job, {userName}!</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Questions Attempted</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{quizResults.totalQuestions}</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Correct Answers</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{quizResults.correctAnswers}</div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center justify-center mb-2">
                  <X className="h-6 w-6 text-slate-600 mr-2" />
                  <span className="text-sm text-slate-700 font-medium">Wrong Answers</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{quizResults.totalQuestions - quizResults.correctAnswers}</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Points Earned</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{sessionPoints}</div>
              </div>
            </div>

            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
              <div className="text-slate-600">Overall Accuracy</div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => onComplete(quizResults)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const progress = (answeredCount / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="flex items-center border-slate-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{mode === 'marathon' ? 'Marathon Mode' : 'Quiz'}</h1>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {totalPoints} pts (+{sessionPoints})
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {Math.floor(displayTime / 60000)}:{((displayTime % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </div>
        </div>

        {/* Progress */}
        {mode === 'quiz' && (
          <Card className="mb-6 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-sm text-slate-600">{Math.round(progress)}% Answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className={mode === 'quiz' ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : ''}>
          {/* Question Navigator - only for quiz mode */}
          {mode === 'quiz' && (
            <Card className="lg:col-span-1 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white border-blue-600'
                          : answers[index] !== null
                          ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      } ${flaggedQuestions[index] ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                    <span className="text-slate-600">Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                    <span className="text-slate-600">Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded mr-2"></div>
                    <span className="text-slate-600">Unanswered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                    <span className="text-slate-600">Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Content */}
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

              {/* Enhanced Answer Options with Rationales */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestionIndex] === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const isIncorrect = showAnswer && isSelected && !isCorrect;
                  const showRationale = mode === 'marathon' && showExplanation;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <button
                        onClick={() => handleAnswerSelect(index)}
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
                        <Button onClick={getHint} variant="outline" size="sm">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Hint ({hintsUsed}/3)
                        </Button>
                      )}
                      
                      {!showAnswer && (
                        <Button onClick={handleShowAnswer} variant="outline" size="sm">
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
                      onClick={isLastQuestion ? handleSubmit : handleNext}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isLastQuestion ? 'Complete Marathon' : 'Next Question'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {isLastQuestion ? (
                      <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
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
