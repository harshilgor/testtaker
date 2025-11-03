import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Target, BookOpen, Brain } from 'lucide-react';
import { 
  PerformanceCard, 
  AccuracyLegend, 
  VerticalMathBarChart, 
  VerticalMathDomainBarChart,
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
  const [viewMode, setViewMode] = useViewMode('mathTopicsViewMode', 'count'); // Default to 'count' mode
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
        // Map the subdomain (which is actually the topic/skill) to its domain
        const mappedDomain = RealTimePerformanceService.mapTopicToMathDomain(sub.subdomain);
        return mappedDomain === selectedDomain;
      })
    : [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel - Difficulty Chart - Smaller width */}
        <div className="lg:col-span-3">
          <PerformanceCard title="Difficulty" icon={TrendingUp}>
            <div className="flex flex-col h-full">
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Math Accuracy Overall:</span>
                  <span className="text-sm font-semibold text-gray-900">{overallAccuracy}%</span>
                </div>
              </div>

              <div className="mb-6 flex-shrink-0">
                {viewMode === 'accuracy' ? (
                  <AccuracyLegend />
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-300 rounded"></div>
                      <span className="text-gray-600">Correct</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <span className="text-gray-600">Total</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-end justify-center min-h-0">
                <VerticalMathBarChart data={difficultyData} viewMode={viewMode} />
              </div>
            </div>
          </PerformanceCard>
        </div>

        {/* Middle Panel - Domains - Bigger width */}
        <div className="lg:col-span-5">
          <PerformanceCard title="Domains" icon={BookOpen}>
            <div className="flex-1 flex items-end justify-center min-h-0">
              <VerticalMathDomainBarChart data={domainData} viewMode={viewMode} />
            </div>
          </PerformanceCard>
        </div>

        {/* Right Panel - Subdomains */}
        <div className="lg:col-span-4">
          <PerformanceCard title="Subdomains" icon={Target}>
            <div className="flex flex-col h-full">
              <div className="mb-4 flex-shrink-0">
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
                <div className="flex-1 flex items-end justify-center min-h-0">
                  <VerticalMathDomainBarChart data={subdomainsForSelectedDomain} viewMode={viewMode} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Domain</h3>
                    <p className="text-gray-500">Choose a domain from the dropdown to view its skills</p>
                  </div>
                </div>
              )}
            </div>
          </PerformanceCard>
        </div>
      </div>
    </div>
  );
};

export default MathTopicsDifficulty;