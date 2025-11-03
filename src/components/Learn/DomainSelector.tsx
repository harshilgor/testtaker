import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { RealTimePerformanceService } from '@/services/realTimePerformanceService';
import { Check } from 'lucide-react';

interface DomainSelectorProps {
  selectedDomain: string | null;
  onDomainSelect: (domain: string | null) => void;
  targetWeaknessDomains?: Set<string>;
  onTargetWeaknessDomainToggle?: (domain: string) => void;
  showCheckboxes?: boolean;
}

const DomainSelector: React.FC<DomainSelectorProps> = ({ 
  selectedDomain, 
  onDomainSelect,
  targetWeaknessDomains = new Set(),
  onTargetWeaknessDomainToggle,
  showCheckboxes = false
}) => {
  const { questionAttempts, isInitialized } = useData();

  // Calculate domain performance statistics
  const domainStats = useMemo(() => {
    if (!isInitialized || !questionAttempts.length) {
      return {
        readingWriting: [],
        math: []
      };
    }

    // Calculate Reading & Writing domain stats
    const readingWritingDomains = [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ];

    const readingWritingStats = readingWritingDomains.map(domain => {
      const domainAttempts = questionAttempts.filter(attempt => {
        const mappedDomain = RealTimePerformanceService.mapTopicToDomain(attempt.topic);
        // Check if subject is reading/writing (could be 'english', 'reading-writing', 'reading and writing', etc.)
        const subjectLower = attempt.subject?.toLowerCase() || '';
        const isReadingWriting = subjectLower.includes('reading') || subjectLower.includes('writing') || subjectLower.includes('english');
        return mappedDomain === domain && isReadingWriting && !subjectLower.includes('math');
      });

      const totalQuestions = domainAttempts.length;
      const wrongQuestions = domainAttempts.filter(a => !a.is_correct).length;
      
      // Get difficulty breakdown
      const easy = domainAttempts.filter(a => a.difficulty === 'Easy').length;
      const medium = domainAttempts.filter(a => a.difficulty === 'Medium').length;
      const hard = domainAttempts.filter(a => a.difficulty === 'Hard').length;

      const easyWrong = domainAttempts.filter(a => a.difficulty === 'Easy' && !a.is_correct).length;
      const mediumWrong = domainAttempts.filter(a => a.difficulty === 'Medium' && !a.is_correct).length;
      const hardWrong = domainAttempts.filter(a => a.difficulty === 'Hard' && !a.is_correct).length;

      return {
        domain,
        totalQuestions,
        wrongQuestions,
        easy,
        medium,
        hard,
        easyWrong,
        mediumWrong,
        hardWrong
      };
    });

    // Calculate Math domain stats
    const mathDomains = [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis'
    ];

    const mathStats = mathDomains.map(domain => {
      const domainAttempts = questionAttempts.filter(attempt => {
        const mappedDomain = RealTimePerformanceService.mapTopicToMathDomain(attempt.topic);
        // Check if subject is math
        const subjectLower = attempt.subject?.toLowerCase() || '';
        const isMath = subjectLower.includes('math');
        return mappedDomain === domain && isMath;
      });

      const totalQuestions = domainAttempts.length;
      const wrongQuestions = domainAttempts.filter(a => !a.is_correct).length;
      
      // Get difficulty breakdown
      const easy = domainAttempts.filter(a => a.difficulty === 'Easy').length;
      const medium = domainAttempts.filter(a => a.difficulty === 'Medium').length;
      const hard = domainAttempts.filter(a => a.difficulty === 'Hard').length;

      const easyWrong = domainAttempts.filter(a => a.difficulty === 'Easy' && !a.is_correct).length;
      const mediumWrong = domainAttempts.filter(a => a.difficulty === 'Medium' && !a.is_correct).length;
      const hardWrong = domainAttempts.filter(a => a.difficulty === 'Hard' && !a.is_correct).length;

      return {
        domain,
        totalQuestions,
        wrongQuestions,
        easy,
        medium,
        hard,
        easyWrong,
        mediumWrong,
        hardWrong
      };
    });

    return {
      readingWriting: readingWritingStats,
      math: mathStats
    };
  }, [questionAttempts, isInitialized]);

  const getDomainColor = (domain: string, isReadingWriting: boolean) => {
    if (isReadingWriting) {
      const colors: Record<string, string> = {
        'Information and Ideas': 'border-blue-300 hover:border-blue-400',
        'Craft and Structure': 'border-purple-300 hover:border-purple-400',
        'Expression of Ideas': 'border-green-300 hover:border-green-400',
        'Standard English Conventions': 'border-orange-300 hover:border-orange-400'
      };
      return colors[domain] || 'border-gray-200 hover:border-gray-300';
    } else {
      const colors: Record<string, string> = {
        'Algebra': 'border-emerald-300 hover:border-emerald-400',
        'Advanced Math': 'border-indigo-300 hover:border-indigo-400',
        'Problem-Solving and Data Analysis': 'border-rose-300 hover:border-rose-400'
      };
      return colors[domain] || 'border-gray-200 hover:border-gray-300';
    }
  };

  const getSelectedColor = (domain: string, isReadingWriting: boolean) => {
    if (isReadingWriting) {
      const colors: Record<string, string> = {
        'Information and Ideas': 'border-blue-600 bg-blue-100 shadow-md ring-2 ring-blue-200',
        'Craft and Structure': 'border-purple-600 bg-purple-100 shadow-md ring-2 ring-purple-200',
        'Expression of Ideas': 'border-green-600 bg-green-100 shadow-md ring-2 ring-green-200',
        'Standard English Conventions': 'border-orange-600 bg-orange-100 shadow-md ring-2 ring-orange-200'
      };
      return colors[domain] || 'border-gray-600 bg-gray-100 shadow-md ring-2 ring-gray-200';
    } else {
      const colors: Record<string, string> = {
        'Algebra': 'border-emerald-600 bg-emerald-100 shadow-md ring-2 ring-emerald-200',
        'Advanced Math': 'border-indigo-600 bg-indigo-100 shadow-md ring-2 ring-indigo-200',
        'Problem-Solving and Data Analysis': 'border-rose-600 bg-rose-100 shadow-md ring-2 ring-rose-200'
      };
      return colors[domain] || 'border-gray-600 bg-gray-100 shadow-md ring-2 ring-gray-200';
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Reading and Writing Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Reading & Writing
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {domainStats.readingWriting.map((stat) => (
            <div key={`rw-${stat.domain}`} className="relative">
              <button
                onClick={() => onDomainSelect(selectedDomain === stat.domain ? null : stat.domain)}
                className={`w-full text-left p-3 rounded-2xl transition-all ${
                  selectedDomain === stat.domain
                    ? `${getSelectedColor(stat.domain, true)} border-2`
                    : `${getDomainColor(stat.domain, true)} bg-white border`
                } text-gray-900`}
              >
                <div className="font-semibold text-sm mb-1">{stat.domain}</div>
              <div className="text-xs text-gray-600">
                {stat.totalQuestions > 0 ? (
                  <>
                    <span className="font-medium">{stat.totalQuestions} solved</span>
                    {stat.wrongQuestions > 0 && (
                      <>
                        {' • '}
                        <span className="text-red-600 font-medium">{stat.wrongQuestions} mistakes</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-red-600 font-medium">{stat.wrongQuestions} mistakes</span>
                )}
              </div>
            </button>
            {/* Target Weakness checkbox */}
            {showCheckboxes && onTargetWeaknessDomainToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTargetWeaknessDomainToggle(stat.domain);
                }}
                className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  targetWeaknessDomains.has(stat.domain)
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-white border-gray-300 hover:border-orange-400'
                }`}
              >
                {targetWeaknessDomains.has(stat.domain) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* Math Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Math
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {domainStats.math.map((stat) => (
            <div key={`math-${stat.domain}`} className="relative">
              <button
                onClick={() => onDomainSelect(selectedDomain === stat.domain ? null : stat.domain)}
                className={`w-full text-left p-3 rounded-2xl transition-all ${
                  selectedDomain === stat.domain
                    ? `${getSelectedColor(stat.domain, false)} border-2`
                    : `${getDomainColor(stat.domain, false)} bg-white border`
                } text-gray-900`}
              >
                <div className="font-semibold text-sm mb-1">{stat.domain}</div>
              <div className="text-xs text-gray-600">
                {stat.totalQuestions > 0 ? (
                  <>
                    <span className="font-medium">{stat.totalQuestions} solved</span>
                    {stat.wrongQuestions > 0 && (
                      <>
                        {' • '}
                        <span className="text-red-600 font-medium">{stat.wrongQuestions} mistakes</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-red-600 font-medium">{stat.wrongQuestions} mistakes</span>
                )}
              </div>
            </button>
            {/* Target Weakness checkbox */}
            {showCheckboxes && onTargetWeaknessDomainToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTargetWeaknessDomainToggle(stat.domain);
                }}
                className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  targetWeaknessDomains.has(stat.domain)
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-white border-gray-300 hover:border-orange-400'
                }`}
              >
                {targetWeaknessDomains.has(stat.domain) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* Clear Selection Button */}
      {selectedDomain && (
        <div className="flex justify-center">
          <button
            onClick={() => onDomainSelect(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Show All Recent Mistakes
          </button>
        </div>
      )}
    </div>
  );
};

export default DomainSelector;
