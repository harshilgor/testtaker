
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
import FeedbackModal from './FeedbackModal';

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
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
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
  
  // New feedback preference states
  const [feedbackPreference, setFeedbackPreference] = useState<'immediate' | 'end'>('immediate');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
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
          // Enhanced question loading logic with better error handling
          if (topics.length > 0 && !topics.includes('wrong-questions')) {
            console.log('Loading questions by specific topics/skills:', topics);
            
            // Try to load questions from question_bank table with skill filter
            for (const topic of topics) {
              try {
                console.log(`Loading questions for topic: ${topic}`);
                
                const { data: topicQuestions, error: topicError } = await supabase
                  .from('question_bank')
                  .select('*')
                  .eq('section', section)
                  .eq('skill', topic)
                  .not('question_text', 'is', null)
                  .limit(Math.ceil(numQuestions / topics.length));

                if (topicError) {
                  console.error(`Error loading questions for topic ${topic}:`, topicError);
                  continue;
                }

                if (topicQuestions && topicQuestions.length > 0) {
                  console.log(`Found ${topicQuestions.length} questions for topic ${topic}`);
                  
                  // Convert to DatabaseQuestion format
                  const convertedTopicQuestions = topicQuestions.map(q => ({
                    ...q,
                    id: q.id?.toString() || '',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    metadata: {}
                  }));
                  
                  dbQuestions.push(...convertedTopicQuestions);
                } else {
                  console.log(`No questions found for topic ${topic} in section ${section}`);
                }
              } catch (topicError) {
                console.error(`Failed to load questions for topic ${topic}:`, topicError);
              }
            }
            
            // If no questions found by skill, try loading by section only
            if (dbQuestions.length === 0) {
              console.log('No questions found by skill, loading by section only');
              
              const { data: fallbackQuestions, error: fallbackError } = await supabase
                .from('question_bank')
                .select('*')
                .eq('section', section)
                .not('question_text', 'is', null)
                .limit(numQuestions);

              if (!fallbackError && fallbackQuestions) {
                const convertedFallback = fallbackQuestions.map(q => ({
                  ...q,
                  id: q.id?.toString() || '',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  metadata: {}
                }));
                dbQuestions.push(...convertedFallback);
              }
            }
          } else {
            // Load questions by section only
            console.log('Loading questions by section only:', section);
            
            const { data: sectionQuestions, error: sectionError } = await supabase
              .from('question_bank')
              .select('*')
              .eq('section', section)
              .not('question_text', 'is', null)
              .limit(numQuestions);

            if (!sectionError && sectionQuestions) {
              const convertedSection = sectionQuestions.map(q => ({
                ...q,
                id: q.id?.toString() || '',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                metadata: {}
              }));
              dbQuestions.push(...convertedSection);
            }
          }
        } catch (questionsError) {
          console.error('Failed to load questions:', questionsError);
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
          // Try one more fallback - load any questions from the section
          try {
            const { data: anyQuestions, error: anyError } = await supabase
              .from('question_bank')
              .select('*')
              .eq('section', section)
              .not('question_text', 'is', null)
              .limit(numQuestions);

            if (!anyError && anyQuestions && anyQuestions.length > 0) {
              console.log('Loaded fallback questions:', anyQuestions.length);
              const fallbackConverted = anyQuestions.map(q => {
                const converted = questionService.convertToLegacyFormat({
                  ...q,
                  id: q.id?.toString() || '',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  metadata: {}
                });
                return {
                  ...converted,
                  subject: converted.subject as 'math' | 'english'
                };
              });
              setQuestions(fallbackConverted);
              setAnswers(new Array(fallbackConverted.length).fill(null));
              setFlaggedQuestions(new Array(fallbackConverted.length).fill(false));
              setIsLoading(false);
              return;
            }
          } catch (finalError) {
            console.error('Final fallback also failed:', finalError);
          }
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

    // Track that this question has been answered for points calculation
    const newAnsweredQuestions = new Set(answeredQuestions);
    const wasAlreadyAnswered = newAnsweredQuestions.has(currentQuestionIndex);
    newAnsweredQuestions.add(currentQuestionIndex);
    setAnsweredQuestions(newAnsweredQuestions);

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !wasAlreadyAnswered) {
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      
      try {
        console.log('Recording quiz answer for question:', currentQuestion.id, 'correct:', isCorrect);
        
        const points = await recordQuestionAttempt({
          question_id: currentQuestion.id.toString(),
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

      // Show immediate feedback if preference is set to immediate
      if (mode === 'quiz' && feedbackPreference === 'immediate') {
        const selectedOptionLetter = String.fromCharCode(65 + answerIndex);
        const correctOptionLetter = String.fromCharCode(65 + currentQuestion.correctAnswer);
        
        setCurrentFeedback({
          isCorrect,
          selectedAnswer: selectedOptionLetter,
          correctAnswer: correctOptionLetter,
          correctRationale: currentQuestion.rationales?.correct || currentQuestion.explanation,
          incorrectRationale: currentQuestion.rationales?.incorrect?.[selectedOptionLetter as keyof typeof currentQuestion.rationales.incorrect],
          allIncorrectRationales: currentQuestion.rationales?.incorrect || {}
        });
        setShowFeedbackModal(true);
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

  const handleFeedbackNext = () => {
    setShowFeedbackModal(false);
    setCurrentFeedback(null);
    handleNext();
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

  if (showDetailedResults && quizResults) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowDetailedResults(false)}
              className="text-blue-600 hover:text-blue-700 font-medium mr-4"
            >
              ← Back to Summary
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detailed Quiz Results</h1>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
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

                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {question.options?.map((option, optionIndex) => {
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
                    <p className="text-blue-700 text-sm">
                      {question.rationales?.correct || question.explanation}
                    </p>
                  </div>

                  {!isCorrect && userAnswer !== null && question.rationales?.incorrect && (
                    <div className="bg-red-50 border border-red-200 rounded p-4 mt-2">
                      <h4 className="font-semibold text-red-800 mb-2">Why {userOptionLetter} is Wrong</h4>
                      <p className="text-red-700 text-sm">
                        {question.rationales.incorrect[userOptionLetter as keyof typeof question.rationales.incorrect]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onComplete(quizResults)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary && quizResults) {
    return (
      <QuizSummary
        mode={mode}
        userName={userName}
        quizResults={quizResults}
        sessionPoints={sessionPoints}
        onComplete={onComplete}
        onViewDetailed={feedbackPreference === 'end' ? () => setShowDetailedResults(true) : undefined}
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
          <p className="text-slate-500 text-sm mb-4">
            Tried loading: {subject} questions {topics.length > 0 ? `for topics: ${topics.join(', ')}` : ''}
          </p>
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

        {/* Feedback Preference Selection - Only show at start of quiz */}
        {mode === 'quiz' && currentQuestionIndex === 0 && getAnsweredCount() === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Choose Your Feedback Preference</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="feedback"
                  value="immediate"
                  checked={feedbackPreference === 'immediate'}
                  onChange={(e) => setFeedbackPreference(e.target.value as 'immediate' | 'end')}
                  className="mr-2"
                />
                <span className="text-blue-700">Show correct answer and explanation after each question</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="feedback"
                  value="end"
                  checked={feedbackPreference === 'end'}
                  onChange={(e) => setFeedbackPreference(e.target.value as 'immediate' | 'end')}
                  className="mr-2"
                />
                <span className="text-blue-700">Show all answers and explanations after completing the quiz</span>
              </label>
            </div>
          </div>
        )}

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
            hideExplanation={mode === 'quiz' && feedbackPreference === 'immediate'}
          />
        </div>
      </div>

      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      {showFeedbackModal && currentFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          isCorrect={currentFeedback.isCorrect}
          selectedAnswer={currentFeedback.selectedAnswer}
          correctAnswer={currentFeedback.correctAnswer}
          correctRationale={currentFeedback.correctRationale}
          incorrectRationale={currentFeedback.incorrectRationale}
          allIncorrectRationales={currentFeedback.allIncorrectRationales}
          onNext={handleFeedbackNext}
        />
      )}
    </div>
  );
};

export default QuizView;
