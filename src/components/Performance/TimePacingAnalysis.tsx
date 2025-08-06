import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/utils/timeUtils';

interface TimePacingAnalysisProps {
  userName: string;
  mockTestResults: any[];
}

const TimePacingAnalysis: React.FC<TimePacingAnalysisProps> = ({ userName, mockTestResults }) => {
  // Calculate average time per question for Math and Reading & Writing sections
  const calculateSectionPacing = () => {
    if (mockTestResults.length === 0) {
      return {
        math: { avgTime: 85, target: 85, status: 'On Pace' },
        readingWriting: { avgTime: 65, target: 75, status: 'Too Fast' }
      };
    }

    // Get the most recent mock test result for calculations
    const recentTest = mockTestResults[0];
    const detailedResults = recentTest?.detailed_results || {};
    
    // Calculate math section pacing (assuming 44 questions, target ~1m 25s per question)
    const mathTimeSpent = detailedResults.mathTimeSpent || 3740; // Default to ~85s per question for 44 questions
    const mathQuestions = detailedResults.mathQuestions || 44;
    const mathAvgTime = Math.round(mathTimeSpent / mathQuestions);
    const mathTarget = 85; // 1m 25s target
    
    // Calculate reading & writing section pacing (assuming 66 questions, target ~1m 15s per question)
    const rwTimeSpent = detailedResults.rwTimeSpent || 4290; // Default to ~65s per question for 66 questions
    const rwQuestions = detailedResults.rwQuestions || 66;
    const rwAvgTime = Math.round(rwTimeSpent / rwQuestions);
    const rwTarget = 75; // 1m 15s target
    
    const getMathStatus = () => {
      const diff = mathAvgTime - mathTarget;
      if (Math.abs(diff) <= 5) return 'On Pace';
      return diff > 0 ? 'Too Slow' : 'Too Fast';
    };
    
    const getRWStatus = () => {
      const diff = rwAvgTime - rwTarget;
      if (Math.abs(diff) <= 5) return 'On Pace';
      return diff > 0 ? 'Too Slow' : 'Too Fast';
    };

    return {
      math: { 
        avgTime: mathAvgTime, 
        target: mathTarget, 
        status: getMathStatus() 
      },
      readingWriting: { 
        avgTime: rwAvgTime, 
        target: rwTarget, 
        status: getRWStatus() 
      }
    };
  };

  const pacingData = calculateSectionPacing();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Pace': return 'bg-green-100 text-green-800';
      case 'Too Fast': return 'bg-yellow-100 text-yellow-800';
      case 'Too Slow': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          Your Time & Pacing Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section-by-Section Pacing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Math Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900">Math</h4>
                <Badge className={getStatusColor(pacingData.math.status)}>
                  {pacingData.math.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(pacingData.math.avgTime)} 
                  <span className="text-sm font-normal text-gray-500 ml-1">avg. per question</span>
                </div>
                <div className="text-sm text-gray-500">
                  Target: ~{formatTime(pacingData.math.target)} per question
                </div>
              </div>
            </div>

            {/* Reading & Writing Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900">Reading & Writing</h4>
                <Badge className={getStatusColor(pacingData.readingWriting.status)}>
                  {pacingData.readingWriting.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(pacingData.readingWriting.avgTime)}
                  <span className="text-sm font-normal text-gray-500 ml-1">avg. per question</span>
                </div>
                <div className="text-sm text-gray-500">
                  Target: ~{formatTime(pacingData.readingWriting.target)} per question
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimePacingAnalysis;