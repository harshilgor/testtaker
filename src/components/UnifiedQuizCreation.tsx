// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { Subject } from '../types/common';
import { useQuestionTopics } from '@/hooks/useQuestionTopics';
import { useQuizTopicSelection } from '@/hooks/useQuizTopicSelection';
import QuizView from './QuizView';
import { useAutoTopicSelection } from '@/hooks/useAutoTopicSelection';
import PracticeSectionCard from './PracticeSectionCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Topic {
  id: string;
  skill: string;
  domain: string;
  question_count: number;
  count: number;
}

interface UnifiedQuizCreationProps {
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
  onTakeSimilarQuiz?: () => void;
}

const UnifiedQuizCreation: React.FC<UnifiedQuizCreationProps> = ({ 
  userName, 
  onBack, 
  onBackToDashboard,
  onTakeSimilarQuiz
}) => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'english' | 'both'>('english');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [marathonMode, setMarathonMode] = useState(false);
  const [adaptiveLearning, setAdaptiveLearning] = useState(false);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const { autoSelection, clearAutoSelection } = useAutoTopicSelection();
  
  const { topics, loading: topicsLoading } = useQuestionTopics(selectedSubject);

  // Fetch user attempts to calculate accuracy
  useEffect(() => {
    const loadAttempts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('question_attempts_v2')
          .select('topic, is_correct')
          .eq('user_id', user.id)
          .limit(5000);

        if (!error && data) {
          setUserAttempts(data);
        }
      } catch (error) {
        console.error('Error loading attempts:', error);
      }
    };
    loadAttempts();
  }, [user]);

  // Calculate accuracy for each skill
  const skillAccuracy = useMemo(() => {
    const accuracyMap = new Map<string, { totalAttempts: number; correctAttempts: number }>();
    
    userAttempts.forEach(attempt => {
      const skill = attempt.topic || '';
      if (!skill) return;
      
      const current = accuracyMap.get(skill) || { totalAttempts: 0, correctAttempts: 0 };
      current.totalAttempts++;
      if (attempt.is_correct) {
        current.correctAttempts++;
      }
      accuracyMap.set(skill, current);
    });
    
    // Calculate final accuracy percentages
    const result = new Map<string, { accuracy: number; totalAttempts: number }>();
    accuracyMap.forEach((value, skill) => {
      const accuracy = value.totalAttempts > 0 
        ? Math.round((value.correctAttempts / value.totalAttempts) * 100) 
        : 0;
      result.set(skill, { accuracy, totalAttempts: value.totalAttempts });
    });
    
    return result;
  }, [userAttempts]);
  const {
    selectedTopics,
    questionCount,
    feedbackPreference,
    loading,
    setFeedbackPreference,
    handleTopicToggle,
    handleQuestionCountChange,
    loadQuizQuestions,
    // Difficulty selection
    difficultyCounts,
    useDifficultySelection,
    handleDifficultyCountChange,
    toggleDifficultySelection,
    getTotalQuestions
  } = useQuizTopicSelection(selectedSubject, topics);

  // Handle auto-selection
  useEffect(() => {
    if (autoSelection && topics.length > 0) {
      // Set the subject from auto selection
      if (autoSelection.subject === 'math' || autoSelection.subject === 'english') {
        setSelectedSubject(autoSelection.subject);
        
        // Find the topic that matches the auto-selection
        const matchingTopic = topics.find(topic => topic.skill === autoSelection.topic);
        if (matchingTopic) {
          // Auto-select the topic and start the quiz
          handleTopicToggle(matchingTopic.id);
          
          // Auto-start the quiz after a brief delay
          setTimeout(() => {
            handleStartQuiz(true, autoSelection.questionCount);
          }, 500);
        }
      }
    }
  }, [autoSelection, topics]);

  const handleSubjectToggle = (subject: Subject) => {
    setSelectedSubject(subject);
    clearAutoSelection(); // Clear any pending auto selection when manually changing subject
  };

  const handleStartQuiz = async (isAutoStart = false, autoQuestionCount?: number) => {
    const questionsToUse = isAutoStart && autoQuestionCount ? autoQuestionCount : (useDifficultySelection ? getTotalQuestions() : questionCount);
    
    if (selectedTopics.length === 0 && !isAutoStart) {
      alert('Please select at least one topic');
      return;
    }
    
    // Check if difficulty selection is enabled but no questions are selected
    if (useDifficultySelection && getTotalQuestions() === 0) {
      alert('Please select at least one question for any difficulty level');
      return;
    }
    
    const questions = await loadQuizQuestions();
    if (questions.length === 0) {
      alert('No questions available for selected topics');
      return;
    }
    
    console.log(`📊 Questions loaded: ${questions.length}, Questions to use: ${questionsToUse}`);
    
    // Don't slice if we already have the right number of questions
    const finalQuestions = questions.length >= questionsToUse ? questions.slice(0, questionsToUse) : questions;
    console.log(`📊 Final questions for quiz: ${finalQuestions.length}`);
    
    setQuizQuestions(finalQuestions);
    setShowQuiz(true);
  };

  const handleQuizEnd = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
  };

  if (showQuiz && quizQuestions.length > 0) {
    return (
      <QuizView
        questions={quizQuestions}
        subject={selectedSubject}
        topics={selectedTopics.map(id => topics.find(t => t.id === id)?.skill || '').filter(Boolean)}
        userName={userName}
        onBack={handleQuizEnd}
        onBackToDashboard={onBackToDashboard}
        onTakeSimilarQuiz={onTakeSimilarQuiz}
        feedbackPreference={feedbackPreference}
        selectedTopics={selectedTopics}
      />
    );
  }

  if (topicsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group topics by domain with proper typing
  const groupedTopics: Record<string, Topic[]> = topics.reduce((acc, topic) => {
    const domain = topic.domain || 'General';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center mr-4 px-4 py-2 rounded-xl min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Quiz</h1>
          </div>
          
          {/* Subject Toggle - Same line as Create Quiz */}
          <div className="bg-gray-100 rounded-xl p-1 flex shadow-sm items-center gap-2">
            <button
              onClick={() => handleSubjectToggle('english')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedSubject === 'english'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Reading and Writing
            </button>
            <button
              onClick={() => handleSubjectToggle('math')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedSubject === 'math'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Math
            </button>
          </div>
        </div>


        {/* Auto-selection indicator */}
        {autoSelection && autoSelection.subject === selectedSubject && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center text-blue-800">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Auto-selecting "{autoSelection.topic}" for practice session ({autoSelection.questionCount} questions)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              {/* Left Column: Settings + Start */}
              <div className="space-y-6 lg:order-1 lg:sticky lg:top-20 self-start">
              {/* Quiz Settings */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Quiz settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4">
                    Customize your quiz experience with personalized settings.
                  </p>

                  {/* Question Count */}
                  {!useDifficultySelection && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={questionCount}
                        onChange={handleQuestionCountChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  )}

                  {/* Difficulty Selection Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Difficulty selection</p>
                        <p className="text-xs text-gray-500 mt-0.5">Choose specific difficulty levels</p>
                      </div>
                      <button
                        onClick={toggleDifficultySelection}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          useDifficultySelection ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useDifficultySelection ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {useDifficultySelection && (
                    <div className="mb-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Easy
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={difficultyCounts.easy}
                            onChange={(e) => handleDifficultyCountChange('easy', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Medium
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={difficultyCounts.medium}
                            onChange={(e) => handleDifficultyCountChange('medium', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Hard
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={difficultyCounts.hard}
                            onChange={(e) => handleDifficultyCountChange('hard', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <p className="text-xs text-blue-800">
                          Total: <span className="font-medium">{getTotalQuestions()}</span> questions
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Marathon Mode Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Marathon mode</p>
                        <p className="text-xs text-gray-500 mt-0.5">Unlimited continuous practice</p>
                      </div>
                      <button
                        onClick={() => setMarathonMode(!marathonMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          marathonMode ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            marathonMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Subject Focus - Only show when Marathon Mode is enabled */}
                  {marathonMode && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Subject focus</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div
                          onClick={() => setSelectedSubject('math')}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedSubject === 'math'
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`text-xs font-medium ${
                              selectedSubject === 'math' ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              Math
                            </p>
                          </div>
                        </div>
                        <div
                          onClick={() => setSelectedSubject('english')}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedSubject === 'english'
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`text-xs font-medium ${
                              selectedSubject === 'english' ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              English
                            </p>
                          </div>
                        </div>
                        <div
                          onClick={() => setSelectedSubject('both')}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedSubject === 'both'
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`text-xs font-medium ${
                              selectedSubject === 'both' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              Both
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adaptive Learning Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Adaptive learning</p>
                        <p className="text-xs text-gray-500 mt-0.5">AI adjusts difficulty automatically</p>
                      </div>
                      <button
                        onClick={() => setAdaptiveLearning(!adaptiveLearning)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          adaptiveLearning ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            adaptiveLearning ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Feedback Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback preference
                    </label>
                    <select
                      value={feedbackPreference}
                      onChange={(e) => setFeedbackPreference(e.target.value as 'immediate' | 'end')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="immediate">Show answers immediately</option>
                      <option value="end">Show answers at the end</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

            {/* Start Quiz Button */}
            <div className="flex justify-center lg:justify-stretch">
              <Button
                onClick={() => handleStartQuiz()}
                disabled={selectedTopics.length === 0 || loading}
                className={`w-full px-8 py-3 font-medium rounded-xl min-h-[44px] ${
                  marathonMode 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : adaptiveLearning
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {marathonMode ? 'Start Marathon' : adaptiveLearning ? 'Start Adaptive Quiz' : 'Start Quiz'} ({selectedTopics.length} topics, {useDifficultySelection ? getTotalQuestions() : questionCount} questions)
              </Button>
            </div>
          </div>

          {/* Right Column: Practice Section Cards + Topic Selection */}
          <div className="lg:order-2 space-y-6">
            {/* Practice Section Cards - Above Select Topics */}
            {selectedSubject === 'english' || selectedSubject === 'both' ? (
              <PracticeSectionCard section="reading-writing" />
            ) : null}
            {selectedSubject === 'math' || selectedSubject === 'both' ? (
              <PracticeSectionCard section="math" />
            ) : null}

            <Card className="rounded-2xl border border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">Select topics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Choose the topics you want to practice.
                </p>
                <div className="space-y-6">
                  {Object.entries(groupedTopics).map(([domain, domainTopics]) => (
                    <div key={domain}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-800">{domain}</h3>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              const allSelected = domainTopics.every(topic => selectedTopics.includes(topic.id));
                              domainTopics.forEach(topic => {
                                if (allSelected && selectedTopics.includes(topic.id)) {
                                  handleTopicToggle(topic.id);
                                } else if (!allSelected && !selectedTopics.includes(topic.id)) {
                                  handleTopicToggle(topic.id);
                                }
                              });
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                          >
                            {domainTopics.every(topic => selectedTopics.includes(topic.id)) ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {domainTopics.map(topic => {
                          const accuracyData = skillAccuracy.get(topic.skill);
                          const hasPracticed = accuracyData && accuracyData.totalAttempts > 0;
                          const accuracy = accuracyData?.accuracy || 0;
                          
                          return (
                            <div
                              key={topic.id}
                              onClick={() => handleTopicToggle(topic.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedTopics.includes(topic.id)
                                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{topic.skill}</span>
                                <div className={`w-4 h-4 rounded border-2 ${
                                  selectedTopics.includes(topic.id)
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedTopics.includes(topic.id) && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                {hasPracticed ? (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    accuracy >= 80
                                      ? 'bg-green-100 text-green-700 border border-green-200'
                                      : accuracy >= 60
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      : 'bg-red-100 text-red-700 border border-red-200'
                                  }`}>
                                    {accuracy}% accuracy
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    Yet to be practiced
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedQuizCreation;
