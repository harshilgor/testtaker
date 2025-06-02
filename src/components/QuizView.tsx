
import React, { useState, useEffect } from 'react';
import { questionService, DatabaseQuestion } from '@/services/questionService';
import { supabase } from '@/integrations/supabase/client';
import Calculator from './Calculator';
import { recordQuestionAttempt, getUserTotalPoints } from '@/services/pointsService';
import QuizHeader from './Quiz/QuizHeader';
import QuizProgress from './Quiz/QuizProgress';
import QuestionNavigator from './Quiz/QuestionNavigator';
import QuizSummary from './Quiz/QuizSummary';
import QuizContent from './Quiz/QuizContent';
import { useQuestionSession } from '@/hooks/useQuestionSession';

interface QuizViewProps {
  subject: string;
  topics: string[];
  numQuestions: number;
  onBack: () => void;
  onComplete: (results: any) => void;
  userName: string;
  mode?: 'quiz' | 'marathon';
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Marathon mode specific states
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');

  const { initializeSession } = useQuestionSession();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        console.log('Loading questions for subject:', subject, 'topics:', topics);
        
        // Initialize session for question tracking with error handling
        try {
          await initializeSession(sessionId, mode === 'marathon' ? 'marathon' : 'quiz');
        } catch (sessionError) {
          console.error('Failed to initialize session, continuing without session tracking:', sessionError);
        }
        
        // Map subject to database section
        const section = subject === 'math' ? 'math' : 'reading-writing';
        
        let dbQuestions: DatabaseQuestion[] = [];
        
        try {
          if (topics.length > 0 && !topics.includes('wrong-questions')) {
            // Load questions by specific topics/skills
            for (const topic of topics) {
              const filters = {
                section,
                skill: topic,
                limit: Math.ceil(numQuestions / topics.length)
              };
              try {
                const topicQuestions = await questionService.getRandomQuestions(filters);
                dbQuestions.push(...topicQuestions);
              } catch (topicError) {
                console.error(`Failed to load questions for topic ${topic}:`, topicError);
              }
            }
          } else {
            // Load questions by subject only
            const filters = {
              section,
              limit: numQuestions
            };
            dbQuestions = await questionService.getRandomQuestions(filters);
          }
        } catch (questionsError) {
          console.error('Failed to load questions from service:', questionsError);
          
          // Fallback: try loading directly from database
          console.log('Attempting fallback question loading...');
          try {
            const { data: fallbackQuestions, error: fallbackError } = await supabase
              .from('question_bank')
              .select('*')
              .eq('section', section)
              .not('question_text', 'is', null)
              .limit(numQuestions);

            if (!fallbackError && fallbackQuestions) {
              // Map the question_bank data to DatabaseQuestion format
              dbQuestions = fallbackQuestions.map(q => ({
                ...q,
                id: q.id?.toString() || '',
                is_active: true, // Default value
                created_at: new Date().toISOString(), // Default value
                updated_at: new Date().toISOString(), // Default value
                metadata: {} // Default value
              }));
              console.log('Successfully loaded questions via fallback');
            } else {
              console.error('Fallback question loading also failed:', fallbackError);
            }
          } catch (fallbackError) {
            console.error('Fallback attempt failed:', fallbackError);
          }
        }
        
        // Convert database questions to quiz format
        const convertedQuestions = dbQuestions.map(q => {
          const converted = questionService.convertToLegacyFormat(q);
          return {
            ...converted,
            subject: converted.subject as 'math' | 'english'
          };
        }).slice(0, numQuestions); // Ensure we don't exceed requested count
        
        console.log('Successfully loaded questions:', convertedQuestions.length);
        
        if (convertedQuestions.length === 0) {
          console.warn('No questions loaded for the given criteria');
        }
        
        setQuestions(convertedQuestions);
        setAnswers(new Array(convertedQuestions.length).fill(null));
        setFlaggedQuestions(new Array(convertedQuestions.length).fill(false));
      } catch (error) {
        console.error('Error in loadQuestions:', error);
        // Set empty arrays so the component doesn't crash
        setQuestions([]);
        setAnswers([]);
        setFlaggedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
    loadUserPoints();
  }, [subject, numQuestions, topics, sessionId, mode, initializeSession]);

  const loadUserPoints = async () => {
    try {
      const points = await getUserTotalPoints();
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
      // Don't block the UI if points can't be loaded
      setTotalPoints(0);
    }
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
        console.log('Recording quiz answer for question:', currentQuestion.id, 'correct:', isCorrect);
        
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

        console.log('Quiz answer recorded, points earned:', points);
        
        setSessionPoints(prev => prev + points);
        await loadUserPoints();
      } catch (error) {
        console.error('Error recording answer:', error);
        // Don't block the user from continuing if point recording fails
      }

      // Track question usage with error handling
      try {
        await questionService.trackQuestionUsage(currentQuestion.id, mode === 'marathon' ? 'marathon' : 'quiz', sessionId);
      } catch (error) {
        console.error('Error tracking question usage:', error);
        // Don't block the user from continuing if tracking fails
      }
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
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
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

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const displayTime = finalTimeSpent !== null ? finalTimeSpent : timeSpent;

  if (showSummary && quizResults) {
    return (
      <QuizSummary
        mode={mode}
        userName={userName}
        quizResults={quizResults}
        sessionPoints={sessionPoints}
        onComplete={onComplete}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No questions available for the selected criteria.</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <QuizHeader
          onBack={onBack}
          mode={mode}
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          displayTime={displayTime}
        />

        {mode === 'quiz' && (
          <QuizProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
          />
        )}

        <div className={mode === 'quiz' ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : ''}>
          {mode === 'quiz' && (
            <QuestionNavigator
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onGoToQuestion={goToQuestion}
            />
          )}

          <QuizContent
            mode={mode}
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            showAnswer={showAnswer}
            showExplanation={showExplanation}
            hintText={hintText}
            hintsUsed={hintsUsed}
            isLastQuestion={isLastQuestion}
            calculatorOpen={calculatorOpen}
            onAnswerSelect={handleAnswerSelect}
            onFlag={handleFlag}
            onToggleCalculator={() => setCalculatorOpen(!calculatorOpen)}
            onGetHint={getHint}
            onShowAnswer={handleShowAnswer}
            onPrevious={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};

export default QuizView;
