import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, BookOpen, Info } from 'lucide-react';
import OverallDifficultyAnalytics from './OverallDifficultyAnalytics';
import OverallDomainsAnalytics from './OverallDomainsAnalytics';
import SubdomainsAnalytics from './SubdomainsAnalytics';

interface QuestionTopicsDifficultyAnalyticsProps {
  userName: string;
}

type SubjectType = 'all' | 'math' | 'reading_writing';
type ViewType = 'questions' | 'accuracy';

const QuestionTopicsDifficultyAnalytics: React.FC<QuestionTopicsDifficultyAnalyticsProps> = ({ userName }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');
  const [selectedView, setSelectedView] = useState<ViewType>('accuracy');

  const getSubjectTitle = () => {
    if (selectedSubject === 'math') return 'Math Difficulty';
    if (selectedSubject === 'reading_writing') return 'Reading and Writing Difficulty';
    return 'Question Topics & Difficulty';
  };

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {getSubjectTitle()}
            </CardTitle>
            
            {/* Toggle between # Questions and % Accuracy */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={selectedView === 'questions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('questions')}
                className="text-xs"
              >
                # Questions
              </Button>
              <Button
                variant={selectedView === 'accuracy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView('accuracy')}
                className="text-xs"
              >
                % Accuracy
              </Button>
            </div>
          </div>
          
          {/* Subject Selection */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedSubject === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject('all')}
              className="flex items-center gap-2 text-xs"
            >
              <Info className="h-3 w-3" />
              All Subjects
            </Button>
            <Button
              variant={selectedSubject === 'math' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject('math')}
              className="flex items-center gap-2 text-xs"
            >
              <Calculator className="h-3 w-3" />
              Math
            </Button>
            <Button
              variant={selectedSubject === 'reading_writing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject('reading_writing')}
              className="flex items-center gap-2 text-xs"
            >
              <BookOpen className="h-3 w-3" />
              Reading & Writing
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Three Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Difficulty */}
        <div className="lg:col-span-1">
          <OverallDifficultyAnalytics subject={selectedSubject} />
        </div>
        
        {/* Overall Domains */}
        <div className="lg:col-span-1">
          <OverallDomainsAnalytics subject={selectedSubject} />
        </div>
        
        {/* Subdomains */}
        <div className="lg:col-span-1">
          <SubdomainsAnalytics subject={selectedSubject} />
        </div>
      </div>
    </div>
  );
};

export default QuestionTopicsDifficultyAnalytics;
