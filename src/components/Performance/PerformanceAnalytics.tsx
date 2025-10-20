import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Calculator, BookOpen, BarChart3, Target, ArrowUpRight } from 'lucide-react';

interface PerformanceAnalyticsProps {
  subject: 'all' | 'math' | 'reading_writing';
}

interface DifficultyData {
  difficulty: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface DomainData {
  domain: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface SubdomainData {
  subdomain: string;
  correct: number;
  total: number;
  accuracy: number;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ subject }) => {
  const { questionAttempts } = useData();
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Get color based on accuracy percentage
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-500';
    if (accuracy >= 80) return 'bg-green-400';
    if (accuracy >= 70) return 'bg-yellow-300';
    if (accuracy >= 60) return 'bg-yellow-400';
    return 'bg-pink-300';
  };

  const getTextColor = (accuracy: number) => {
    if (accuracy >= 60) return 'text-gray-900';
    return 'text-red-600';
  };

  // Process data based on selected subject
  const analyticsData = useMemo(() => {
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      return {
        difficultyData: [],
        domainData: [],
        subdomainData: [],
        overallAccuracy: 0,
        totalQuestions: 0
      };
    }

    // Filter attempts by selected subject
    const filteredAttempts = questionAttempts.filter(attempt => {
      if (subject === 'all') return true;
      
      const testField = attempt.test || attempt.assessment || '';
      if (subject === 'math') {
        return testField.toLowerCase().includes('math');
      } else if (subject === 'reading_writing') {
        return testField.toLowerCase().includes('reading') || testField.toLowerCase().includes('writing');
      }
      return true;
    });

    if (filteredAttempts.length === 0) {
      return {
        difficultyData: [],
        domainData: [],
        subdomainData: [],
        overallAccuracy: 0,
        totalQuestions: 0
      };
    }

    // Calculate overall accuracy
    const correctAnswers = filteredAttempts.filter(attempt => attempt.is_correct).length;
    const overallAccuracy = (correctAnswers / filteredAttempts.length) * 100;

    // Group by difficulty
    const difficultyStats = filteredAttempts.reduce((acc, attempt) => {
      const difficulty = attempt.difficulty || 'Unknown';
      if (!acc[difficulty]) {
        acc[difficulty] = { correct: 0, total: 0 };
      }
      acc[difficulty].total++;
      if (attempt.is_correct) acc[difficulty].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const difficultyData: DifficultyData[] = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      correct: stats.correct,
      total: stats.total,
      accuracy: (stats.correct / stats.total) * 100
    }));

    // Group by domain
    const domainStats = filteredAttempts.reduce((acc, attempt) => {
      const domain = attempt.domain || 'Unknown';
      if (!acc[domain]) {
        acc[domain] = { correct: 0, total: 0 };
      }
      acc[domain].total++;
      if (attempt.is_correct) acc[domain].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const domainData: DomainData[] = Object.entries(domainStats).map(([domain, stats]) => ({
      domain,
      correct: stats.correct,
      total: stats.total,
      accuracy: (stats.correct / stats.total) * 100
    }));

    // Group by subdomain (skill) within selected domain
    let subdomainData: SubdomainData[] = [];
    if (selectedDomain) {
      const subdomainStats = filteredAttempts
        .filter(attempt => attempt.domain === selectedDomain)
        .reduce((acc, attempt) => {
          const skill = attempt.skill || attempt.topic || 'Unknown';
          if (!acc[skill]) {
            acc[skill] = { correct: 0, total: 0 };
          }
          acc[skill].total++;
          if (attempt.is_correct) acc[skill].correct++;
          return acc;
        }, {} as Record<string, { correct: number; total: number }>);

      subdomainData = Object.entries(subdomainStats).map(([skill, stats]) => ({
        subdomain: skill,
        correct: stats.correct,
        total: stats.total,
        accuracy: (stats.correct / stats.total) * 100
      }));
    }

    return {
      difficultyData,
      domainData,
      subdomainData,
      overallAccuracy,
      totalQuestions: filteredAttempts.length
    };
  }, [questionAttempts, subject, selectedDomain]);

  const getSubjectTitle = () => {
    switch (subject) {
      case 'math':
        return 'Math';
      case 'reading_writing':
        return 'Reading and Writing';
      default:
        return 'Overall';
    }
  };

  const getSubjectIcon = () => {
    switch (subject) {
      case 'math':
        return Calculator;
      case 'reading_writing':
        return BookOpen;
      default:
        return BarChart3;
    }
  };

  const SubjectIcon = getSubjectIcon();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Difficulty Breakdown */}
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SubjectIcon className="h-5 w-5 text-blue-600" />
            {getSubjectTitle()} Difficulty
          </CardTitle>
          
          {/* Color Legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-pink-300 rounded"></div>
              <span>0%-59%</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>60%-69%</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-yellow-300 rounded"></div>
              <span>70%-79%</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>80%-89%</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>90%-100%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {analyticsData.difficultyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No difficulty data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Accuracy */}
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold ${getTextColor(analyticsData.overallAccuracy)}`}>
                  {analyticsData.overallAccuracy.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">
                  {analyticsData.totalQuestions} questions attempted
                </div>
              </div>
              
              {/* Difficulty Bars */}
              {analyticsData.difficultyData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.difficulty}</span>
                    <span className="text-sm text-gray-600">
                      {item.correct} Correct • {item.total} Total
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getAccuracyColor(item.accuracy)}`}
                      style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getTextColor(item.accuracy)}`}>
                      {item.accuracy.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Performance */}
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {getSubjectTitle()} Domains
          </CardTitle>
          
          {/* Overall Accuracy */}
          <div className="mt-3">
            <div className={`text-lg font-semibold ${getTextColor(analyticsData.overallAccuracy)}`}>
              Your {getSubjectTitle()} Accuracy Overall: {analyticsData.overallAccuracy.toFixed(0)}%
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {analyticsData.domainData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No domain data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.domainData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.domain}</span>
                    <span className={`text-sm font-medium ${getTextColor(item.accuracy)}`}>
                      {item.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getAccuracyColor(item.accuracy)}`}
                      style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subdomains */}
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Subdomains
          </CardTitle>
          
          {/* Domain Selector */}
          <div className="mt-3">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Domain: Select..." />
              </SelectTrigger>
              <SelectContent>
                {analyticsData.domainData.map((domain, index) => (
                  <SelectItem key={index} value={domain.domain}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {!selectedDomain ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click a domain on the left</p>
                  <p className="text-xs text-gray-400">to expand data into its subdomains</p>
                </div>
              </div>
            </div>
          ) : analyticsData.subdomainData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No subdomain data available for {selectedDomain}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.subdomainData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.subdomain}</span>
                    <span className={`text-sm font-medium ${getTextColor(item.accuracy)}`}>
                      {item.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getAccuracyColor(item.accuracy)}`}
                      style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
