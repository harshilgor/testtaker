
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { Subject } from '../types/common';
import { useQuestionTopics } from '@/hooks/useQuestionTopics';
import { useQuizTopicSelection } from '@/hooks/useQuizTopicSelection';
import QuizView from './QuizView';

interface Topic {
  id: string;
  skill: string;
  domain: string;
  question_count: number;
  count: number;
}

interface QuizTopicSelectionProps {
  subject: Subject;
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
  autoSelection?: {
    subject: 'math' | 'english';
    topic: string;
    questionCount: number;
  } | null;
}

const QuizTopicSelection: React.FC<QuizTopicSelectionProps> = ({ 
  subject, 
  userName, 
  onBack, 
  onBackToDashboard,
  autoSelection 
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  const { topics, loading: topicsLoading } = useQuestionTopics(subject);
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
  } = useQuizTopicSelection(subject, topics);

  // Handle auto-selection
  useEffect(() => {
    if (autoSelection && autoSelection.subject === subject && topics.length > 0) {
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
  }, [autoSelection, subject, topics]);

  const handleStartQuiz = async (isAutoStart = false, autoQuestionCount?: number) => {
    const questionsToUse = isAutoStart && autoQuestionCount ? autoQuestionCount : questionCount;
    
    if (selectedTopics.length === 0 && !isAutoStart) {
      alert('Please select at least one topic');
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
        subject={subject}
        topics={selectedTopics.map(id => topics.find(t => t.id === id)?.skill || '').filter(Boolean)}
        userName={userName}
        onBack={handleQuizEnd}
        onBackToDashboard={onBackToDashboard}
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
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 md:mb-10">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4 px-4 py-2 rounded-xl min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
            {subject} Quiz Topics
          </h1>
        </div>

        {/* Auto-selection indicator */}
        {autoSelection && autoSelection.subject === subject && (
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

        <div className="grid gap-8">
          {/* Topic Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Topics</h2>
              <div className="space-y-6">
                {Object.entries(groupedTopics).map(([domain, domainTopics]) => (
                  <div key={domain}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">{domain}</h3>
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
                          className="text-xs"
                        >
                          {domainTopics.every(topic => selectedTopics.includes(topic.id)) ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {domainTopics.map(topic => (
                        <div
                          key={topic.id}
                          onClick={() => handleTopicToggle(topic.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedTopics.includes(topic.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
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
                          <p className="text-xs text-gray-500 mt-1">
                            {topic.question_count || topic.count} questions available
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h2>
              
              {/* Difficulty Selection Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Difficulty Selection</h3>
                    <p className="text-xs text-gray-500">Choose specific difficulty levels for your quiz</p>
                  </div>
                  <button
                    onClick={toggleDifficultySelection}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

              {useDifficultySelection ? (
                // Difficulty Selection Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Easy Questions
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={difficultyCounts.easy}
                        onChange={(e) => handleDifficultyCountChange('easy', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medium Questions
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={difficultyCounts.medium}
                        onChange={(e) => handleDifficultyCountChange('medium', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hard Questions
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={difficultyCounts.hard}
                        onChange={(e) => handleDifficultyCountChange('hard', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Total Questions:</strong> {getTotalQuestions()}
                    </p>
                  </div>
                </div>
              ) : (
                // Simple Question Count Mode
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={questionCount}
                      onChange={handleQuestionCountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Feedback Preference */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Preference
                </label>
                  <select
                    value={feedbackPreference}
                    onChange={(e) => setFeedbackPreference(e.target.value as 'immediate' | 'end')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Show answers immediately</option>
                    <option value="end">Show answers at the end</option>
                  </select>
                </div>
            </CardContent>
          </Card>

          {/* Start Quiz Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => handleStartQuiz()}
              disabled={selectedTopics.length === 0 || loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl min-h-[44px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Quiz ({selectedTopics.length} topics, {questionCount} questions)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTopicSelection;
