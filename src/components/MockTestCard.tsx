import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Calculator, FileText, HelpCircle, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface MockTestCardProps {
  testType: 'reading-writing' | 'math' | 'full' | 'targeted';
  onLaunch?: () => void;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ 
  testType, 
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
          .select('subject, is_correct, skill')
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

  const getTestInfo = () => {
    switch (testType) {
      case 'reading-writing':
        return {
          icon: BookOpen,
          iconBg: 'bg-purple-100',
          title: 'Reading & Writing',
          description: 'Comprehensive reading and writing practice',
          accuracy: calculateAccuracy('reading-writing')
        };
      case 'math':
        return {
          icon: Calculator,
          iconBg: 'bg-blue-100',
          title: 'Math-Focused',
          description: 'Extended math practice with additional problem sets',
          accuracy: calculateAccuracy('math')
        };
      case 'full':
        return {
          icon: FileText,
          iconBg: 'bg-green-100',
          title: 'Mock Test',
          description: 'Complete SAT practice test with adaptive modules',
          accuracy: calculateAccuracy('all')
        };
      case 'targeted':
        return {
          icon: Target,
          iconBg: 'bg-orange-100',
          title: 'Targeted Mock Test',
          description: 'Focused practice on your weak areas',
          accuracy: null
        };
      default:
        return {
          icon: BookOpen,
          iconBg: 'bg-purple-100',
          title: 'Practice Test',
          description: '',
          accuracy: 0
        };
    }
  };

  const calculateAccuracy = (subject: string) => {
    if (!attempts.length) return 0;
    
    let sectionAttempts = attempts;
    if (subject === 'reading-writing') {
      sectionAttempts = attempts.filter(attempt => {
        const subj = (attempt.subject || '').toLowerCase();
        return subj.includes('english') || subj.includes('reading') || subj.includes('writing');
      });
    } else if (subject === 'math') {
      sectionAttempts = attempts.filter(attempt => {
        const subj = (attempt.subject || '').toLowerCase();
        return subj.includes('math');
      });
    }

    if (sectionAttempts.length === 0) return 0;
    
    const correct = sectionAttempts.filter(a => a.is_correct).length;
    return Math.round((correct / sectionAttempts.length) * 100);
  };

  const testInfo = getTestInfo();
  const Icon = testInfo.icon;

  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch();
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 w-full hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Left: Colored icon section */}
        <div className={`${testInfo.iconBg} flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 flex-shrink-0`}>
          <Icon className="h-8 w-8 text-blue-900" />
        </div>

        {/* Middle: Title and description */}
        <div className="flex-1 bg-white px-4 py-4 sm:px-6 sm:py-6 flex flex-col justify-center min-w-0">
          <h3 className="text-base font-semibold text-blue-900 mb-1 truncate">
            {testInfo.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {testInfo.description}
          </p>
        </div>

        {/* Right: Accuracy badge and Launch button */}
        <div className="bg-white px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between gap-3 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200">
          {testInfo.accuracy !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Accuracy</span>
              <HelpCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="px-2 py-1 sm:px-3 sm:py-1 bg-red-50 text-red-600 rounded-full text-xs sm:text-sm font-medium border border-red-100 whitespace-nowrap">
                {loading ? '...' : `${testInfo.accuracy}%`}
              </div>
            </div>
          )}
          <Button
            onClick={handleLaunch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm whitespace-nowrap text-sm"
          >
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Launch</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockTestCard;

