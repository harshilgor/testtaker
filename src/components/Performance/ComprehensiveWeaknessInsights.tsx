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
  Eye,
  Search,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Rocket,
  Target as TargetIcon
} from 'lucide-react';

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

  // Get all unique skills from mistakes
  const allSkills = useMemo(() => {
    if (!mistakes.length) return [];
    
    const skillMap = new Map<string, { subject: 'math' | 'english', mistakes: Mistake[] }>();
    
    mistakes.forEach(mistake => {
      const key = mistake.topic;
      if (!skillMap.has(key)) {
        skillMap.set(key, { subject: mistake.subject as 'math' | 'english', mistakes: [] });
      }
      skillMap.get(key)!.mistakes.push(mistake);
    });
    
    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill,
      subject: data.subject,
      mistakes: data.mistakes
    }));
  }, [mistakes]);

  // Generate comprehensive insights using Gemini AI
  const generateComprehensiveInsights = async () => {
    if (!mistakes.length) return;
    
    setIsGeneratingComprehensive(true);
    
    try {
      // Prepare comprehensive data for Gemini
      const mistakeSummary = mistakes.map(m => ({
        topic: m.topic,
        subject: m.subject,
        difficulty: m.difficulty,
        time_spent: m.time_spent,
        error_type: m.error_type,
        repeat_count: m.repeat_count,
        created_at: m.created_at
      }));

      const subjectBreakdown = {
        math: mistakes.filter(m => m.subject === 'math').length,
        english: mistakes.filter(m => m.subject === 'english').length
      };

      const timeAnalysis = {
        avgTime: Math.round(mistakes.reduce((sum, m) => sum + (m.time_spent || 0), 0) / mistakes.length),
        fastMistakes: mistakes.filter(m => (m.time_spent || 0) < 30).length,
        slowMistakes: mistakes.filter(m => (m.time_spent || 0) > 90).length
      };

      const topicBreakdown = allSkills.map(skill => ({
        topic: skill.skill,
        subject: skill.subject,
        mistakeCount: skill.mistakes.length,
        avgTime: Math.round(skill.mistakes.reduce((sum, m) => sum + (m.time_spent || 0), 0) / skill.mistakes.length)
      }));

      // Create comprehensive prompt for Gemini
      const comprehensivePrompt = `You are an expert SAT tutor analyzing a student's comprehensive performance data. 

STUDENT: ${userName}
TOTAL MISTAKES: ${mistakes.length}
SUBJECT BREAKDOWN: Math: ${subjectBreakdown.math}, English: ${subjectBreakdown.english}
TIME ANALYSIS: Average time per question: ${timeAnalysis.avgTime}s, Fast mistakes (<30s): ${timeAnalysis.fastMistakes}, Slow mistakes (>90s): ${timeAnalysis.slowMistakes}

TOPIC BREAKDOWN:
${topicBreakdown.map(t => `- ${t.topic} (${t.subject}): ${t.mistakeCount} mistakes, avg ${t.avgTime}s`).join('\n')}

MISTAKE DETAILS:
${mistakeSummary.map(m => `- ${m.topic} (${m.subject}): ${m.difficulty} difficulty, ${m.time_spent}s, repeat: ${m.repeat_count}, error: ${m.error_type || 'unknown'}`).join('\n')}

Please provide a comprehensive analysis in this JSON format:

{
  "overallAnalysis": "A 3-4 sentence summary of the student's overall performance and main challenges",
  "keyWeaknesses": [
    "List 5-6 specific areas where the student struggles most",
    "Be specific about topics and skills"
  ],
  "learningPatterns": [
    "List 4-5 patterns in how the student approaches questions",
    "Include time management, error types, and subject preferences"
  ],
  "improvementStrategies": [
    "List 6-8 specific strategies to improve overall performance",
    "Include both study techniques and test-taking strategies"
  ],
  "timeManagementInsights": [
    "List 3-4 specific insights about the student's time management",
    "Based on the time data provided"
  ],
  "subjectSpecificAdvice": {
    "math": [
      "List 4-5 specific strategies for math improvement",
      "Based on math mistakes and patterns"
    ],
    "english": [
      "List 4-5 specific strategies for English improvement", 
      "Based on English mistakes and patterns"
    ]
  },
  "confidenceLevel": "low/medium/high based on the overall performance",
  "estimatedImprovementTime": "Realistic time estimate for significant improvement",
  "priorityActions": [
    "List 4-5 immediate actions the student should take",
    "Prioritized by impact and urgency"
  ]
}

Make the analysis specific, actionable, and encouraging. Focus on patterns and specific strategies.`;

      // Call Gemini API for comprehensive analysis
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBhOTKC0-sJXvoXNpCShWPKfJ6_1BG2h2w`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: comprehensivePrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setComprehensiveInsights(parsed);
        } else {
          // Fallback parsing
          setComprehensiveInsights({
            overallAnalysis: "Based on your performance data, you have several areas for improvement. Focus on your weakest topics and practice time management.",
            keyWeaknesses: ["Need more specific analysis"],
            learningPatterns: ["Patterns being analyzed"],
            improvementStrategies: ["Practice regularly", "Review mistakes", "Time management"],
            timeManagementInsights: ["Work on pacing"],
            subjectSpecificAdvice: {
              math: ["Practice problem-solving"],
              english: ["Improve reading comprehension"]
            },
            confidenceLevel: 'medium',
            estimatedImprovementTime: '3-4 weeks',
            priorityActions: ["Start with weakest topics", "Practice daily"]
          });
        }
      }
    } catch (error) {
      console.error('Error generating comprehensive insights:', error);
      // Fallback insights
      setComprehensiveInsights({
        overallAnalysis: "Analysis complete! Here are your key areas for improvement based on your performance data.",
        keyWeaknesses: ["Focus on your weakest topics first"],
        learningPatterns: ["Review your mistake patterns"],
        improvementStrategies: ["Practice regularly", "Review explanations", "Time management"],
        timeManagementInsights: ["Work on pacing yourself"],
        subjectSpecificAdvice: {
          math: ["Practice problem-solving", "Review formulas"],
          english: ["Improve reading comprehension", "Practice grammar"]
        },
        confidenceLevel: 'medium',
        estimatedImprovementTime: '3-4 weeks',
        priorityActions: ["Start with weakest topics", "Practice daily", "Review mistakes"]
      });
    } finally {
      setIsGeneratingComprehensive(false);
    }
  };

  // Analyze all skills with Gemini AI
  const analyzeAllSkills = async () => {
    if (hasAnalyzed) return;
    
    setHasAnalyzed(true);
    
    // Generate comprehensive insights
    await generateComprehensiveInsights();
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Weakness Analysis</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Comprehensive insights from Gemini AI
            </p>
          </div>
        </div>
        
        <Button
          onClick={analyzeAllSkills}
          disabled={isGeneratingComprehensive || hasAnalyzed}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGeneratingComprehensive ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : hasAnalyzed ? (
            <RefreshCw className="h-4 w-4 mr-2" />
          ) : (
            <TargetIcon className="h-4 w-4 mr-2" />
          )}
          {isGeneratingComprehensive ? 'Analyzing...' : hasAnalyzed ? 'Re-analyze' : 'Target My Weakness'}
        </Button>
      </div>

      {/* Comprehensive AI Insights */}
      {comprehensiveInsights && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              Gemini AI Comprehensive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Analysis */}
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <TargetIcon className="h-4 w-4" />
                Overall Performance Analysis
              </h4>
              <p className="text-sm text-blue-700">{comprehensiveInsights.overallAnalysis}</p>
            </div>

            {/* Key Weaknesses */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Key Weaknesses
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.keyWeaknesses.map((weakness, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning Patterns */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Learning Patterns
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.learningPatterns.map((pattern, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Strategies */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500" />
                Improvement Strategies
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.improvementStrategies.map((strategy, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time Management */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                Time Management Insights
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.timeManagementInsights.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject-Specific Advice */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <span className="text-blue-500">📊</span>
                  Math Strategies
                </h4>
                <ul className="space-y-1">
                  {comprehensiveInsights.subjectSpecificAdvice.math.map((advice, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <span className="text-green-500">📚</span>
                  English Strategies
                </h4>
                <ul className="space-y-1">
                  {comprehensiveInsights.subjectSpecificAdvice.english.map((advice, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-red-500" />
                Priority Actions
              </h4>
              <ul className="space-y-1">
                {comprehensiveInsights.priorityActions.map((action, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confidence and Timeline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-xs mb-1">AI Confidence</h4>
                <Badge className={`text-xs ${getConfidenceColor(comprehensiveInsights.confidenceLevel)}`}>
                  {getConfidenceIcon(comprehensiveInsights.confidenceLevel)} {comprehensiveInsights.confidenceLevel}
                </Badge>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-xs mb-1">Improvement Time</h4>
                <p className="text-xs text-gray-700">{comprehensiveInsights.estimatedImprovementTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-1">Total Mistakes</h4>
              <p className="text-2xl font-bold text-gray-900">{mistakes.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-1">Skills Analyzed</h4>
              <p className="text-2xl font-bold text-gray-900">{allSkills.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveWeaknessInsights;
