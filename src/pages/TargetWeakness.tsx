import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  BookmarkCheck,
  Settings,
  Target,
  Volume2,
  VolumeX,
  Menu,
  Pause,
  Square,
  BookOpen,
  Brain,
  Zap,
  Lightbulb,
  Play,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import weaknessQuizService from '@/services/weaknessQuizService';
import { useData } from '@/contexts/DataContext';
import { RealTimePerformanceService } from '@/services/realTimePerformanceService';

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

const TargetWeakness: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionAttempts, isInitialized } = useData();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [showIntroduction, setShowIntroduction] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isCompleted && quizData) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, quizData]);

  // Calculate domain statistics for practice history summary
  const domainStats = useMemo(() => {
    if (!isInitialized || !questionAttempts.length) {
      return {
        readingWriting: [],
        math: []
      };
    }

    // Calculate Reading & Writing domain stats
    const readingWritingDomains = [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ];

    const readingWritingStats = readingWritingDomains.map(domain => {
      const domainAttempts = questionAttempts.filter(attempt => {
        const mappedDomain = RealTimePerformanceService.mapTopicToDomain(attempt.topic);
        return mappedDomain === domain && attempt.subject === 'reading-writing';
      });

      const totalQuestions = domainAttempts.length;
      const wrongQuestions = domainAttempts.filter(a => !a.is_correct).length;
      
      // Get difficulty breakdown
      const easy = domainAttempts.filter(a => a.difficulty === 'Easy').length;
      const medium = domainAttempts.filter(a => a.difficulty === 'Medium').length;
      const hard = domainAttempts.filter(a => a.difficulty === 'Hard').length;

      const easyWrong = domainAttempts.filter(a => a.difficulty === 'Easy' && !a.is_correct).length;
      const mediumWrong = domainAttempts.filter(a => a.difficulty === 'Medium' && !a.is_correct).length;
      const hardWrong = domainAttempts.filter(a => a.difficulty === 'Hard' && !a.is_correct).length;

      return {
        domain,
        totalQuestions,
        wrongQuestions,
        easy,
        medium,
        hard,
        easyWrong,
        mediumWrong,
        hardWrong
      };
    });

    // Calculate Math domain stats
    const mathDomains = [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis'
    ];

    const mathStats = mathDomains.map(domain => {
      const domainAttempts = questionAttempts.filter(attempt => {
        const mappedDomain = RealTimePerformanceService.mapTopicToMathDomain(attempt.topic);
        return mappedDomain === domain && attempt.subject === 'math';
      });

      const totalQuestions = domainAttempts.length;
      const wrongQuestions = domainAttempts.filter(a => !a.is_correct).length;
      
      // Get difficulty breakdown
      const easy = domainAttempts.filter(a => a.difficulty === 'Easy').length;
      const medium = domainAttempts.filter(a => a.difficulty === 'Medium').length;
      const hard = domainAttempts.filter(a => a.difficulty === 'Hard').length;

      const easyWrong = domainAttempts.filter(a => a.difficulty === 'Easy' && !a.is_correct).length;
      const mediumWrong = domainAttempts.filter(a => a.difficulty === 'Medium' && !a.is_correct).length;
      const hardWrong = domainAttempts.filter(a => a.difficulty === 'Hard' && !a.is_correct).length;

      return {
        domain,
        totalQuestions,
        wrongQuestions,
        easy,
        medium,
        hard,
        easyWrong,
        mediumWrong,
        hardWrong
      };
    });

    return {
      readingWriting: readingWritingStats,
      math: mathStats
    };
  }, [questionAttempts, isInitialized]);

  // Load quiz data on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        // Check for saved progress first
        const savedProgress = localStorage.getItem('targetWeaknessProgress');
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          const isRecent = new Date(progressData.timestamp).getTime() > (Date.now() - 24 * 60 * 60 * 1000); // 24 hours
          
          if (isRecent && progressData.quizData) {
            console.log('Loading saved progress:', progressData);
            setQuizData(progressData.quizData);
            setCurrentQuestionIndex(progressData.currentQuestionIndex);
            setSelectedAnswer(progressData.selectedAnswer);
            setShowExplanation(progressData.showExplanation);
            setQuestionResults(progressData.questionResults);
            setTimeSpent(progressData.timeSpent);
            setIsLoading(false);
            return;
          } else {
            // Clear old progress
            localStorage.removeItem('targetWeaknessProgress');
          }
        }

        // Get mistakes data from location state
        const mistakes = location.state?.mistakes || [];
        const userName = location.state?.userName || 'Student';
        const questionCount = location.state?.questionCount || 10;
        
        if (mistakes.length === 0) {
          setError('No mistake data available. Please go back and try again.');
          setIsLoading(false);
          return;
        }

        const request = {
          mistakes,
          userName,
          totalMistakes: mistakes.length,
          questionCount: questionCount
        };

        const response = await weaknessQuizService.generateWeaknessQuiz(request);
        setQuizData(response);
        setShowIntroduction(true); // Show introduction page first
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [location.state]);

  // Load and persist bookmarks
  useEffect(() => {
    const userName = location.state?.userName || 'Student';
    try {
      const saved = localStorage.getItem(`bookmarked_questions_${userName}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarkedQuestions(new Set(parsed.map((id: any) => String(id))));
        }
      }
    } catch {}
  }, [location.state]);

  const saveBookmarks = (set: Set<string>) => {
    const userName = location.state?.userName || 'Student';
    localStorage.setItem(`bookmarked_questions_${userName}`, JSON.stringify([...set]));
  };

  const toggleBookmarkCurrent = () => {
    if (!currentQuestion) return;
    const id = String(currentQuestion.id);
    setBookmarkedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // also remove from details cache
        try {
          const userName = location.state?.userName || 'Student';
          const detailsKey = `bookmarked_question_details_${userName}`;
          const details = JSON.parse(localStorage.getItem(detailsKey) || '{}');
          if (details && details[id]) {
            delete details[id];
            localStorage.setItem(detailsKey, JSON.stringify(details));
          }
        } catch {}
      } else {
        next.add(id);
        // store a snapshot of details for quick viewing
        try {
          const userName = location.state?.userName || 'Student';
          const detailsKey = `bookmarked_question_details_${userName}`;
          const details = JSON.parse(localStorage.getItem(detailsKey) || '{}');
          details[id] = {
            id: currentQuestion.id,
            question_text: currentQuestion.question_text,
            option_a: currentQuestion.option_a,
            option_b: currentQuestion.option_b,
            option_c: currentQuestion.option_c,
            option_d: currentQuestion.option_d,
            correct_answer: currentQuestion.correct_answer,
            correct_rationale: currentQuestion.correct_rationale,
            skill: currentQuestion.skill,
            difficulty: currentQuestion.difficulty,
            domain: currentQuestion.domain,
            test: currentQuestion.test,
          };
          localStorage.setItem(detailsKey, JSON.stringify(details));
        } catch {}
      }
      saveBookmarks(next);
      return next;
    });
  };

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
      // Clear saved progress when naturally completing
      localStorage.removeItem('targetWeaknessProgress');
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
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Drag functionality for divider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 30% and 70%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 70);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handlePause = () => {
    setIsPaused(!isPaused);
    setShowMenu(false);
    
    // Save progress when pausing
    if (!isPaused) {
      const progressData = {
        currentQuestionIndex,
        selectedAnswer,
        showExplanation,
        questionResults,
        timeSpent,
        quizData: quizData ? {
          questions: quizData.questions,
          weaknessTopics: quizData.weaknessTopics,
          totalQuestions: quizData.totalQuestions,
          estimatedTime: quizData.estimatedTime
        } : null,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('targetWeaknessProgress', JSON.stringify(progressData));
      console.log('Progress saved:', progressData);
    }
  };

  const handleEnd = () => {
    setIsCompleted(true);
    setShowMenu(false);
    // Clear saved progress when ending
    localStorage.removeItem('targetWeaknessProgress');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your weakness practice...</p>
        </div>
      </div>
    );
  }

  // Show introduction page
  if (showIntroduction && quizData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="w-full">
            <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Target My Weakness Practice</h1>
              <p className="text-gray-600">Complete analysis of your practice history across all domains</p>
            </div>

            {/* Practice History Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Practice History</h2>
              
              {/* Reading and Writing Domains */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">RW</span>
                  </span>
                  Reading & Writing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainStats.readingWriting.map((stat) => (
                    <div key={stat.domain} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="font-semibold text-gray-900 mb-2">{stat.domain}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">{stat.totalQuestions} solved</span>
                        {stat.wrongQuestions > 0 && (
                          <span className="text-red-600 font-medium"> • {stat.wrongQuestions} mistakes</span>
                        )}
                      </div>
                      {stat.totalQuestions > 0 && (
                        <div className="space-y-2 text-xs text-gray-600">
                          {stat.easy > 0 && (
                            <div className="flex justify-between">
                              <span>Easy:</span>
                              <span className="font-medium">{stat.easyWrong} wrong out of {stat.easy}</span>
                            </div>
                          )}
                          {stat.medium > 0 && (
                            <div className="flex justify-between">
                              <span>Medium:</span>
                              <span className="font-medium">{stat.mediumWrong} wrong out of {stat.medium}</span>
                            </div>
                          )}
                          {stat.hard > 0 && (
                            <div className="flex justify-between">
                              <span>Hard:</span>
                              <span className="font-medium">{stat.hardWrong} wrong out of {stat.hard}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Math Domains */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">M</span>
                  </span>
                  Math
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {domainStats.math.map((stat) => (
                    <div key={stat.domain} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="font-semibold text-gray-900 mb-2 text-sm">{stat.domain}</div>
                      <div className="text-xs text-gray-600 mb-3">
                        <span className="font-medium">{stat.totalQuestions} solved</span>
                        {stat.wrongQuestions > 0 && (
                          <span className="text-red-600 font-medium"> • {stat.wrongQuestions} mistakes</span>
                        )}
                      </div>
                      {stat.totalQuestions > 0 && (
                        <div className="space-y-2 text-xs text-gray-600">
                          {stat.easy > 0 && (
                            <div className="flex justify-between">
                              <span>Easy:</span>
                              <span className="font-medium">{stat.easyWrong} wrong out of {stat.easy}</span>
                            </div>
                          )}
                          {stat.medium > 0 && (
                            <div className="flex justify-between">
                              <span>Medium:</span>
                              <span className="font-medium">{stat.mediumWrong} wrong out of {stat.medium}</span>
                            </div>
                          )}
                          {stat.hard > 0 && (
                            <div className="flex justify-between">
                              <span>Hard:</span>
                              <span className="font-medium">{stat.hardWrong} wrong out of {stat.hard}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiz Overview */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Upcoming Practice Session
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{quizData.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{quizData.estimatedTime}</div>
                  <div className="text-sm text-gray-600">Estimated Time</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => navigate('/learn')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learn
              </Button>
              <Button
                onClick={() => setShowIntroduction(false)}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Practice
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learn
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-4">Unable to generate questions for your weak areas.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learn
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-xl border-0">
          <CardContent className="p-12">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Practice Complete!</h1>
              <p className="text-lg text-gray-600">Great job completing your weakness practice session</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {totalCorrect}/{quizData.totalQuestions}
                </div>
                <div className="text-sm font-medium text-blue-700">Correct Answers</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round((totalCorrect / quizData.totalQuestions) * 100)}%
                </div>
                <div className="text-sm font-medium text-green-700">Accuracy</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm font-medium text-purple-700">Time Spent</div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Topics Practiced:</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {quizData.weaknessTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 px-4 py-2 text-sm font-medium">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Learn Page
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 h-12 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
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
    <div className="min-h-screen bg-white">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-bold text-gray-900">
              Weakness Practice
            </div>
            {/* Progress Bar aligned with title */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: quizData?.totalQuestions || 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${
                    i < currentQuestionIndex + 1
                      ? i % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
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
            <div className="relative menu-container">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-32 z-50">
                  <button
                    onClick={handlePause}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleEnd}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    End
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        
      {/* Main Content Area */}
      <div ref={containerRef} className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Question Prompt */}
        <div 
          className="p-8 border-r border-gray-200 overflow-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </div>
          </div>
        </div>

        {/* Draggable Divider */}
        <div 
          className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 bg-transparent group-hover:bg-gray-200 transition-colors"></div>
        </div>

        {/* Right Panel - Answer Choices */}
        <div 
          className="p-8 overflow-auto"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center text-sm font-medium">
              {currentQuestionIndex + 1}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mark for Review</span>
              <button
                onClick={toggleBookmarkCurrent}
                className="w-5 h-5 flex items-center justify-center hover:text-blue-600"
                title={bookmarkedQuestions.has(String(currentQuestion.id)) ? 'Remove bookmark' : 'Bookmark this question'}
              >
                {bookmarkedQuestions.has(String(currentQuestion.id)) ? (
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              Which choice most effectively uses a quotation from The Tempest to illustrate the claim?
            </p>
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
                <div
                  key={index}
                  onClick={() => !showExplanation && handleAnswerSelect(option.letter)}
                  className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                    showExplanation
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isWrong
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 border rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      showExplanation
                        ? isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-300 bg-white text-gray-600'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-white text-gray-600'
                    }`}>
                      {option.letter}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">
                      {option.text}
                    </p>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showExplanation && (
            <div className="mt-8">
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`w-full py-3 px-4 rounded text-sm font-medium transition-all duration-200 ${
                  selectedAnswer
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Explanation</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {currentQuestion.correct_rationale}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {showExplanation && (
            <div className="mt-6 space-y-3">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 px-4 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 transition-all duration-200"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setIsCompleted(true)}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-all duration-200"
                >
                  Complete Practice
                </button>
              )}
              
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePreviousQuestion}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Previous Question
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 transition-all duration-200">
              Question {currentQuestionIndex + 1} of {quizData.totalQuestions} &gt;
            </button>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={isLastQuestion}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  isLastQuestion
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetWeakness;




