import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  Loader2, 
  Play, 
  Target, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { geminiAnalysisService } from '@/services/geminiAnalysisService';

interface DemoMistake {
  question_text: string;
  time_spent: number;
  difficulty: string;
  error_type: string;
  created_at: string;
}

const GeminiAIDemo: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Demo data for testing
  const demoMistakes: DemoMistake[] = [
    {
      question_text: "What is the main idea of the passage about climate change?",
      time_spent: 25,
      difficulty: "medium",
      error_type: "main_idea",
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      question_text: "Which of the following best describes the author's tone?",
      time_spent: 18,
      difficulty: "medium",
      error_type: "tone_analysis",
      created_at: "2024-01-15T10:35:00Z"
    },
    {
      question_text: "According to the passage, what causes global warming?",
      time_spent: 22,
      difficulty: "hard",
      error_type: "detail_retrieval",
      created_at: "2024-01-15T10:40:00Z"
    }
  ];

  const topics = [
    { name: 'Reading Comprehension', subject: 'english', icon: '📚' },
    { name: 'Algebra', subject: 'math', icon: '📊' },
    { name: 'Geometry', subject: 'math', icon: '📐' },
    { name: 'Grammar', subject: 'english', icon: '✏️' }
  ];

  const handleAnalyze = async (topic: string, subject: 'math' | 'english') => {
    setIsAnalyzing(true);
    setSelectedTopic(topic);
    
    try {
      // Simulate different mistake patterns for demo
      const topicMistakes = demoMistakes.map((mistake, index) => ({
        ...mistake,
        time_spent: subject === 'math' ? 45 + (index * 10) : 20 + (index * 5), // Math takes longer
        difficulty: subject === 'math' ? 'hard' : 'medium'
      }));

      const avgTime = topicMistakes.reduce((sum, m) => sum + m.time_spent, 0) / topicMistakes.length;
      
      const result = await geminiAnalysisService.analyzeWeakness({
        topic,
        subject,
        mistakes: topicMistakes,
        avgTimeSpent: Math.round(avgTime),
        mistakeCount: topicMistakes.length,
        userName: 'Demo Student'
      });

      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        rootCauses: ['Error in analysis', 'Please try again'],
        specificReasons: ['Technical issue occurred'],
        practiceStrategies: ['Contact support if problem persists'],
        overallInsight: 'Unable to complete analysis at this time',
        confidenceLevel: 'low',
        estimatedImprovementTime: 'Unknown'
      });
    } finally {
      setIsAnalyzing(false);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Gemini AI Weakness Analysis Demo
        </h1>
        <p className="text-gray-600">
          Experience real-time AI-powered insights into your learning weaknesses
        </p>
      </div>

      {/* Demo Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Select a Topic for AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topics.map((topic) => (
              <Button
                key={topic.name}
                onClick={() => handleAnalyze(topic.name, topic.subject as 'math' | 'english')}
                disabled={isAnalyzing}
                className="h-24 flex flex-col items-center justify-center gap-2 p-4"
                variant="outline"
              >
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-sm font-medium">{topic.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {topic.subject}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gemini AI is analyzing your performance...
            </h3>
            <p className="text-gray-600">
              Analyzing {selectedTopic} with advanced AI algorithms
            </p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Analysis Results for {selectedTopic}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Insight */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Overall Insight
              </h4>
              <p className="text-blue-700">{analysisResult.overallInsight}</p>
            </div>

            {/* Confidence and Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">AI Confidence Level</h4>
                <Badge className={`${getConfidenceColor(analysisResult.confidenceLevel)}`}>
                  {getConfidenceIcon(analysisResult.confidenceLevel)} {analysisResult.confidenceLevel}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Estimated Improvement Time</h4>
                <p className="text-gray-700">{analysisResult.estimatedImprovementTime}</p>
              </div>
            </div>

            {/* Root Causes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Root Causes (AI Identified)
              </h4>
              <ul className="space-y-2">
                {analysisResult.rootCauses.map((cause: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-red-800">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specific Reasons */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Why You're Getting These Wrong
              </h4>
              <ul className="space-y-2">
                {analysisResult.specificReasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-orange-800">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Strategies */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                How to Improve (AI Recommendations)
              </h4>
              <ul className="space-y-2">
                {analysisResult.practiceStrategies.map((strategy: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-green-800">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="text-center pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Practice with AI Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            How Gemini AI Analysis Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Data Analysis</h4>
              <p className="text-sm text-gray-600">
                AI analyzes your performance patterns, timing, and error types
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. AI Processing</h4>
              <p className="text-sm text-gray-600">
                Gemini AI generates personalized insights and recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💡</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Actionable Insights</h4>
              <p className="text-sm text-gray-600">
                Receive specific strategies to improve your weak areas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiAIDemo;
