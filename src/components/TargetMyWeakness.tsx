import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Target, TrendingDown, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { weaknessAnalysisService } from '@/services/weaknessAnalysisService';

interface TargetMyWeaknessProps {
  onLaunch?: () => void;
}

const TargetMyWeakness: React.FC<TargetMyWeaknessProps> = ({ 
  onLaunch 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const [selectedWeakSkills, setSelectedWeakSkills] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showQuestionCountInput, setShowQuestionCountInput] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => {
    const loadAttempts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('question_attempts_v2')
          .select('topic, subject, is_correct')
          .eq('user_id', user.id)
          .limit(5000);

        if (!error && data) {
          setAttempts(data);
        }
      } catch (error) {
        console.error('Error loading attempts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAttempts();
  }, [user]);

  // Find weak topics (accuracy < 60%)
  const weakTopics = useMemo(() => {
    if (!attempts.length) return [];
    
    const topicStats = new Map<string, { correct: number; total: number; subject?: string }>();
    
    attempts.forEach(attempt => {
      const topic = attempt.topic || 'Unknown';
      const current = topicStats.get(topic) || { correct: 0, total: 0, subject: attempt.subject };
      current.total++;
      if (attempt.is_correct) {
        current.correct++;
      }
      if (!current.subject && attempt.subject) {
        current.subject = attempt.subject;
      }
      topicStats.set(topic, current);
    });
    
    const weak: Array<{ topic: string; accuracy: number; subject?: string }> = [];
    topicStats.forEach((stats, topic) => {
      if (stats.total >= 3) { // Only consider topics with at least 3 attempts
        const topicAccuracy = Math.round((stats.correct / stats.total) * 100);
        if (topicAccuracy < 60) {
          weak.push({ topic, accuracy: topicAccuracy, subject: stats.subject });
        }
      }
    });
    
    return weak.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  }, [attempts]);

  const topWeakSkills = weakTopics.slice(0, 3);

  const handleLaunch = () => {
    if (onLaunch) {
      onLaunch();
    } else {
      // Show practice mode dialog
      if (weakTopics.length > 0) {
        setSelectedWeakSkills(weakTopics.map(w => w.topic));
        setShowPracticeDialog(true);
      } else {
        alert('No weak skills found. Keep practicing to identify your weak areas!');
      }
    }
  };

  const handleWeakSkillsClick = () => {
    if (topWeakSkills.length > 0) {
      setSelectedWeakSkills(topWeakSkills.map(s => s.topic));
      setShowPracticeDialog(true);
    }
  };

  const handleStartMarathon = () => {
    if (selectedWeakSkills.length > 0) {
      // Get the subject from the first weak skill
      const firstSkill = weakTopics.find(w => selectedWeakSkills.includes(w.topic)) || weakTopics[0];
      const subject = firstSkill.subject?.toLowerCase() === 'math' ? 'math' : 
                     firstSkill.subject?.toLowerCase() === 'english' ? 'english' : 'both';
      
      navigate('/marathon', {
        state: {
          marathonSettings: {
            subjects: subject === 'both' ? ['both'] : [subject],
            difficulty: 'mixed',
            timedMode: false,
            calculatorEnabled: true,
            darkMode: false,
            fontSize: 'medium' as const,
            adaptiveLearning: true,
            skill: selectedWeakSkills[0] // Use first weak skill
          }
        }
      });
    }
    setShowPracticeDialog(false);
    setShowQuestionCountInput(false);
  };

  const handleFixedQuestions = async () => {
    if (showQuestionCountInput) {
      // User has selected question count, analyze weakness and start the quiz
      if (!user) {
        alert('Please log in to use this feature');
        return;
      }

      if (questionCount <= 0 || questionCount > 100) {
        alert('Please enter a valid question count (1-100)');
        return;
      }

      setIsGeneratingQuiz(true);
      try {
        // Step 1-4: Analyze weakness and fetch targeted questions
        const result = await weaknessAnalysisService.generateTargetedQuiz(user.id, questionCount);

        if (!result || result.questions.length === 0) {
          alert('Unable to generate targeted quiz. Please ensure you have at least 5 attempts on a skill.');
          setIsGeneratingQuiz(false);
          return;
        }

        // Convert questions to the format expected by QuizView
        const quizQuestions = result.questions.map((q: any, index: number) => {
          // Map correct_answer from A/B/C/D to 0/1/2/3
          let correctAnswerIndex = 0;
          if (q.correct_answer === 'A' || q.correct_answer === 'a') correctAnswerIndex = 0;
          else if (q.correct_answer === 'B' || q.correct_answer === 'b') correctAnswerIndex = 1;
          else if (q.correct_answer === 'C' || q.correct_answer === 'c') correctAnswerIndex = 2;
          else if (q.correct_answer === 'D' || q.correct_answer === 'd') correctAnswerIndex = 3;

          return {
            id: q.id || index + 1,
            question: q.question_text || q.question || '',
            options: [
              q.option_a || '',
              q.option_b || '',
              q.option_c || '',
              q.option_d || '',
            ].filter(Boolean),
            correctAnswer: correctAnswerIndex,
            explanation: q.correct_rationale || '',
            topic: q.skill || result.weakestSkill,
            subject: result.subject === 'math' ? 'math' : 'english',
            difficulty: (q.difficulty || result.nextDifficulty).toLowerCase(),
            question_prompt: q.question_prompt,
            image: q.image,
          };
        });

        // Navigate to quiz with pre-selected questions
        navigate('/quiz', {
          state: {
            mode: 'target-weakness',
            questions: quizQuestions,
            targetWeakness: {
              skill: result.weakestSkill,
              difficulty: result.nextDifficulty,
              subject: result.subject,
            },
          },
        });

        setShowPracticeDialog(false);
        setShowQuestionCountInput(false);
      } catch (error) {
        console.error('Error generating targeted quiz:', error);
        alert('An error occurred while generating your targeted quiz. Please try again.');
      } finally {
        setIsGeneratingQuiz(false);
      }
    } else {
      // Show question count input
      setShowQuestionCountInput(true);
    }
  };

  return (
    <div className="w-full">
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Target My Weakness</CardTitle>
            <Button 
              onClick={handleLaunch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Practice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <p className="text-gray-600 text-sm mb-3">
            Focused practice on your weakest areas identified by AI.
          </p>

          {/* Glass Component - Top Weak Skills */}
          {topWeakSkills.length > 0 && (
            <button
              onClick={handleWeakSkillsClick}
              className="w-full p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs font-semibold text-gray-700">Top Weak Skills</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {topWeakSkills.map((skill, index) => (
                  <span key={skill.topic}>
                    {skill.topic}
                    {index < topWeakSkills.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Practice Mode Dialog */}
      <Dialog open={showPracticeDialog} onOpenChange={(open) => {
        setShowPracticeDialog(open);
        if (!open) {
          setShowQuestionCountInput(false);
          setQuestionCount(10);
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Choose Practice Mode</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              How would you like to practice your weak skills?
            </DialogDescription>
          </DialogHeader>
          {!showQuestionCountInput ? (
            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={handleStartMarathon}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 transition-all shadow-sm hover:shadow-md border-2 border-blue-600 hover:border-blue-700"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base mb-0.5">Start Marathon</div>
                  <div className="text-sm font-normal opacity-90">Unlimited practice on weak skills</div>
                </div>
              </button>
              <button
                onClick={handleFixedQuestions}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl p-5 flex items-center gap-4 transition-all shadow-sm hover:shadow-md border-2 border-gray-200 hover:border-gray-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base mb-0.5">Fixed Questions</div>
                  <div className="text-sm font-normal text-gray-600">Practice a fixed number of questions</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-5">
              <div>
                <Label htmlFor="questionCount" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Number of Questions
                </Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0 && value <= 100) {
                      setQuestionCount(value);
                    }
                  }}
                  className="w-full h-11 text-base"
                  placeholder="Enter number"
                />
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Questions will be selected from: {selectedWeakSkills.slice(0, 3).join(', ')}
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  onClick={() => {
                    setShowQuestionCountInput(false);
                    setQuestionCount(10);
                  }}
                  variant="outline"
                  className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFixedQuestions}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={questionCount <= 0 || questionCount > 100 || isGeneratingQuiz}
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Start Quiz'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TargetMyWeakness;
