import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play } from 'lucide-react';
import { Subject } from '../pages/Index';
import QuizView from './QuizView';

interface QuizTopicSelectionProps {
  subject: Subject;
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
}

const mathTopics = [
  { id: 'algebra', name: 'Algebra', description: 'Linear equations, inequalities, systems' },
  { id: 'advanced-math', name: 'Advanced Math', description: 'Quadratic equations, exponentials, functions' },
  { id: 'data-analysis', name: 'Problem Solving & Data Analysis', description: 'Statistics, probability, graphs' },
  { id: 'geometry', name: 'Geometry & Trigonometry', description: 'Area, volume, angles, triangles' },
];

const englishTopics = [
  { id: 'information-ideas', name: 'Information and Ideas', description: 'Main ideas, inference, evidence' },
  { id: 'craft-structure', name: 'Craft and Structure', description: 'Word meaning, purpose, rhetorical strategies' },
  { id: 'expression-ideas', name: 'Expression of Ideas', description: 'Clarity, transitions, organization' },
  { id: 'conventions', name: 'Standard English Conventions', description: 'Grammar, usage, punctuation' },
];

const wrongQuestionsTopics = [
  { id: 'wrong-questions', name: 'Questions I Got Wrong', description: 'Practice questions you previously answered incorrectly' },
];

const QuizTopicSelection: React.FC<QuizTopicSelectionProps> = ({
  subject,
  userName,
  onBack,
  onBackToDashboard
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [startQuiz, setStartQuiz] = useState(false);

  const topics = subject === 'math' ? mathTopics : englishTopics;
  const allTopics = [...topics, ...wrongQuestionsTopics];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStartQuiz = () => {
    if (selectedTopics.length > 0 && questionCount > 0) {
      setStartQuiz(true);
    }
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setQuestionCount(value);
    }
  };

  const handleComplete = (results: any) => {
    console.log('Quiz completed with results:', results);
    onBackToDashboard();
  };

  if (startQuiz) {
    return (
      <QuizView
        subject={subject}
        topics={selectedTopics}
        numQuestions={questionCount}
        userName={userName}
        onBack={() => setStartQuiz(false)}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {subject === 'math' ? 'Math' : 'English'} Quiz Setup
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topics</h2>
            <div className="grid gap-4">
              {allTopics.map(topic => (
                <div key={topic.id} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={topic.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                      {topic.name}
                    </label>
                    <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="questionCount" className="block text-lg font-semibold text-gray-900 mb-4">
              Number of Questions
            </label>
            <Input
              id="questionCount"
              type="number"
              min="1"
              max="100"
              value={questionCount}
              onChange={handleQuestionCountChange}
              placeholder="Enter number of questions (1-100)"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">Enter any number between 1 and 100</p>
          </div>

          <Button
            onClick={handleStartQuiz}
            disabled={selectedTopics.length === 0 || questionCount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Quiz ({selectedTopics.length} topics, {questionCount} questions)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizTopicSelection;
