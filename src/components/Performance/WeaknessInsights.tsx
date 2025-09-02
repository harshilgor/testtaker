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
import { geminiAnalysisService } from '@/services/geminiAnalysisService';

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

interface WeaknessInsightsProps {
  mistakes: Mistake[];
  userName: string;
  onStartPractice?: (practiceData: PracticeData) => void;
}

interface SkillAnalysis {
  skill: string;
  subject: 'math' | 'english';
  mistakeCount: number;
  avgTimeSpent: number;
  difficulty: string;
  rootCauses: string[];
  specificReasons: string[];
  practiceStrategies: string[];
  overallInsight: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  estimatedImprovementTime: string;
  isAnalyzing: boolean;
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

const WeaknessInsights: React.FC<WeaknessInsightsProps> = ({ mistakes, userName, onStartPractice }) => {
  const [skillAnalyses, setSkillAnalyses] = useState<SkillAnalysis[]>([]);
  const [overallInsights, setOverallInsights] = useState<Array<{
    type: 'warning' | 'tip' | 'focus';
    icon: string;
    title: string;
    message: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isPreparingPractice, setIsPreparingPractice] = useState(false);
  const [comprehensiveInsights, setComprehensiveInsights] = useState<ComprehensiveInsights | null>(null);
  const [isGeneratingComprehensive, setIsGeneratingComprehensive] = useState(false);

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

  // Initialize skill analyses when skills change
  useEffect(() => {
    if (allSkills.length > 0) {
      const initialAnalyses: SkillAnalysis[] = allSkills.map(({ skill, subject, mistakes }) => {
        const avgTimeSpent = mistakes.reduce((sum, m) => sum + (m.time_spent || 0), 0) / mistakes.length;
        const difficulties = [...new Set(mistakes.map(m => m.difficulty))];
        const mostCommonDifficulty = difficulties.reduce((a, b) => 
          mistakes.filter(m => m.difficulty === a).length > mistakes.filter(m => m.difficulty === b).length ? a : b
        );

        return {
          skill,
          subject,
          mistakeCount: mistakes.length,
          avgTimeSpent: Math.round(avgTimeSpent),
          difficulty: mostCommonDifficulty,
          rootCauses: [],
          specificReasons: [],
          practiceStrategies: [],
          overallInsight: '',
          confidenceLevel: 'medium',
          estimatedImprovementTime: '2-3 weeks',
          isAnalyzing: false
        };
      });

      setSkillAnalyses(initialAnalyses);
    }
  }, [allSkills]);

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
        avgTime: Math.round(
          (skill.mistakes.reduce((sum, m) => sum + (m.time_spent || 0), 0)) /
          (skill.mistakes.length || 1)
        )
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

  // Duplicate generateComprehensiveInsights removed to fix redeclaration error


  // Analyze all skills with Gemini AI
  const analyzeAllSkills = async () => {
    if (hasAnalyzed) return;
    
    setIsLoading(true);
    setHasAnalyzed(true);
    // Generate comprehensive insights once
    await generateComprehensiveInsights();
    
    const updatedAnalyses = [...skillAnalyses];
    
    for (let i = 0; i < updatedAnalyses.length; i++) {
      const analysis = updatedAnalyses[i];
      
      // Mark as analyzing
      updatedAnalyses[i] = { ...analysis, isAnalyzing: true };
      setSkillAnalyses([...updatedAnalyses]);
      
      try {
        // Get mistakes for this skill
        const skillMistakes = mistakes.filter(m => m.topic === analysis.skill);
        
        // Call Gemini API for AI analysis
        const aiAnalysis = await geminiAnalysisService.analyzeWeakness({
          topic: analysis.skill,
          subject: analysis.subject,
          mistakes: skillMistakes,
          avgTimeSpent: analysis.avgTimeSpent,
          mistakeCount: analysis.mistakeCount,
          userName
        });
        
        // Update analysis with AI results
        updatedAnalyses[i] = {
          ...analysis,
          rootCauses: aiAnalysis.rootCauses,
          specificReasons: aiAnalysis.specificReasons,
          practiceStrategies: aiAnalysis.practiceStrategies,
          overallInsight: aiAnalysis.overallInsight,
          confidenceLevel: aiAnalysis.confidenceLevel,
          estimatedImprovementTime: aiAnalysis.estimatedImprovementTime,
          isAnalyzing: false
        };
        
        setSkillAnalyses([...updatedAnalyses]);
        
        // Small delay to show analysis progress
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error analyzing ${analysis.skill}:`, error);
        // Mark as not analyzing on error
        updatedAnalyses[i] = { ...analysis, isAnalyzing: false };
        setSkillAnalyses([...updatedAnalyses]);
      }
    }
    
    setIsLoading(false);
    
    // Generate overall insights
    try {
      const aiInsights = await geminiAnalysisService.generateOverallInsights(mistakes, userName);
      setOverallInsights(aiInsights);
    } catch (error) {
      console.error('Error generating overall insights:', error);
      // Fallback insights
      setOverallInsights([
        {
          type: 'warning' as const,
          icon: '⚠️',
          title: 'Recent Struggles',
          message: `${mistakes.filter(m => {
            const mistakeDate = new Date(m.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return mistakeDate >= weekAgo;
          }).length} mistakes this week - consider reviewing fundamentals`
        },
        {
          type: 'tip' as const,
          icon: '💡',
          title: 'Practice Strategy',
          message: 'Focus on your weakest topics first and review explanations thoroughly'
        },
        {
          type: 'focus' as const,
          icon: '🎯',
          title: 'Improvement Focus',
          message: 'Set specific goals for each study session to track your progress'
        }
      ]);
    }
  };

  // Prepare practice session with questions user is most likely to get wrong
  const preparePracticeSession = async () => {
    if (!hasAnalyzed || skillAnalyses.length === 0) return;
    
    setIsPreparingPractice(true);
    
    try {
      // Sort skills by mistake count (most mistakes first)
      const sortedSkills = [...skillAnalyses].sort((a, b) => b.mistakeCount - a.mistakeCount);
      
      // Get top 3 weakest skills
      const focusTopics = sortedSkills.slice(0, 3).map(s => s.skill);
      
      // Get questions from these topics that the user got wrong
      const practiceQuestions = mistakes.filter(m => focusTopics.includes(m.topic));
      
      // Determine difficulty level based on user's performance
      const avgDifficulty = skillAnalyses.reduce((sum, skill) => {
        const difficultyScore = skill.difficulty === 'easy' ? 1 : skill.difficulty === 'medium' ? 2 : 3;
        return sum + difficultyScore;
      }, 0) / skillAnalyses.length;
      
      let targetDifficulty: 'easy' | 'medium' | 'hard';
      if (avgDifficulty <= 1.5) targetDifficulty = 'easy';
      else if (avgDifficulty <= 2.5) targetDifficulty = 'medium';
      else targetDifficulty = 'hard';
      
      // Calculate estimated duration (2 minutes per question)
      const estimatedDuration = Math.min(practiceQuestions.length * 2, 60); // Cap at 60 minutes
      
      // Calculate target score (aim for 80% improvement)
      const currentAccuracy = 100 - (mistakes.length / (mistakes.length + 10) * 100); // Rough estimate
      const targetScore = Math.min(currentAccuracy + 20, 95);
      
      const practiceData: PracticeData = {
        questions: practiceQuestions.slice(0, 20), // Limit to 20 questions
        focusTopics,
        difficulty: targetDifficulty,
        estimatedDuration,
        targetScore: Math.round(targetScore)
      };
      
      // Call the parent component's onStartPractice function
      if (onStartPractice) {
        onStartPractice(practiceData);
      } else {
        // Fallback: store in localStorage and show message
        localStorage.setItem('weaknessPracticeData', JSON.stringify(practiceData));
        alert(`Practice session prepared! Focus topics: ${focusTopics.join(', ')}. Target score: ${targetScore}%`);
      }
      
    } catch (error) {
      console.error('Error preparing practice session:', error);
      alert('Error preparing practice session. Please try again.');
    } finally {
      setIsPreparingPractice(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPractice = (skill: string) => {
    // Store selected skill for practice
    localStorage.setItem('selectedPracticeTopic', JSON.stringify({
      topic: skill,
      subject: skillAnalyses.find(a => a.skill === skill)?.subject || 'general'
    }));
    
    // Navigate to quiz page (you can implement this navigation)
    console.log(`Starting practice for ${skill}`);
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

  const getSubjectIcon = (subject: 'math' | 'english') => {
    return subject === 'math' ? '📊' : '📚';
  };

  const getSubjectColor = (subject: 'math' | 'english') => {
    return subject === 'math' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200';
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
          disabled={isLoading || hasAnalyzed}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : hasAnalyzed ? (
            <RefreshCw className="h-4 w-4 mr-2" />
          ) : (
            <TargetIcon className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Analyzing...' : hasAnalyzed ? 'Re-analyze' : 'Target My Weakness'}
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

      {/* Overall Insights */}
      {overallInsights.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overallInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{insight.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Weakness Analysis for Every Skill */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-500" />
            Topic-Specific Analysis
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {skillAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-500 font-medium">No skills detected</p>
              <p className="text-sm text-gray-400">Complete some questions to see your weakness analysis.</p>
            </div>
          ) : (
            skillAnalyses.map((analysis, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getSubjectIcon(analysis.subject)}</span>
                      <h4 className="font-semibold text-gray-900">{analysis.skill}</h4>
                      <Badge variant="outline" className={`text-xs ${getSubjectColor(analysis.subject)}`}>
                        {analysis.subject}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          analysis.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                          analysis.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-red-300 text-red-700'
                        }`}
                      >
                        {analysis.difficulty}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(analysis.confidenceLevel)}`}
                      >
                        {getConfidenceIcon(analysis.confidenceLevel)} {analysis.confidenceLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span>{analysis.mistakeCount} mistakes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(analysis.avgTimeSpent)} avg</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        <span>Improve in {analysis.estimatedImprovementTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartPractice(analysis.skill)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={analysis.isAnalyzing}
                  >
                    {analysis.isAnalyzing ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    {analysis.isAnalyzing ? 'Analyzing...' : 'Practice'}
                  </Button>
                </div>

                {/* AI Analysis Results */}
                {analysis.isAnalyzing ? (
                  <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">AI is analyzing your performance...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Insight */}
                    {analysis.overallInsight && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          AI Insight
                        </h5>
                        <p className="text-sm text-blue-700">{analysis.overallInsight}</p>
                      </div>
                    )}

                    {/* Root Causes */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Root Causes (AI Identified)
                      </h5>
                      <ul className="space-y-1">
                        {analysis.rootCauses.map((cause, causeIndex) => (
                          <li key={causeIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specific Reasons */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Why You're Getting These Wrong
                      </h5>
                      <ul className="space-y-1">
                        {analysis.specificReasons.map((reason, reasonIndex) => (
                          <li key={reasonIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Practice Strategies */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                        How to Improve
                      </h5>
                      <ul className="space-y-1">
                        {analysis.practiceStrategies.map((strategy, strategyIndex) => (
                          <li key={strategyIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* AI Study Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            AI Study Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 text-sm mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Focus Areas
              </h4>
              <p className="text-sm text-blue-700">
                Prioritize {skillAnalyses.slice(0, 3).map(a => a.skill).join(', ')} 
                {skillAnalyses.length > 3 && ' and other weak skills'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 text-sm mb-1 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Practice Strategy
              </h4>
              <p className="text-sm text-green-700">
                Start with your weakest skills first and gradually work your way up. Review explanations thoroughly.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Time Management
              </h4>
              <p className="text-sm text-purple-700">
                Aim for 45-60 seconds per question. Don't rush, but don't overthink either.
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 text-sm mb-1 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Review Strategy
              </h4>
              <p className="text-sm text-orange-700">
                Focus on understanding why answers are wrong, not just memorizing correct ones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Practice Button - Only show after analysis is complete */}
      {hasAnalyzed && skillAnalyses.length > 0 && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Ready to Practice?
            </h3>
            <p className="text-sm text-blue-700 mb-4 max-w-md mx-auto">
              Based on your weakness analysis, we've identified the questions you're most likely to get wrong. 
              Start practicing to improve your weakest areas!
            </p>
            <Button
              onClick={preparePracticeSession}
              disabled={isPreparingPractice}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {isPreparingPractice ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Preparing Practice...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Practice
                </>
              )}
            </Button>
            <p className="text-xs text-blue-600 mt-3">
              Practice questions will focus on: {skillAnalyses.slice(0, 3).map(a => a.skill).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeaknessInsights;
