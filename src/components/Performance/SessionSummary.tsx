import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  Brain, 
  FileText, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  BarChart3,
  ArrowLeft,
  Calendar,
  Timer,
  Award,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SessionSummaryProps {
  sessionId: string;
  sessionType: 'marathon' | 'quiz' | 'mocktest';
  onClose: () => void;
}

interface DetailedSessionData {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest';
  date: string;
  questions: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  subject?: string;
  difficulty?: string;
  score?: number;
  timeSpent?: number;
  questionsData?: QuestionDetail[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

interface QuestionDetail {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  subject?: string;
  skill?: string;
  difficulty?: string;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionId, sessionType, onClose }) => {
  const [sessionData, setSessionData] = useState<DetailedSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId, sessionType]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }

      let sessionResult;
      
      // Fetch session data based on type
      switch (sessionType) {
        case 'marathon':
          sessionResult = await supabase
            .from('marathon_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.user.id)
            .single();
          break;
        case 'quiz':
          sessionResult = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.user.id)
            .single();
          break;
        case 'mocktest':
          sessionResult = await supabase
            .from('mock_test_results')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.user.id)
            .single();
          break;
        default:
          throw new Error('Invalid session type');
      }

      if (sessionResult.error) {
        throw new Error(sessionResult.error.message);
      }

      const session = sessionResult.data;
      
      // Transform the data
      const detailedSession: DetailedSessionData = {
        id: session.id,
        type: sessionType,
        date: session.created_at || session.completed_at,
        questions: session.total_questions || 0,
        accuracy: session.accuracy || 0,
        correctAnswers: session.correct_answers || 0,
        incorrectAnswers: (session.total_questions || 0) - (session.correct_answers || 0),
        subject: session.subject,
        difficulty: session.difficulty,
        score: session.score,
        timeSpent: session.time_spent,
        questionsData: [], // We'll fetch this separately if needed
        strengths: generateStrengths(session),
        weaknesses: generateWeaknesses(session),
        recommendations: generateRecommendations(session)
      };

      setSessionData(detailedSession);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const generateStrengths = (session: any): string[] => {
    const strengths = [];
    const accuracy = session.accuracy || 0;
    
    if (accuracy >= 80) {
      strengths.push('Excellent accuracy');
    } else if (accuracy >= 60) {
      strengths.push('Good accuracy');
    }
    
    if (session.total_questions >= 20) {
      strengths.push('High question volume');
    }
    
    if (session.difficulty === 'hard') {
      strengths.push('Tackled challenging content');
    }
    
    return strengths;
  };

  const generateWeaknesses = (session: any): string[] => {
    const weaknesses = [];
    const accuracy = session.accuracy || 0;
    
    if (accuracy < 60) {
      weaknesses.push('Low accuracy');
    }
    
    if (session.total_questions < 10) {
      weaknesses.push('Limited practice volume');
    }
    
    if (session.difficulty === 'easy') {
      weaknesses.push('Stick to easier content');
    }
    
    return weaknesses;
  };

  const generateRecommendations = (session: any): string[] => {
    const recommendations = [];
    const accuracy = session.accuracy || 0;
    
    if (accuracy < 70) {
      recommendations.push('Focus on fundamental concepts');
      recommendations.push('Practice more questions in this area');
    }
    
    if (session.difficulty === 'easy') {
      recommendations.push('Try medium difficulty questions');
    }
    
    recommendations.push('Review incorrect answers');
    recommendations.push('Take another practice session');
    
    return recommendations;
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'marathon': return <Target className="h-6 w-6 text-orange-500" />;
      case 'quiz': return <Brain className="h-6 w-6 text-purple-500" />;
      case 'mocktest': return <FileText className="h-6 w-6 text-blue-500" />;
      default: return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'marathon': return 'Marathon Session';
      case 'quiz': return 'Quiz Session';
      case 'mocktest': return 'Mock Test';
      default: return 'Session';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading session details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Session</h3>
              <p className="text-gray-600 mb-4">{error || 'Session not found'}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                {getSessionIcon(sessionData.type)}
                <div>
                  <CardTitle className="text-xl">{getSessionTypeLabel(sessionData.type)}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(sessionData.date)}
                    </div>
                    {sessionData.timeSpent && (
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {formatTime(sessionData.timeSpent)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {sessionData.score && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-lg px-4 py-2">
                <Award className="h-4 w-4 mr-1" />
                {sessionData.score} pts
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Performance Overview */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{sessionData.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{sessionData.correctAnswers}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{sessionData.incorrectAnswers}</div>
                      <div className="text-sm text-gray-600">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{sessionData.questions}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{sessionData.accuracy}%</span>
                    </div>
                    <Progress value={sessionData.accuracy} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{getSessionTypeLabel(sessionData.type)}</span>
                      </div>
                      {sessionData.subject && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <Badge variant="secondary">{sessionData.subject}</Badge>
                        </div>
                      )}
                      {sessionData.difficulty && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <Badge variant="secondary">{sessionData.difficulty}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">{sessionData.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(sessionData.date).toLocaleDateString()}</span>
                      </div>
                      {sessionData.timeSpent && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Spent:</span>
                          <span className="font-medium">{formatTime(sessionData.timeSpent)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sessionData.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sessionData.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Recommendations */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {sessionData.recommendations?.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="default">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Review Questions
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Practice Similar
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Brain className="h-4 w-4 mr-2" />
                      Take Another Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionSummary;
