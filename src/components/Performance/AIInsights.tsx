
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Lightbulb, Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIInsightsProps {
  userName: string;
  targetDate?: string; // New prop for the date to analyze
}

interface AIInsight {
  insights: string[];
  nextSteps: string[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ userName, targetDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate basic insights for the target date (supports both daily and monthly views)
  const basicInsights = useMemo(() => {
    if (!targetDate) return null;

    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    // Check if this is a monthly date (YYYY-MM-01 format)
    const isMonthlyDate = targetDate.match(/^\d{4}-\d{2}-01$/);
    
    let dayResults;
    if (isMonthlyDate) {
      // Extract month and year for monthly filtering
      const [year, month] = targetDate.split('-');
      dayResults = storedResults.filter((result: any) => {
        const resultDate = new Date(result.date);
        const resultYear = resultDate.getFullYear().toString();
        const resultMonth = String(resultDate.getMonth() + 1).padStart(2, '0');
        return resultYear === year && resultMonth === month && result.userName === userName;
      });
    } else {
      // Daily filtering
      dayResults = storedResults.filter((result: any) => {
        const resultDate = new Date(result.date).toDateString();
        const targetDateObj = new Date(targetDate).toDateString();
        return resultDate === targetDateObj && result.userName === userName;
      });
    }

    if (dayResults.length === 0) return null;

    const totalQuestions = dayResults.reduce((sum: number, result: any) => sum + (result.questions?.length || 0), 0);
    const totalCorrect = dayResults.reduce((sum: number, result: any) => {
      return sum + (result.answers?.filter((ans: string, i: number) => ans === result.questions[i]?.correctAnswer).length || 0);
    }, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Calculate estimated study time (assuming 1.5 minutes per question)
    const estimatedStudyTime = Math.round(totalQuestions * 1.5);

    return {
      totalQuestions,
      accuracy,
      studyTimeMinutes: estimatedStudyTime,
      sessions: dayResults.length,
      isMonthly: isMonthlyDate
    };
  }, [targetDate, userName]);

  const normalizedTargetDate = useMemo(() => {
    if (!targetDate) return undefined;
    const d = new Date(targetDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }, [targetDate]);

  const handleGenerateInsights = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setShowConfirmation(false);
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Collect fallback data from localStorage for the target date
      const fallbackData = {
        basicInsights,
        hasLocalData: basicInsights && (basicInsights.totalQuestions > 0 || basicInsights.studyTimeMinutes > 0)
      };

      const { data, error } = await supabase.functions.invoke('openai-insight-generator', {
        body: { 
          targetDate: normalizedTargetDate, 
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          clientFallbackData: fallbackData,
          isMonthly: basicInsights?.isMonthly || false
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        setError('Network error—please check your connection and try again');
        return;
      }

      // Handle response data
      if (data?.success === false || data?.error) {
        setError(data.error || 'Unable to generate insight right now—try again later');
        return;
      }

      if (data?.success && (data.insights?.length > 0 || data.nextSteps?.length > 0)) {
        setAiInsights({
          insights: data.insights || [],
          nextSteps: data.nextSteps || []
        });
        setIsExpanded(true);
      } else {
        setError('No deeper patterns detected yet—keep practicing for more insights!');
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('Unable to generate insight right now—try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowConfirmation(false);
    handleGenerateInsights();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Insights */}
        {basicInsights ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Study Time Trends</span>
            </div>
            <p className="text-sm text-gray-600">
              {(basicInsights as any).isMonthly ? 'Monthly summary: ' : ''}Completed {basicInsights.sessions} session{basicInsights.sessions !== 1 ? 's' : ''} with {basicInsights.totalQuestions} questions 
              ({basicInsights.accuracy}% accuracy) in ~{basicInsights.studyTimeMinutes} minutes.
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-black text-white hover:bg-gray-800">
                <Lightbulb className="h-3 w-3 mr-1" />
                Tip
              </Badge>
              <span className="text-sm">
                {basicInsights.accuracy >= 80 
                  ? "Great accuracy! Try harder questions for more challenge." 
                  : basicInsights.accuracy >= 60 
                    ? "Good progress! Focus on reviewing incorrect answers."
                    : "Keep practicing! Review fundamentals to improve accuracy."
                }
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No session data available for this date.
          </div>
        )}

        {/* AI Insights Button */}
        <div className="space-y-3">
          {!showConfirmation ? (
            <Button
              onClick={handleGenerateInsights}
              disabled={isLoading || !basicInsights}
              className="w-full bg-black hover:bg-gray-800 text-white"
              title="Generate personalized insights using AI to analyze your SAT performance patterns"
              aria-label="Generate deeper AI insights based on your SAT practice data"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing your data for personalized SAT tips...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {basicInsights?.isMonthly ? 'Generate AI Insight for this month' : 'Generate AI Insight'}
                </>
              )}
            </Button>
          ) : (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 mb-3">
                This sends anonymized session data to OpenAI for analysis. Proceed?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateInsights}
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setShowConfirmation(false)}
                  size="sm"
                  variant="outline"
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              <Button
                onClick={handleRetry}
                size="sm"
                variant="link"
                className="text-red-600 p-0 h-auto mt-1"
              >
                Retry
              </Button>
            </div>
          )}

          {/* AI Insights Results */}
          {aiInsights && (
            <div className="space-y-3">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                className="w-full justify-between"
              >
                <span>AI Analysis Results</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {isExpanded && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {/* Insights */}
                  {aiInsights.insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Insights:</h4>
                      <ul className="space-y-1">
                        {aiInsights.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {aiInsights.nextSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                      <ol className="space-y-1">
                        {aiInsights.nextSteps.map((step, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="font-medium text-gray-900">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="outline"
                    size="sm"
                  >
                    Collapse
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500">
          Data is used only for analysis and not stored by the AI provider.
        </p>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
