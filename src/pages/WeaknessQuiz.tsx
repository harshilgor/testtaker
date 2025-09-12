import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Bookmark,
  Settings,
  Target
} from 'lucide-react';
import weaknessQuizService from '@/services/weaknessQuizService';

interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  correct_rationale: string;
  skill: string;
  difficulty: string;
  domain: string;
  test: string;
}

interface QuizData {
  questions: QuizQuestion[];
  weaknessTopics: string[];
  totalQuestions: number;
  estimatedTime: string;
}

const WeaknessQuiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(location.search);
  const questionCount = parseInt(urlParams.get('count') || '10');
  const targetSkills = urlParams.get('skills')?.split(',') || [];
  const targetDifficulty = urlParams.get('difficulty') || 'medium';
  const quizType = urlParams.get('type') || 'weakness-quiz';
  const isDiagnostic = urlParams.get('diagnostic') === 'true';

  // Timer effect
  useEffect(() => {
    if (!isCompleted && quizData) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, quizData]);

  // Load quiz data on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        // Get mistakes data from location state or fetch from context
        const mistakes = location.state?.mistakes || [];
        const userName = location.state?.userName || 'Student';
        
        if (isDiagnostic) {
          // For diagnostic quiz, generate basic questions
          const response = await weaknessQuizService.generateDiagnosticQuiz({
            questionCount,
            userName
          });
          setQuizData(response);
        } else if (targetSkills.length > 0) {
          // For weakness practice, generate targeted questions
          const response = await weaknessQuizService.generateTargetedQuiz({
            targetSkills,
            questionCount,
            targetDifficulty,
            userName
          });
          setQuizData(response);
        } else if (mistakes.length > 0) {
          // Fallback to original weakness quiz
          const request = {
            mistakes,
            userName,
            totalMistakes: mistakes.length
          };
          const response = await weaknessQuizService.generateWeaknessQuiz(request);
          setQuizData(response);
        } else {
          setError('No data available for quiz generation. Please go back and try again.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [location.state]);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quizData?.questions.length || 0) - 1;
  const totalCorrect = questionResults.filter(result => result).length;

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newResults = [...questionResults, isCorrect];
    setQuestionResults(newResults);
    setShowExplanation(true);
    
    if (isLastQuestion) {
      setIsCompleted(true);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion || !quizData) return;
    
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex === 0) return;
    
    setCurrentQuestionIndex(prev => prev - 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your weakness quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-4">Unable to generate questions for your weak areas.</p>
            <Button onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">Great job completing your weakness practice quiz</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {totalCorrect}/{quizData.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((totalCorrect / quizData.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics Practiced:</h3>
              <div className="flex flex-wrap gap-2">
                {quizData.weaknessTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Learn Page
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isDiagnostic ? 'Diagnostic Quiz' : 'Weakness Practice'}
              </h1>
              <p className="text-sm text-gray-600">
                {isDiagnostic 
                  ? 'Quick assessment to identify your weak areas' 
                  : 'Practice questions based on your weak areas'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentQuestion && (
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    currentQuestion.difficulty === 'Easy' 
                      ? 'border-green-300 text-green-700 bg-green-50'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                      : 'border-red-300 text-red-700 bg-red-50'
                  }`}
                >
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium border-blue-300 text-blue-700 bg-blue-50">
                  {currentQuestion.skill}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Question Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    index === currentQuestionIndex
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : questionResults[index] !== undefined
                      ? questionResults[index]
                        ? 'border-green-500 bg-green-100 text-green-700'
                        : 'border-red-500 bg-red-100 text-red-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Progress:</span> {currentQuestionIndex + 1} of {quizData.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Correct:</span> {totalCorrect}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Question Section */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="flex items-center gap-3 mb-6">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {currentQuestion.skill}
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  {currentQuestion.test}
                </Badge>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Question {currentQuestionIndex + 1}
                </h2>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {currentQuestion.question_text}
                  </p>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {[
                  { letter: 'A', text: currentQuestion.option_a },
                  { letter: 'B', text: currentQuestion.option_b },
                  { letter: 'C', text: currentQuestion.option_c },
                  { letter: 'D', text: currentQuestion.option_d }
                ].map((option, index) => {
                  const isSelected = selectedAnswer === option.letter;
                  const isCorrect = option.letter === currentQuestion.correct_answer;
                  const isWrong = showExplanation && isSelected && !isCorrect;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option.letter)}
                      disabled={showExplanation}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        showExplanation
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : isWrong
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                          showExplanation
                            ? isCorrect
                              ? 'border-green-500 bg-green-500 text-white'
                              : isWrong
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-300 bg-gray-300 text-gray-600'
                            : isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-600'
                        }`}>
                          {option.letter}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!showExplanation && (
                <div className="mt-8">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Explanation */}
          {showExplanation && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Explanation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {currentQuestion.correct_rationale}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {!isLastQuestion ? (
                  <Button 
                    onClick={handleNextQuestion}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsCompleted(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Complete Quiz
                  </Button>
                )}
                
                {currentQuestionIndex > 0 && (
                  <Button 
                    onClick={handlePreviousQuestion}
                    variant="outline"
                    className="w-full"
                  >
                    Previous Question
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeaknessQuiz;




