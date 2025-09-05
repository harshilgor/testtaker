import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Clock, 
  Brain, 
  BookOpen,
  Zap,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Play,
  XCircle,
  CheckCircle,
  Timer,
  Search,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Rocket,
  Target as TargetIcon
} from 'lucide-react';
import openaiAnalysisService from '@/services/openaiAnalysisService';
import targetedQuestionService from '@/services/targetedQuestionService';
import WeaknessTrainingZone from './WeaknessTrainingZone';

interface Mistake {
  id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  review_status: 'unreviewed' | 'reviewed' | 'retried';
  repeat_count: number;
  question_text?: string;
  correct_answer?: string;
  explanation?: string;
  options?: string[];
  user_answer?: string;
  error_type?: string;
}

interface ComprehensiveWeaknessInsightsProps {
  mistakes: Mistake[];
  userName: string;
  onStartPractice?: (practiceData: PracticeData) => void;
}

interface PracticeData {
  questions: Mistake[];
  focusTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  targetScore: number;
}

interface ComprehensiveInsights {
  overallAnalysis: string;
  keyWeaknesses: string[];
  learningPatterns: string[];
  improvementStrategies: string[];
  timeManagementInsights: string[];
  subjectSpecificAdvice: {
    math: string[];
    english: string[];
  };
  confidenceLevel: 'low' | 'medium' | 'high';
  estimatedImprovementTime: string;
  priorityActions: string[];
}

const ComprehensiveWeaknessInsights: React.FC<ComprehensiveWeaknessInsightsProps> = ({ mistakes, userName, onStartPractice }) => {
  const [comprehensiveInsights, setComprehensiveInsights] = useState<ComprehensiveInsights | null>(null);
  const [isGeneratingComprehensive, setIsGeneratingComprehensive] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Targeted questions state
  const [targetedQuestions, setTargetedQuestions] = useState<any[]>([]);
  const [weaknessInsights, setWeaknessInsights] = useState<string[]>([]);
  const [overallStrategy, setOverallStrategy] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showTrainingZone, setShowTrainingZone] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Get all unique skills from mistakes
  const allSkills = useMemo(() => {
    if (!mistakes.length) return [] as Array<{ skill: string; subject: 'math' | 'english'; mistakes: Mistake[] }>;
    const skillMap = new Map<string, { subject: 'math' | 'english', mistakes: Mistake[] }>();
    mistakes.forEach(mistake => {
      const key = mistake.topic;
      if (!skillMap.has(key)) {
        skillMap.set(key, { subject: (mistake.subject as 'math' | 'english') || 'english', mistakes: [] });
      }
      skillMap.get(key)!.mistakes.push(mistake);
    });
    return Array.from(skillMap.entries()).map(([skill, data]) => ({ skill, subject: data.subject, mistakes: data.mistakes }));
  }, [mistakes]);

  // Generate comprehensive insights using OpenAI (via Supabase Edge Function)
  const generateComprehensiveInsights = async () => {
    if (!mistakes.length) return;
    setIsGeneratingComprehensive(true);
    setAnalysisError(null);
    try {
      // Majority subject for context
      const mathCount = mistakes.filter(m => (m.subject || '').toLowerCase().includes('math')).length;
      const englishCount = mistakes.length - mathCount;
      const subject: 'math' | 'english' = mathCount >= englishCount ? 'math' : 'english';

      const avgTime = Math.round(mistakes.reduce((s, m) => s + (m.time_spent || 0), 0) / mistakes.length);

      // Send ALL incorrect questions with text to OpenAI via Edge Function
      const request = {
        mistakes: mistakes.map(m => ({
          question_text: m.question_text,
          time_spent: m.time_spent,
          difficulty: m.difficulty,
          error_type: m.error_type,
          created_at: m.created_at,
          topic: m.topic,
          subject: m.subject
        })),
        userName,
        totalMistakes: mistakes.length,
        avgTimeSpent: avgTime
      };

      const analysis = await openaiAnalysisService.analyzeWeaknesses(request);

      // Map OpenAI response into our UI model (bullet points)
      const mapped: ComprehensiveInsights = {
        overallAnalysis: analysis.overallInsight,
        keyWeaknesses: analysis.weaknesses,
        learningPatterns: analysis.explanations,
        improvementStrategies: analysis.recommendations,
        timeManagementInsights: [
          avgTime < 30 ? 'You tend to rush questions.' : avgTime > 90 ? 'You spend too long per question.' : 'Your pacing is generally reasonable.'
        ],
        subjectSpecificAdvice: {
          math: subject === 'math' ? analysis.recommendations.slice(0, 5) : [],
          english: subject === 'english' ? analysis.recommendations.slice(0, 5) : []
        },
        confidenceLevel: analysis.confidenceLevel,
        estimatedImprovementTime: analysis.estimatedImprovementTime,
        priorityActions: analysis.recommendations.slice(0, 5)
      };

      setComprehensiveInsights(mapped);
    } catch (error) {
      console.error('Error generating comprehensive insights:', error);
      setAnalysisError('Failed to generate AI analysis. Please try again.');
      // Minimal safe fallback
      setComprehensiveInsights({
        overallAnalysis: 'Analysis complete! Here are your key areas for improvement based on your performance data.',
        keyWeaknesses: ['Focus on your weakest topics first'],
        learningPatterns: ['Review your mistake patterns'],
        improvementStrategies: ['Practice regularly', 'Review explanations', 'Time management'],
        timeManagementInsights: ['Work on pacing yourself'],
        subjectSpecificAdvice: { math: [], english: [] },
        confidenceLevel: 'medium',
        estimatedImprovementTime: '3-4 weeks',
        priorityActions: ['Start with weakest topics', 'Practice daily', 'Review mistakes']
      });
    } finally {
      setIsGeneratingComprehensive(false);
    }
  };

  // Analyze all skills with OpenAI AI
  const analyzeAllSkills = async () => {
    if (hasAnalyzed) return;
    setHasAnalyzed(true);
    await generateComprehensiveInsights();
  };

  // Generate targeted practice questions
  const generateTargetedQuestions = async () => {
    if (!mistakes.length) return;
    setIsGeneratingQuestions(true);
    setQuestionsError(null);
    
    try {
      const request = {
        mistakes: mistakes.map(m => ({
          question_text: m.question_text,
          time_spent: m.time_spent,
          difficulty: m.difficulty,
          error_type: m.error_type,
          created_at: m.created_at,
          topic: m.topic,
          subject: m.subject,
          user_answer: m.user_answer,
          correct_answer: m.correct_answer
        })),
        userName,
        totalMistakes: mistakes.length
      };

      const response = await targetedQuestionService.generateTargetedQuestions(request);
      
      setTargetedQuestions(response.questions);
      setWeaknessInsights(response.weaknessInsights);
      setOverallStrategy(response.overallStrategy);
      setEstimatedTime(response.estimatedTime);
      setShowTrainingZone(true);
      
    } catch (error) {
      console.error('Error generating targeted questions:', error);
      setQuestionsError('Failed to generate targeted questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const getConfidenceColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '😰';
      case 'medium': return '😐';
      case 'high': return '😊';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="h-5 w-5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">AI Weakness Analysis</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Comprehensive insights from OpenAI GPT-4o</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={analyzeAllSkills}
            disabled={isGeneratingComprehensive || hasAnalyzed}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            size="sm"
          >
            {isGeneratingComprehensive ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : hasAnalyzed ? (
              <RefreshCw className="h-4 w-4 mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            <span className="truncate">
              {isGeneratingComprehensive ? 'Analyzing...' : hasAnalyzed ? 'Re-analyze' : 'AI Analysis'}
            </span>
          </Button>
          
          <Button
            onClick={generateTargetedQuestions}
            disabled={isGeneratingQuestions || !mistakes.length}
            className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto disabled:bg-gray-400"
            size="sm"
          >
            {isGeneratingQuestions ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TargetIcon className="h-4 w-4 mr-2" />
            )}
            <span className="truncate">
              {isGeneratingQuestions ? 'Generating Questions...' : 'Target My Weakness'}
            </span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(analysisError || questionsError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{analysisError || questionsError}</span>
          </div>
        </div>
      )}

      {/* Comprehensive AI Insights */}
      {comprehensiveInsights && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">OpenAI GPT-4o Comprehensive Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Analysis */}
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <TargetIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Overall Performance Analysis</span>
              </h4>
              <p className="text-sm text-blue-700 break-words">{comprehensiveInsights.overallAnalysis}</p>
            </div>

            {/* Summary of Common Errors */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Summary of Common Errors</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.keyWeaknesses.slice(0, 1).map((error, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{error}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specific Areas of Weakness */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">Specific Areas of Weakness</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.keyWeaknesses.slice(1, 2).map((weakness, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Performance Patterns */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="truncate">Performance Patterns</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.keyWeaknesses.slice(2, 3).map((pattern, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Insights */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="truncate">Actionable Insights</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.keyWeaknesses.slice(3, 4).map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Mistake Analysis */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Detailed Mistake Analysis</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.learningPatterns.map((analysis, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{analysis}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Strategies */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="truncate">Improvement Strategies</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.improvementStrategies.map((strategy, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time Management */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">Time Management Insights</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.timeManagementInsights.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject-Specific Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <span className="text-blue-500 flex-shrink-0">📊</span>
                  <span className="truncate">Math Strategies</span>
                </h4>
                <ul className="space-y-1">
                  {comprehensiveInsights.subjectSpecificAdvice.math.map((advice, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                      <span className="break-words">{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <span className="text-green-500 flex-shrink-0">📚</span>
                  <span className="truncate">English Strategies</span>
                </h4>
                <ul className="space-y-1">
                  {comprehensiveInsights.subjectSpecificAdvice.english.map((advice, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                      <span className="break-words">{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Priority Actions</span>
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.priorityActions.map((action, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                    <span className="break-words">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confidence and Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-xs mb-1 truncate">AI Confidence</h4>
                <Badge className={`text-xs ${getConfidenceColor(comprehensiveInsights.confidenceLevel)}`}>
                  {getConfidenceIcon(comprehensiveInsights.confidenceLevel)} {comprehensiveInsights.confidenceLevel}
                </Badge>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-xs mb-1 truncate">Improvement Time</h4>
                <p className="text-xs text-gray-700 truncate">{comprehensiveInsights.estimatedImprovementTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">Total Mistakes</h4>
              <p className="text-2xl font-bold text-gray-900">{mistakes.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">Skills Analyzed</h4>
              <p className="text-2xl font-bold text-gray-900">{allSkills.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weakness Training Zone */}
      {showTrainingZone && (
        <div className="mt-6">
          <WeaknessTrainingZone
            questions={targetedQuestions}
            weaknessInsights={weaknessInsights}
            overallStrategy={overallStrategy}
            estimatedTime={estimatedTime}
            onQuestionComplete={(questionIndex, isCorrect) => {
              console.log(`Question ${questionIndex + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`);
            }}
            onAllQuestionsComplete={(results) => {
              console.log('Training completed:', results);
              // TODO: Store results in database for progress tracking
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ComprehensiveWeaknessInsights;
