
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMarathonSession } from '../hooks/useMarathonSession';
import { DatabaseQuestion } from '@/services/questionService';
import { QuestionAttempt } from '../types/marathon';
import { useQuestionSession } from '@/hooks/useQuestionSession';
import MarathonQuestion from './MarathonQuestion';

const Marathon: React.FC = () => {
  const { session, recordAttempt, toggleFlag, flaggedQuestions } = useMarathonSession();
  const { getNextQuestion, markQuestionUsed, getSessionStats, getTotalQuestions } = useQuestionSession();
  const [currentQuestion, setCurrentQuestion] = useState<DatabaseQuestion | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ used: 0, total: 0 });

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
    }
  }, [session]);

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
      const filters = {
        section: session.subjects.includes('both') ? null : session.subjects[0],
        difficulty: session.difficulty === 'mixed' ? null : session.difficulty
      };

      const question = await getNextQuestion(session.id, 'marathon', filters);
      
      if (question) {
        setCurrentQuestion(question);
        setTimeSpent(0);
        
        // Mark question as used
        await markQuestionUsed(session.id, 'marathon', question.id);
        
        // Update stats
        await loadSessionStats();
      } else {
        // No more questions available
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error loading next question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string, isCorrect: boolean, showAnswerUsed: boolean) => {
    if (!currentQuestion || !session) return;

    // Record the attempt with all required properties
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      subject: currentQuestion.section === 'math' ? 'math' : 'english',
      topic: currentQuestion.skill,
      difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
      isCorrect,
      timeSpent,
      hintsUsed: 0, // Default value for marathon mode
      showAnswerUsed,
      flagged: flaggedQuestions.includes(currentQuestion.id),
      timestamp: new Date()
    };

    recordAttempt(attempt);
  };

  const handleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-center text-gray-600">Please start a marathon session first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-center text-gray-600">Loading next question...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Congratulations! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              You've completed all available questions in your current filter settings.
            </p>
            <p className="text-sm text-gray-500">
              Solved {sessionStats.used} out of {sessionStats.total} total questions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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
      </div>
    </div>
  );
};

export default Marathon;
