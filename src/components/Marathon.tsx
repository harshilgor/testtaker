
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarathonSession } from '../hooks/useMarathonSession';
import { DatabaseQuestion } from '@/services/questionService';
import { QuestionAttempt, MarathonSettings } from '../types/marathon';
import { useQuestionSession } from '@/hooks/useQuestionSession';
import MarathonQuestion from './MarathonQuestion';
import MarathonSummary from './MarathonSummary';
import { AlertTriangle, LogOut, Trophy } from 'lucide-react';
import { recordQuestionAttempt, getUserTotalPoints } from '@/services/pointsService';
import { supabase } from '@/integrations/supabase/client';

interface MarathonProps {
  settings?: MarathonSettings | null;
  onBack: () => void;
  onEndMarathon: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ settings, onBack, onEndMarathon }) => {
  const { session, recordAttempt, toggleFlag, flaggedQuestions, endSession } = useMarathonSession();
  const { getNextQuestion, markQuestionUsed, getSessionStats, getTotalQuestions } = useQuestionSession();
  const [currentQuestion, setCurrentQuestion] = useState<DatabaseQuestion | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ used: 0, total: 0 });
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!session || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session, currentQuestion]);

  // Load session stats and first question
  useEffect(() => {
    if (session) {
      loadSessionStats();
      loadNextQuestion();
      loadUserPoints();
    }
  }, [session]);

  const loadUserPoints = async () => {
    const points = await getUserTotalPoints();
    setTotalPoints(points);
  };

  const loadSessionStats = async () => {
    if (!session) return;
    
    const stats = await getSessionStats(session.id, 'marathon');
    const total = await getTotalQuestions();
    setSessionStats({ used: stats.used, total: total });
  };

  const loadNextQuestion = async () => {
    if (!session) return;

    setLoading(true);
    try {
      // Create better filters based on session settings
      const filters: any = {};
      
      if (session.subjects.length > 0 && !session.subjects.includes('both')) {
        if (session.subjects.includes('math')) {
          filters.section = 'math';
        } else if (session.subjects.includes('english')) {
          filters.section = 'reading-writing';
        }
      }
      
      if (session.difficulty !== 'mixed') {
        filters.difficulty = session.difficulty;
      }

      console.log('Loading question with filters:', filters);
      const question = await getNextQuestion(session.id, 'marathon', filters);
      
      if (question) {
        console.log('Loaded question:', question);
        setCurrentQuestion(question);
        setTimeSpent(0);
        
        // Mark question as used
        await markQuestionUsed(session.id, 'marathon', question.id);
        
        // Update stats
        await loadSessionStats();
      } else {
        console.log('No more questions available');
        // No more questions available - show summary
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error loading next question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string, isCorrect: boolean, showAnswerUsed: boolean) => {
    if (!currentQuestion || !session) return;

    try {
      // Record the attempt with points in the database
      const points = await recordQuestionAttempt({
        question_id: currentQuestion.id,
        session_id: session.id,
        session_type: 'marathon',
        is_correct: isCorrect,
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
        subject: currentQuestion.section === 'math' ? 'math' : 'english',
        topic: currentQuestion.skill,
        time_spent: timeSpent
      });

      // Update session points
      setSessionPoints(prev => prev + points);
      
      // Reload total points
      await loadUserPoints();

      // Record the attempt with marathon session
      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        subject: currentQuestion.section === 'math' ? 'math' : 'english',
        topic: currentQuestion.skill,
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
        isCorrect,
        timeSpent,
        hintsUsed: 0,
        showAnswerUsed,
        flagged: flaggedQuestions.includes(currentQuestion.id),
        timestamp: new Date()
      };

      recordAttempt(attempt);
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  };

  const handleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  const handleEndMarathon = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndMarathon = () => {
    endSession();
    setShowSummary(true);
    setShowEndConfirmation(false);
  };

  const handleBackFromSummary = () => {
    onBack();
  };

  const handleRestartFromSummary = () => {
    setShowSummary(false);
    setCurrentQuestion(null);
    onBack();
  };

  // Show summary if session ended
  if (showSummary) {
    return (
      <MarathonSummary
        session={session}
        attempts={session?.attempts || []}
        weakTopics={[]}
        onBack={handleBackFromSummary}
        onRestart={handleRestartFromSummary}
      />
    );
  }

  if (!session && !settings) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 border-slate-200">
          <CardContent>
            <p className="text-center text-slate-600">Please configure your marathon settings first.</p>
            <Button onClick={onBack} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
              Back to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 border-slate-200">
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading next question...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 border-slate-200">
          <CardContent className="text-center">
            <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Congratulations! 🎉
            </h2>
            <p className="text-slate-600 mb-4">
              You've completed all available questions in your current filter settings.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Solved {sessionStats.used} out of {sessionStats.total} total questions
            </p>
            <div className="space-x-4">
              <Button onClick={onBack} variant="outline" className="border-slate-300">
                Back to Settings
              </Button>
              <Button onClick={onEndMarathon} className="bg-blue-600 hover:bg-blue-700">
                View Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Marathon Header with Points and End Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Marathon Mode</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-600">
                Question {sessionStats.used + 1} of {sessionStats.total}
              </p>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {totalPoints} pts (+{sessionPoints} this session)
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleEndMarathon}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            End Marathon
          </Button>
        </div>

        <MarathonQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          onFlag={handleFlag}
          onNext={handleNext}
          isFlagged={flaggedQuestions.includes(currentQuestion.id)}
          timeSpent={timeSpent}
          questionNumber={sessionStats.used + 1}
          totalQuestions={sessionStats.total}
          questionsAttempted={sessionStats.used}
        />

        {/* End Marathon Confirmation Modal */}
        {showEndConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4 border-slate-200">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-900">End Marathon Session?</h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to end your marathon session? Your progress will be saved.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowEndConfirmation(false)}
                    variant="outline"
                    className="flex-1 border-slate-300"
                  >
                    Continue
                  </Button>
                  <Button
                    onClick={confirmEndMarathon}
                    variant="destructive"
                    className="flex-1"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marathon;
