import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TargetMyWeaknessProps {
  onLaunch?: () => void;
}

const TargetMyWeakness: React.FC<TargetMyWeaknessProps> = ({ 
  onLaunch 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttempts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('question_attempts_v2')
          .select('topic, subject, is_correct')
          .eq('user_id', user.id)
          .limit(5000);

        if (!error && data) {
          setAttempts(data);
        }
      } catch (error) {
        console.error('Error loading attempts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAttempts();
  }, [user]);

  // Find weak topics (accuracy < 60%)
  const weakTopics = useMemo(() => {
    if (!attempts.length) return [];
    
    const topicStats = new Map<string, { correct: number; total: number }>();
    
    attempts.forEach(attempt => {
      const topic = attempt.topic || 'Unknown';
      const current = topicStats.get(topic) || { correct: 0, total: 0 };
      current.total++;
      if (attempt.is_correct) {
        current.correct++;
      }
      topicStats.set(topic, current);
    });
    
    const weak: Array<{ topic: string; accuracy: number }> = [];
    topicStats.forEach((stats, topic) => {
      if (stats.total >= 3) { // Only consider topics with at least 3 attempts
        const topicAccuracy = Math.round((stats.correct / stats.total) * 100);
        if (topicAccuracy < 60) {
          weak.push({ topic, accuracy: topicAccuracy });
        }
      }
    });
    
    return weak.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  }, [attempts]);

  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch();
    } else {
      // Navigate to quiz page with weak topics pre-selected
      if (weakTopics.length > 0) {
        localStorage.setItem('targetWeakness', JSON.stringify({
          topics: weakTopics.map(w => w.topic),
          questionCount: 20
        }));
      }
      navigate('/quiz');
    }
  };

  return (
    <div className="w-full">
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Target My Weakness</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 text-sm mb-4">
            Focused practice on your weakest areas identified by AI.
          </p>
          <Button 
            onClick={handleLaunch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Practice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TargetMyWeakness;
