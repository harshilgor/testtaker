import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, BookOpen, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from '@/services/recentSessionsService';
import { useQuery } from '@tanstack/react-query';

interface SessionMistakesProps {
  session: Session | null;
}

interface Mistake {
  id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  question_text?: string;
  correct_answer?: string;
  explanation?: string;
  options?: string[];
  user_answer?: string;
}

const SessionMistakes: React.FC<SessionMistakesProps> = ({ session }) => {
  const { user } = useAuth();
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);

  // Fetch mistakes for the selected session
  const { data: mistakes = [], isLoading } = useQuery({
    queryKey: ['session-mistakes', session?.id],
    queryFn: async () => {
      if (!session || !user?.id) return [];

      // Get all attempts for this session
      // Match by session_id and session_type
      const { data: attempts, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', session.id)
        .eq('session_type', session.type)
        .eq('is_correct', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session mistakes:', error);
        return [];
      }

      // Fetch question details for each mistake
      const mistakesWithDetails = await Promise.all(
        (attempts || []).map(async (attempt) => {
          try {
            const { data: question } = await supabase
              .from('question_bank')
              .select('*')
              .eq('id', attempt.question_id)
              .single();

            return {
              id: attempt.id,
              question_id: attempt.question_id,
              topic: attempt.topic || 'Unknown',
              difficulty: attempt.difficulty || 'medium',
              subject: attempt.subject || 'Unknown',
              time_spent: attempt.time_spent || 0,
              created_at: attempt.created_at,
              question_text: question?.question_text,
              correct_answer: question?.correct_answer,
              explanation: question?.correct_rationale,
              options: question ? [
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d
              ] : []
            };
          } catch (error) {
            console.error('Error fetching question details:', error);
            return {
              id: attempt.id,
              question_id: attempt.question_id,
              topic: attempt.topic || 'Unknown',
              difficulty: attempt.difficulty || 'medium',
              subject: attempt.subject || 'Unknown',
              time_spent: attempt.time_spent || 0,
              created_at: attempt.created_at
            };
          }
        })
      );

      return mistakesWithDetails;
    },
    enabled: !!session && !!user?.id
  });

  if (!session) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a session to view mistakes</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Session Mistakes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Loading mistakes...</p>
        </CardContent>
      </Card>
    );
  }

  if (mistakes.length === 0) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Session Mistakes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No mistakes in this session!</p>
            <p className="text-gray-500 text-sm mt-2">Great job! You answered all questions correctly.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Mistakes from Session ({mistakes.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {mistakes.map((mistake) => (
              <div
                key={mistake.id}
                className="p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={() => setSelectedMistake(mistake)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{mistake.difficulty}</Badge>
                    <span className="text-sm font-medium text-gray-900">{mistake.topic}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{Math.round(mistake.time_spent / 60)} min</span>
                  </div>
                </div>
                {mistake.question_text && (
                  <p className="text-sm text-gray-700 line-clamp-2">{mistake.question_text}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mistake Detail Dialog */}
      {selectedMistake && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Question Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMistake(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">{selectedMistake.difficulty}</Badge>
                  <span className="text-sm font-medium">{selectedMistake.topic}</span>
                </div>
                <p className="text-gray-900 font-medium mb-4">{selectedMistake.question_text}</p>
                
                {selectedMistake.options && (
                  <div className="space-y-2 mb-4">
                    {selectedMistake.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          String.fromCharCode(65 + index) === selectedMistake.correct_answer
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}. {option}
                        </span>
                        {String.fromCharCode(65 + index) === selectedMistake.correct_answer && (
                          <Badge className="ml-2 bg-green-600">Correct Answer</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedMistake.explanation && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
                    <p className="text-sm text-blue-800">{selectedMistake.explanation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SessionMistakes;

