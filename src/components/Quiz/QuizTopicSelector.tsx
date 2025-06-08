
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface Topic {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface QuizTopicSelectorProps {
  topics: Topic[];
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  subject: string;
  loading: boolean;
}

const QuizTopicSelector: React.FC<QuizTopicSelectorProps> = ({
  topics,
  selectedTopics,
  onTopicToggle,
  subject,
  loading
}) => {
  const wrongQuestionsTopics = [
    { id: 'wrong-questions', name: 'Questions I Got Wrong', description: 'Practice questions you previously answered incorrectly', count: 0 },
  ];

  const allTopics = [...topics, ...wrongQuestionsTopics];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading available topics...</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topics</h2>
      <div className="grid gap-4">
        {allTopics.map(topic => (
          <div key={topic.id} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
            <Checkbox
              id={topic.id}
              checked={selectedTopics.includes(topic.id)}
              onCheckedChange={() => onTopicToggle(topic.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor={topic.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                {topic.name} ({topic.count} questions)
              </label>
              <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {topics.length === 0 && (
        <p className="text-gray-500 text-center py-4">No topics available for {subject}</p>
      )}
    </div>
  );
};

export default QuizTopicSelector;
