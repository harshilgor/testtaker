import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Eye,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MockTestConfig, SatSectionId } from './SAT/mockTestConfig';

type ModuleDifficultyPath = 'baseline' | 'easy' | 'hard';

interface TestAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  flagged: boolean;
}

interface ReviewQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: SatSectionId;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  module?: number;
}

interface ModuleHistoryEntry {
  sectionId: SatSectionId;
  module: number;
  questionIds: string[];
  difficultyPath: ModuleDifficultyPath;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
}

interface TopicSummary {
  topic: string;
  sectionId: SatSectionId;
  correct: number;
  total: number;
  accuracy: number;
}

interface SectionSummary {
  section: MockTestConfig['sections'][number];
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  score: number;
  timeSpentSeconds: number;
  modules: ModuleHistoryEntry[];
}

interface SATMockTestResultsProps {
  config: MockTestConfig;
  answers: Map<string, TestAnswer>;
  questions: ReviewQuestion[];
  moduleHistory: ModuleHistoryEntry[];
  totalTimeSpent: number;
  onRetakeTest: () => void;
  onBackToHome: () => void;
}

const difficultyPathLabel: Record<ModuleDifficultyPath, string> = {
  baseline: 'Module 1',
  easy: 'Module 2 • Standard Path',
  hard: 'Module 2 • Advanced Path'
};

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

const mapAccuracyToScore = (accuracy: number, maxScore: number) => {
  const clamp = Math.min(Math.max(accuracy, 0), 1);
  let scaled: number;
  if (clamp >= 0.9) {
    scaled = 750 + ((clamp - 0.9) / 0.1) * 50;
  } else if (clamp >= 0.8) {
    scaled = 700 + ((clamp - 0.8) / 0.1) * 40;
  } else if (clamp >= 0.7) {
    scaled = 650 + ((clamp - 0.7) / 0.1) * 40;
  } else if (clamp >= 0.6) {
    scaled = 600 + ((clamp - 0.6) / 0.1) * 40;
  } else {
    // Below 60%, scale downwards toward 400
    scaled = 400 + (clamp / 0.6) * 200;
  }

  const normalized = (scaled / 800) * maxScore;
  return Math.round(Math.min(maxScore, Math.max(0, normalized)));
};

const sectionLabel = (sectionId: SatSectionId) =>
  sectionId === 'math' ? 'Math' : 'Reading & Writing';

const SATMockTestResults: React.FC<SATMockTestResultsProps> = ({
  config,
  answers,
  questions,
  moduleHistory,
  totalTimeSpent,
  onRetakeTest,
  onBackToHome
}) => {
  const [showReview, setShowReview] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  const navigate = useNavigate();

  const sectionSummaries: SectionSummary[] = useMemo(() => {
    return config.sections.map((section) => {
      const sectionQuestions = questions.filter(
        (question) => question.section === section.id
      );
      const correctCount = sectionQuestions.filter((question) => {
        const answer = answers.get(question.id);
        return answer?.isCorrect;
      }).length;
      const totalQuestions = sectionQuestions.length;
      const accuracy =
        totalQuestions > 0 ? correctCount / totalQuestions : 0;
      const modules = moduleHistory
        .filter((entry) => entry.sectionId === section.id)
        .sort((a, b) => a.module - b.module);
      const timeSpentSeconds = modules.reduce(
        (sum, entry) => sum + entry.timeSpentSeconds,
        0
      );

      return {
        section,
        correctCount,
        totalQuestions,
        accuracy,
        score: mapAccuracyToScore(accuracy, section.maxSectionScore),
        timeSpentSeconds,
        modules
      };
    });
  }, [answers, config.sections, moduleHistory, questions]);

  const totalCorrect = sectionSummaries.reduce(
    (sum, section) => sum + section.correctCount,
    0
  );
  const totalQuestions = sectionSummaries.reduce(
    (sum, section) => sum + section.totalQuestions,
    0
  );

  const overallAccuracy =
    totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
  const totalScore = Math.min(
    config.totalScore,
    sectionSummaries.reduce((sum, section) => sum + section.score, 0)
  );

  const topicSummaries: TopicSummary[] = useMemo(() => {
    const map = new Map<string, TopicSummary>();

    questions.forEach((question) => {
      const key = `${question.section}::${question.topic}`;
      const existing = map.get(key) || {
        topic: question.topic,
        sectionId: question.section,
        correct: 0,
        total: 0,
        accuracy: 0
      };
      existing.total += 1;
      if (answers.get(question.id)?.isCorrect) {
        existing.correct += 1;
      }
      existing.accuracy =
        existing.total > 0 ? existing.correct / existing.total : 0;
      map.set(key, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.accuracy - a.accuracy
    );
  }, [answers, questions]);

  const strongTopics = topicSummaries
    .filter((topic) => topic.accuracy >= 0.75)
    .slice(0, 3);
  const weakTopics = topicSummaries
    .filter((topic) => topic.accuracy < 0.6)
    .slice(0, 3);
  const primaryWeakTopic =
    weakTopics[0] ||
    (topicSummaries.length > 0
      ? topicSummaries[topicSummaries.length - 1]
      : undefined);

  useEffect(() => {
    const persistResults = async () => {
      if (resultsSaved) return;
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth.user;
        if (!user) return;

        const mathScore =
          sectionSummaries.find((s) => s.section.id === 'math')?.score ??
          null;
        const englishScore =
          sectionSummaries.find(
            (s) => s.section.id === 'reading-writing'
          )?.score ?? null;

        const { error } = await supabase.from('mock_test_results').insert({
          user_id: user.id,
          math_score: mathScore,
          english_score: englishScore,
          total_score: totalScore,
          time_taken: totalTimeSpent,
          test_type: config.id,
          detailed_results: {
            modules: moduleHistory,
            answers: Object.fromEntries(answers),
            questions: questions.map((question) => ({
              id: question.id,
              topic: question.topic,
              section: question.section,
              difficulty: question.difficulty
            }))
          }
        });

        if (error) {
          console.error('Error saving mock test results:', error);
        } else {
          setResultsSaved(true);
        }
      } catch (error) {
        console.error('Failed to persist mock test results:', error);
      }
    };

    persistResults();
  }, [
    answers,
    config.id,
    moduleHistory,
    questions,
    resultsSaved,
    sectionSummaries,
    totalScore,
    totalTimeSpent
  ]);

  const handleTargetWeakness = () => {
    if (primaryWeakTopic) {
      const subject =
        primaryWeakTopic.sectionId === 'math' ? 'math' : 'english';
      localStorage.setItem(
        'selectedQuizTopic',
        JSON.stringify({
          subject,
          topic: primaryWeakTopic.topic,
          questionCount: 10
        })
      );
    }
    navigate('/quiz');
  };

  const handleViewHistory = () => {
    navigate('/sat-mock-test');
  };

  if (showReview) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowReview(false)}
            >
              ← Back to Results
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Question Review
            </h1>
          </div>

          {questions.map((question, index) => {
            const userAnswer = answers.get(question.id);
            const isCorrect = userAnswer?.isCorrect ?? false;
            return (
              <Card
                key={question.id}
                className="border border-gray-200 shadow-sm"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        Q{index + 1}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full ${
                          question.section === 'math'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {sectionLabel(question.section)}
                      </span>
                      <span className="text-gray-500">
                        {question.topic}
                      </span>
                      {question.difficulty && (
                        <span className="uppercase text-xs text-gray-400 tracking-wide">
                          {question.difficulty}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-lg text-gray-900 leading-relaxed">
                    {question.content}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isOptionCorrect =
                        optionIndex === question.correctAnswer;
                      const isOptionSelected =
                        optionIndex === userAnswer?.selectedAnswer;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 border rounded-lg text-sm ${
                            isOptionCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : isOptionSelected && !isCorrect
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-semibold mr-2">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {isOptionCorrect && (
                            <span className="ml-2 text-emerald-600 font-medium">
                              Correct Answer
                            </span>
                          )}
                          {isOptionSelected && !isCorrect && (
                            <span className="ml-2 text-rose-600 font-medium">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <h4 className="font-semibold mb-2">Explanation</h4>
                    <p>{question.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            SAT Mock Test Results
          </h1>
          <p className="text-gray-600">
            {config.title} • Completed on {new Date().toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {config.sections.length} section
            {config.sections.length > 1 ? 's' : ''} •{' '}
            {config.sections
              .map((section) => `${section.moduleCount} modules`)
              .join(' • ')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Overall Score
              </h3>
              <div className="text-4xl font-semibold text-gray-900">
                {totalScore}
              </div>
              <p className="text-xs text-gray-500">
                out of {config.totalScore} points
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Accuracy
              </h3>
              <div className="text-4xl font-semibold text-gray-900">
                {Math.round(overallAccuracy * 100)}%
              </div>
              <p className="text-xs text-gray-500">
                {totalCorrect} of {totalQuestions} questions correct
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Total Time
              </h3>
              <div className="text-4xl font-semibold text-gray-900">
                {formatDuration(totalTimeSpent)}
              </div>
              <p className="text-xs text-gray-500">
                across all modules
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {sectionSummaries.map((summary) => (
            <Card
              key={summary.section.id}
              className="border border-gray-200 shadow-sm"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {summary.section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {summary.correctCount}/{summary.totalQuestions}{' '}
                      correct • {Math.round(summary.accuracy * 100)}%{' '}
                      accuracy
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">
                      {summary.score}
                    </div>
                    <p className="text-xs text-gray-500">
                      out of {summary.section.maxSectionScore}
                    </p>
                  </div>
                </div>

                <div className=" bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                  {summary.modules.map((module) => (
                    <div
                      key={`${module.sectionId}-${module.module}`}
                      className="flex items-center justify-between text-gray-700"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {difficultyPathLabel[module.difficultyPath]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {module.correctCount}/{module.totalQuestions}{' '}
                          correct
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {Math.round(module.accuracy * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDuration(module.timeSpentSeconds)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Strong Areas
                </h3>
              </div>
              {strongTopics.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {strongTopics.map((topic) => (
                    <li
                      key={`${topic.sectionId}-${topic.topic}`}
                      className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-emerald-900">
                          {sectionLabel(topic.sectionId)} • {topic.topic}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {topic.correct}/{topic.total} correct
                        </p>
                      </div>
                      <span className="text-emerald-600 font-semibold">
                        {Math.round(topic.accuracy * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Complete more mock tests to identify your strongest
                  areas.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Focus Areas
                </h3>
              </div>
              {weakTopics.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {weakTopics.map((topic) => (
                    <li
                      key={`${topic.sectionId}-${topic.topic}`}
                      className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-rose-900">
                          {sectionLabel(topic.sectionId)} • {topic.topic}
                        </p>
                        <p className="text-xs text-rose-700">
                          {topic.correct}/{topic.total} correct
                        </p>
                      </div>
                      <span className="text-rose-600 font-semibold">
                        {Math.round(topic.accuracy * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Great job! No major weak areas detected in this attempt.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Insights
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li>
                You answered {totalCorrect} of {totalQuestions} questions
                correctly ({Math.round(overallAccuracy * 100)}% accuracy).
              </li>
              <li>
                Time spent: {formatDuration(totalTimeSpent)} across{' '}
                {config.sections.length} section
                {config.sections.length > 1 ? 's' : ''}. Keep pacing
                consistent to match official timing.
              </li>
              {primaryWeakTopic && (
                <li>
                  Focus on{' '}
                  {sectionLabel(primaryWeakTopic.sectionId)} •{' '}
                  {primaryWeakTopic.topic}. Tailored practice will help
                  strengthen this area.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowReview(true)}
          >
            <Eye className="h-4 w-4" />
            Review Questions
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onRetakeTest}
          >
            <RefreshCw className="h-4 w-4" />
            Retake Mock Test
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleTargetWeakness}
          >
            <Target className="h-4 w-4" />
            Target My Weakness
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleViewHistory}
          >
            <Clock className="h-4 w-4" />
            View Past Mock Tests
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onBackToHome}
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SATMockTestResults;

