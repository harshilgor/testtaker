// Reusable UI components for common patterns
// This file contains shared components to reduce duplication

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Clock, 
  Award, 
  Activity,
  LucideIcon 
} from 'lucide-react';
import { 
  getAccuracyColor, 
  getAccuracyTextColor, 
  ACCURACY_RANGES,
  calculateAccuracy,
  formatDuration,
  formatNumber
} from '@/utils/shared';
import { DifficultyData, DomainData, SubdomainData, ViewMode } from '@/types';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  trendValue
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className={`h-4 w-4 md:h-5 md:w-5 ${iconColor}`} />
      </div>
      <p className="text-lg md:text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      <p className="text-xs md:text-sm text-gray-600">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
      {trend && trendValue && (
        <div className="flex items-center justify-center mt-1 space-x-1">
          {getTrendIcon()}
          <span className="text-xs text-gray-500">{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACCURACY LEGEND COMPONENT
// ============================================================================

interface AccuracyLegendProps {
  className?: string;
}

export const AccuracyLegend: React.FC<AccuracyLegendProps> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-2 gap-2 text-xs mb-6 ${className}`}>
      {ACCURACY_RANGES.map(({ range, color }) => (
        <div key={range} className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${color} rounded`}></div>
          <span className="text-gray-600">{range}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// VERTICAL BAR CHART COMPONENT
// ============================================================================

interface VerticalBarChartProps {
  data: DifficultyData[];
  viewMode: ViewMode;
  className?: string;
  maxHeight?: number;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  viewMode,
  className = '',
  maxHeight = 120
}) => {
  const [hoveredBar, setHoveredBar] = React.useState<string | null>(null);

  // Ensure we always have all difficulty levels
  const allDifficulties = ['Easy', 'Medium', 'Hard'];
  const completeData = allDifficulties.map(difficulty => {
    const existingData = data.find(d => d.difficulty === difficulty);
    return existingData || {
      difficulty,
      correct: 0,
      total: 0,
      accuracy: 0
    };
  });

  const maxValue = viewMode === 'accuracy' 
    ? Math.max(...completeData.map(d => d.accuracy), 0)
    : Math.max(...completeData.map(d => d.total), 0);

  return (
    <div className={`h-56 flex items-end justify-center space-x-6 ${className}`}>
      {completeData.map((item) => {
        const barHeight = maxValue > 0 
          ? Math.max(((viewMode === 'accuracy' ? item.accuracy : item.total) / maxValue) * maxHeight, 15)
          : 15;
        const isHovered = hoveredBar === item.difficulty;

        return (
          <div key={item.difficulty} className="flex flex-col items-center space-y-3">
            <div className="relative flex flex-col items-center">
              {viewMode === 'count' ? (
                // Questions mode: nested bars
                <div 
                  className="relative cursor-pointer group"
                  onMouseEnter={() => setHoveredBar(item.difficulty)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Outer bar (total questions) */}
                  <div 
                    className="w-12 rounded-t bg-gray-200 transition-all duration-500"
                    style={{ height: `${barHeight}px` }}
                  />
                  {/* Inner bar (correct questions) - changed from green to baby blue */}
                  {item.total > 0 && (
                    <div 
                      className="absolute bottom-0 w-12 rounded-t bg-sky-300 transition-all duration-500"
                      style={{ 
                        height: `${Math.max((item.correct / item.total) * barHeight, 2)}px` 
                      }}
                    />
                  )}
                  {/* Tooltip */}
                  {isHovered && item.total > 0 && (
                    <div 
                      className="absolute z-50 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                      style={{
                        bottom: `${barHeight + 10}px`,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {item.correct} correct out of {item.total}
                    </div>
                  )}
                </div>
              ) : (
                // Accuracy mode: single colored bar
                <div 
                  className={`w-12 rounded-t transition-all duration-500 ${getAccuracyColor(item.accuracy)}`}
                  style={{ height: `${barHeight}px` }}
                />
              )}
              
              <div className="absolute -top-10 text-center">
                {viewMode === 'accuracy' ? (
                  <div className="text-sm font-bold text-gray-900">
                    {item.accuracy}%
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {item.total}
                    </div>
                    {item.correct > 0 && (
                      <div className="text-xs text-gray-500">
                        {item.correct} Correct
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm font-medium text-gray-700">
              {item.difficulty}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// VERTICAL DOMAIN/SUBDOMAIN BAR CHART COMPONENT
// ============================================================================

interface VerticalDomainBarChartProps {
  data: DomainData[] | SubdomainData[];
  viewMode?: ViewMode;
  className?: string;
  maxHeight?: number;
}

export const VerticalDomainBarChart: React.FC<VerticalDomainBarChartProps> = ({
  data,
  viewMode = 'accuracy',
  className = '',
  maxHeight = 150
}) => {
  const maxValue = viewMode === 'accuracy' 
    ? Math.max(...data.map(d => d.accuracy), 100)
    : Math.max(...data.map(d => d.total), 1);

  return (
    <div className={`h-56 flex items-end justify-center space-x-6 ${className}`}>
      {data.map((item) => {
        const displayValue = viewMode === 'accuracy' ? item.accuracy : item.total;
        const barHeight = maxValue > 0 
          ? Math.max((displayValue / maxValue) * maxHeight, 10)
          : 10;
        
        const displayColor = viewMode === 'accuracy' 
          ? getAccuracyColor(item.accuracy)
          : 'bg-sky-300';

        return (
          <div key={item.domain || item.subdomain} className="flex flex-col items-center space-y-3">
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-12 rounded-t transition-all duration-500 ${displayColor}`}
                style={{ height: `${barHeight}px` }}
              />
              
              {/* Value label above bar */}
              <div className="absolute -top-8 text-center">
                <div className={`text-xs font-semibold ${viewMode === 'accuracy' ? getAccuracyTextColor(item.accuracy) : 'text-gray-900'}`}>
                  {displayValue}{viewMode === 'accuracy' ? '%' : ''}
                </div>
              </div>
            </div>
            
            {/* Domain/Subdomain label - positioned at bottom like difficulty labels */}
            <div className="text-[9px] font-medium text-gray-700 text-center max-w-[90px] leading-tight">
              {item.domain || item.subdomain}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Math-specific vertical chart with pastel purple
interface VerticalMathBarChartProps {
  data: DifficultyData[];
  viewMode: ViewMode;
  className?: string;
  maxHeight?: number;
}

export const VerticalMathBarChart: React.FC<VerticalMathBarChartProps> = ({
  data,
  viewMode,
  className = '',
  maxHeight = 120
}) => {
  const [hoveredBar, setHoveredBar] = React.useState<string | null>(null);

  // Ensure we always have all difficulty levels
  const allDifficulties = ['Easy', 'Medium', 'Hard'];
  const completeData = allDifficulties.map(difficulty => {
    const existingData = data.find(d => d.difficulty === difficulty);
    return existingData || {
      difficulty,
      correct: 0,
      total: 0,
      accuracy: 0
    };
  });

  const maxValue = viewMode === 'accuracy' 
    ? Math.max(...completeData.map(d => d.accuracy), 0)
    : Math.max(...completeData.map(d => d.total), 0);

  return (
    <div className={`h-56 flex items-end justify-center space-x-6 ${className}`}>
      {completeData.map((item) => {
        const barHeight = maxValue > 0 
          ? Math.max(((viewMode === 'accuracy' ? item.accuracy : item.total) / maxValue) * maxHeight, 15)
          : 15;
        const isHovered = hoveredBar === item.difficulty;

        return (
          <div key={item.difficulty} className="flex flex-col items-center space-y-3">
            <div className="relative flex flex-col items-center">
              {viewMode === 'count' ? (
                // Questions mode: nested bars
                <div 
                  className="relative cursor-pointer group"
                  onMouseEnter={() => setHoveredBar(item.difficulty)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Outer bar (total questions) */}
                  <div 
                    className="w-12 rounded-t bg-gray-200 transition-all duration-500"
                    style={{ height: `${barHeight}px` }}
                  />
                  {/* Inner bar (correct questions) - pastel purple */}
                  {item.total > 0 && (
                    <div 
                      className="absolute bottom-0 w-12 rounded-t bg-purple-300 transition-all duration-500"
                      style={{ 
                        height: `${Math.max((item.correct / item.total) * barHeight, 2)}px` 
                      }}
                    />
                  )}
                  {/* Tooltip */}
                  {isHovered && item.total > 0 && (
                    <div 
                      className="absolute z-50 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                      style={{
                        bottom: `${barHeight + 10}px`,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {item.correct} correct out of {item.total}
                    </div>
                  )}
                </div>
              ) : (
                // Accuracy mode: single colored bar
                <div 
                  className={`w-12 rounded-t transition-all duration-500 ${getAccuracyColor(item.accuracy)}`}
                  style={{ height: `${barHeight}px` }}
                />
              )}
              
              <div className="absolute -top-10 text-center">
                {viewMode === 'accuracy' ? (
                  <div className="text-sm font-bold text-gray-900">
                    {item.accuracy}%
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {item.total}
                    </div>
                    {item.correct > 0 && (
                      <div className="text-xs text-gray-500">
                        {item.correct} Correct
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm font-medium text-gray-700">
              {item.difficulty}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Math-specific domain chart with pastel purple
interface VerticalMathDomainBarChartProps {
  data: DomainData[] | SubdomainData[];
  viewMode?: ViewMode;
  className?: string;
  maxHeight?: number;
}

export const VerticalMathDomainBarChart: React.FC<VerticalMathDomainBarChartProps> = ({
  data,
  viewMode = 'accuracy',
  className = '',
  maxHeight = 150
}) => {
  const maxValue = viewMode === 'accuracy' 
    ? Math.max(...data.map(d => d.accuracy), 100)
    : Math.max(...data.map(d => d.total), 1);

  return (
    <div className={`h-56 flex items-end justify-center space-x-6 ${className}`}>
      {data.map((item) => {
        const displayValue = viewMode === 'accuracy' ? item.accuracy : item.total;
        const barHeight = maxValue > 0 
          ? Math.max((displayValue / maxValue) * maxHeight, 10)
          : 10;
        
        const displayColor = viewMode === 'accuracy' 
          ? getAccuracyColor(item.accuracy)
          : 'bg-purple-300';

        return (
          <div key={item.domain || item.subdomain} className="flex flex-col items-center space-y-3">
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-12 rounded-t transition-all duration-500 ${displayColor}`}
                style={{ height: `${barHeight}px` }}
              />
              
              {/* Value label above bar */}
              <div className="absolute -top-8 text-center">
                <div className={`text-xs font-semibold ${viewMode === 'accuracy' ? getAccuracyTextColor(item.accuracy) : 'text-gray-900'}`}>
                  {displayValue}{viewMode === 'accuracy' ? '%' : ''}
                </div>
              </div>
            </div>
            
            {/* Domain/Subdomain label - positioned at bottom like difficulty labels */}
            <div className="text-[9px] font-medium text-gray-700 text-center max-w-[90px] leading-tight">
              {item.domain || item.subdomain}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// HORIZONTAL PROGRESS BARS COMPONENT
// ============================================================================

interface HorizontalProgressBarsProps {
  data: DomainData[] | SubdomainData[];
  className?: string;
  showGridLines?: boolean;
  viewMode?: ViewMode;
}

export const HorizontalProgressBars: React.FC<HorizontalProgressBarsProps> = ({
  data,
  className = '',
  showGridLines = true,
  viewMode = 'accuracy'
}) => {
  const maxValue = viewMode === 'accuracy' 
    ? Math.max(...data.map(d => d.accuracy), 0)
    : Math.max(...data.map(d => d.total), 0);

  return (
    <div className={`space-y-4 relative ${className}`}>
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-full border-t border-gray-100"
              style={{ top: `${20 + i * 20}%` }}
            />
          ))}
        </div>
      )}
      
      {data.map((item) => {
        const barWidth = maxValue > 0 
          ? viewMode === 'accuracy'
            ? (item.accuracy / maxValue) * 100
            : (item.total / maxValue) * 100
          : 0;
        
        const displayValue = viewMode === 'accuracy' ? item.accuracy : item.total;
        const displayLabel = viewMode === 'accuracy' ? '%' : '';
        const displayColor = viewMode === 'accuracy' 
          ? getAccuracyColor(item.accuracy)
          : 'bg-green-500';

        return (
          <div key={item.domain || item.subdomain} className="space-y-2 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {item.domain || item.subdomain}
              </span>
              <div className="flex items-center gap-2">
                {viewMode === 'count' && (
                  <span className="text-xs text-gray-500">
                    {item.correct} Correct
                  </span>
                )}
                <span className={`text-sm font-semibold ${viewMode === 'accuracy' ? getAccuracyTextColor(item.accuracy) : 'text-gray-900'}`}>
                  {displayValue}{displayLabel}
                </span>
              </div>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${displayColor}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// PERFORMANCE CARD COMPONENT
// ============================================================================

interface PerformanceCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  title,
  icon: Icon,
  children,
  className = ''
}) => {
  return (
    <Card className={`rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        {children}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// SUBJECT FILTER BUTTONS COMPONENT
// ============================================================================

interface SubjectFilterButtonsProps {
  selectedSubject: 'all' | 'math' | 'reading_and_writing';
  onSubjectChange: (subject: 'all' | 'math' | 'reading_and_writing') => void;
  className?: string;
}

export const SubjectFilterButtons: React.FC<SubjectFilterButtonsProps> = ({
  selectedSubject,
  onSubjectChange,
  className = ''
}) => {
  const subjects = [
    { key: 'all', label: 'All', icon: Activity },
    { key: 'math', label: 'Math', icon: Target },
    { key: 'reading_and_writing', label: 'Reading and Writing', icon: BookOpen }
  ] as const;

  return (
    <div className={`flex gap-2 ${className}`}>
      {subjects.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={selectedSubject === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSubjectChange(key)}
          className="flex items-center gap-2 text-xs"
        >
          <Icon className="h-3 w-3" />
          {label}
        </Button>
      ))}
    </div>
  );
};

// ============================================================================
// VIEW MODE TOGGLE COMPONENT
// ============================================================================

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant={viewMode === 'count' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('count')}
        className="text-xs"
      >
        # Questions
      </Button>
      <Button
        variant={viewMode === 'accuracy' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('accuracy')}
        className="text-xs"
      >
        % Accuracy
      </Button>
    </div>
  );
};

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  lines = 3
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded mb-2" />
      ))}
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
};
