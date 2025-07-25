
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopicPerformance {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

interface WeakestTopicsSectionProps {
  userName: string;
}

const WeakestTopicsSection: React.FC<WeakestTopicsSectionProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [mathTopics, setMathTopics] = useState<TopicPerformance[]>([]);
  const [englishTopics, setEnglishTopics] = useState<TopicPerformance[]>([]);

  // Fetch quiz results from database
  const { data: dbQuizResults = [], refetch } = useQuery({
    queryKey: ['weakest-topics-quiz-results', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch marathon sessions for additional topic analysis
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['weakest-topics-marathon-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  useEffect(() => {
    analyzeWeakestTopics();
  }, [dbQuizResults, marathonSessions]);

  const analyzeWeakestTopics = () => {
    // Get localStorage quiz results
    const localQuizResults = JSON.parse(localStorage.getItem('quizResults') || '[]')
      .filter((result: any) => result.userName === userName);

    // Combine all topic performance data
    const topicStats: { [key: string]: { total: number, correct: number, subject: string } } = {};

    // Process local quiz results
    localQuizResults.forEach((quiz: any) => {
      quiz.topics?.forEach((topic: string) => {
        const key = `${quiz.subject}-${topic}`;
        if (!topicStats[key]) {
          topicStats[key] = { total: 0, correct: 0, subject: quiz.subject };
        }
        
        // Calculate correct answers for this topic
        const topicCorrect = quiz.answers.filter((answer: number | null, index: number) => 
          answer === quiz.questions[index]?.correctAnswer
        ).length;
        
        topicStats[key].total += quiz.questions.length;
        topicStats[key].correct += topicCorrect;
      });
    });

    // Process database quiz results
    dbQuizResults.forEach((quiz: any) => {
      quiz.topics?.forEach((topic: string) => {
        const key = `${quiz.subject}-${topic}`;
        if (!topicStats[key]) {
          topicStats[key] = { total: 0, correct: 0, subject: quiz.subject };
        }
        
        topicStats[key].total += quiz.total_questions || 0;
        topicStats[key].correct += quiz.correct_answers || 0;
      });
    });

    // Filter topics with at least 5 questions and calculate accuracy
    const qualifiedTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total >= 5)
      .map(([key, stats]) => {
        const topic = key.split('-').slice(1).join('-');
        return {
          topic,
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          subject: stats.subject
        };
      });

    // Separate by subject and get top 5 weakest
    const mathWeakest = qualifiedTopics
      .filter(topic => topic.subject === 'math')
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const englishWeakest = qualifiedTopics
      .filter(topic => topic.subject === 'english')
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    setMathTopics(mathWeakest);
    setEnglishTopics(englishWeakest);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 50) return 'text-red-600 bg-red-50';
    if (accuracy < 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const handlePractice = (topic: string, subject: 'math' | 'english') => {
    // Store the selected topic and navigate to quiz
    localStorage.setItem('selectedQuizTopic', JSON.stringify({
      subject,
      topic,
      questionCount: 10
    }));
    navigate('/quiz');
  };

  const handleRefresh = () => {
    refetch();
    analyzeWeakestTopics();
  };

  const renderTopicCard = (topic: TopicPerformance, subject: 'math' | 'english') => (
    <div key={topic.topic} className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm md:text-base">{topic.topic}</h4>
        <div className="flex items-center mt-1 space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(topic.accuracy)}`}>
            {topic.accuracy}%
          </span>
          <span className="text-xs text-gray-500">
            {topic.correctAnswers}/{topic.totalQuestions} correct
          </span>
        </div>
      </div>
      <div className="flex space-x-2 ml-4">
        <Button
          onClick={() => handlePractice(topic.topic, subject)}
          variant="outline"
          size="sm"
          className="text-xs px-2 py-1 h-8"
        >
          <Brain className="h-3 w-3 mr-1" />
          Practice
        </Button>
      </div>
    </div>
  );

  const renderSubjectSection = (topics: TopicPerformance[], subject: 'math' | 'english', title: string) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {topics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">You're doing great! No weak topics detected yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.length < 5 && (
            <p className="text-xs text-gray-500 mb-3">
              Only {topics.length} topics shown due to limited recent practice.
            </p>
          )}
          {topics.map(topic => renderTopicCard(topic, subject))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Top 5 Weakest Topics</h2>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {renderSubjectSection(mathTopics, 'math', '📊 Math Topics')}
          {renderSubjectSection(englishTopics, 'english', '📚 English Topics')}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeakestTopicsSection;
