import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface PracticeSectionCardProps {
  section: 'reading-writing' | 'math';
  onLaunch?: () => void;
}

const PracticeSectionCard: React.FC<PracticeSectionCardProps> = ({ 
  section, 
  onLaunch 
}) => {
  const { user } = useAuth();
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
          .select('subject, is_correct')
          .eq('user_id', user.id);

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

  const accuracy = useMemo(() => {
    if (!attempts.length) return 0;
    
    // Filter attempts for the section
    const sectionAttempts = attempts.filter(attempt => {
      const subject = (attempt.subject || '').toLowerCase();
      if (section === 'reading-writing') {
        return subject.includes('english') || subject.includes('reading') || subject.includes('writing');
      } else {
        return subject.includes('math');
      }
    });

    if (sectionAttempts.length === 0) return 0;
    
    const correct = sectionAttempts.filter(a => a.is_correct).length;
    return Math.round((correct / sectionAttempts.length) * 100);
  }, [attempts, section]);

  const sectionTitle = section === 'reading-writing' 
    ? 'Reading and Writing' 
    : 'Math';
  
  const sectionDescription = section === 'reading-writing'
    ? 'Practice the section with AI-powered support.'
    : 'Practice the section with AI-powered support.';

  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch();
    } else {
      // Default behavior: navigate to quiz with section filter
      localStorage.setItem('selectedQuizTopic', JSON.stringify({
        subject: section === 'reading-writing' ? 'english' : 'math',
        topic: '',
        questionCount: 20,
        aiPractice: true
      }));
      window.location.href = '/quiz';
    }
  };

  return (
    <div className="w-full">
      <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 w-full">
        <div className="flex items-stretch">
          {/* Left: Purple strip with book icon */}
          <div className="bg-purple-100 flex items-center justify-center px-6 py-6 flex-shrink-0">
            <BookOpen className="h-8 w-8 text-blue-900" />
          </div>

          {/* Middle: Title and description */}
          <div className="flex-1 bg-white px-6 py-6 flex flex-col justify-center">
            <h3 className="text-base font-semibold text-blue-900 mb-1">
              {sectionTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {sectionDescription}
            </p>
          </div>

          {/* Right: Accuracy badge and Launch button */}
          <div className="bg-white px-6 py-6 flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Accuracy</span>
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
                {loading ? '...' : `${accuracy}%`}
              </div>
            </div>
            <Button
              onClick={handleLaunch}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Launch AI Practice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSectionCard;

