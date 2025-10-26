import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Target, BookOpen, Brain } from 'lucide-react';
import { 
  PerformanceCard, 
  AccuracyLegend, 
  VerticalBarChart, 
  HorizontalProgressBars, 
  ViewModeToggle 
} from '@/components/ui/shared';
import { 
  DifficultyData, 
  DomainData, 
  SubdomainData, 
  ViewMode 
} from '@/types';
import { useViewMode } from '@/hooks/shared';
import { useData } from '@/contexts/DataContext';
import { RealTimePerformanceService } from '@/services/realTimePerformanceService';

const MathTopicsDifficulty: React.FC = () => {
  const [viewMode, setViewMode] = useViewMode('mathTopicsViewMode');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { questionAttempts, loading } = useData();

  // Calculate real performance data from user attempts
  const performanceData = useMemo(() => {
    if (!questionAttempts || questionAttempts.length === 0) {
      return {
        difficultyData: RealTimePerformanceService.getDefaultDifficultyData(),
        domainData: RealTimePerformanceService.getDefaultMathDomains(),
        subdomainData: [],
        overallAccuracy: 0
      };
    }

    const difficultyData = RealTimePerformanceService.calculateDifficultyData(questionAttempts as any);
    const domainData = RealTimePerformanceService.calculateMathDomains(questionAttempts as any);
    const subdomainData = RealTimePerformanceService.calculateMathSubdomains(questionAttempts as any);
    const overallAccuracy = RealTimePerformanceService.calculateOverallAccuracy(questionAttempts as any);

    return {
      difficultyData,
      domainData,
      subdomainData,
      overallAccuracy
    };
  }, [questionAttempts]);

  const { difficultyData, domainData, subdomainData, overallAccuracy } = performanceData;

  const subdomainsForSelectedDomain = selectedDomain 
    ? subdomainData.filter(sub => {
        // Map domains to their skills
        if (selectedDomain === 'Algebra') {
          return ['Linear Equations', 'Systems of Equations', 'Quadratic Equations'].includes(sub.subdomain);
        } else if (selectedDomain === 'Advanced Math') {
          return ['Polynomials', 'Trigonometry', 'Complex Numbers'].includes(sub.subdomain);
        } else if (selectedDomain === 'Problem-Solving and Data Analysis') {
          return ['Statistics', 'Probability'].includes(sub.subdomain);
        }
        return false;
      })
    : [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maths
          </h1>
          <p className="text-gray-600">Track your performance across different math topics and difficulty levels</p>
        </div>
        
        {/* View Toggle */}
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Difficulty Chart */}
        <PerformanceCard title="Math Difficulty" icon={TrendingUp}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your Math Accuracy Overall:</span>
              <span className="text-sm font-semibold text-gray-900">{overallAccuracy}%</span>
            </div>
          </div>

          <AccuracyLegend />

          <VerticalBarChart data={difficultyData} viewMode={viewMode} />
        </PerformanceCard>

        {/* Middle Panel - Domains */}
        <PerformanceCard title="Math Domains" icon={BookOpen}>
          <HorizontalProgressBars data={domainData} />
        </PerformanceCard>

        {/* Right Panel - Subdomains */}
        <PerformanceCard title="Subdomains" icon={Target}>
          <div className="mb-4">
            <Select value={selectedDomain || ''} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a domain to view skills" />
              </SelectTrigger>
              <SelectContent>
                {domainData.map((domain) => (
                  <SelectItem key={domain.domain} value={domain.domain}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDomain && subdomainsForSelectedDomain.length > 0 ? (
            <HorizontalProgressBars data={subdomainsForSelectedDomain} />
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Domain</h3>
              <p className="text-gray-500">Choose a domain from the dropdown to view its skills</p>
            </div>
          )}
        </PerformanceCard>
      </div>
    </div>
  );
};

export default MathTopicsDifficulty;