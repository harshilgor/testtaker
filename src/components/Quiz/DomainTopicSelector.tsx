
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import DomainCard from './DomainCard';

interface Topic {
  id: string;
  name: string;
  description: string;
  count: number;
  skill: string;
}

interface DomainGroup {
  name: string;
  skills: Topic[];
}

interface DomainTopicSelectorProps {
  topics: Topic[];
  selectedTopics: string[];
  onTopicToggle: (topicId: string) => void;
  subject: string;
  loading: boolean;
}

const DomainTopicSelector: React.FC<DomainTopicSelectorProps> = ({
  topics,
  selectedTopics,
  onTopicToggle,
  subject,
  loading
}) => {
  const { isMobile } = useResponsiveLayout();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [domainGroups, setDomainGroups] = useState<DomainGroup[]>([]);

  const mathDomains = {
    'Heart of Algebra': [
      'Linear Equations', 'Linear Functions', 'Systems of Linear Equations', 
      'Linear Inequalities', 'Solving Linear Equations', 'Linear Systems'
    ],
    'Passport to Advanced Math': [
      'Polynomial Operations', 'Quadratic Functions', 'Exponential Functions', 
      'Rational Functions', 'Radical Functions', 'Polynomials', 'Quadratics',
      'Exponents', 'Radicals', 'Functions'
    ],
    'Problem Solving and Data Analysis': [
      'Ratios and Proportions', 'Percentages', 'Data Analysis', 'Statistics', 
      'Probability', 'Sampling', 'Data Collection', 'Scatterplots', 'Two-way Tables'
    ],
    'Additional Topics in Math': [
      'Geometry', 'Trigonometry', 'Complex Numbers', 'Volume', 'Area',
      'Circles', 'Triangles', 'Coordinate Geometry'
    ]
  };

  const englishDomains = {
    'Reading Comprehension': [
      'Literature', 'History/Social Studies', 'Science', 'Paired Passages',
      'Reading', 'Passage Analysis', 'Main Ideas', 'Supporting Details'
    ],
    'Writing and Language': [
      'Grammar', 'Punctuation', 'Sentence Structure', 'Word Choice', 
      'Style and Tone', 'Writing', 'Language', 'Editing'
    ],
    'Vocabulary and Context': [
      'Context Clues', 'Word Meanings', 'Rhetoric', 'Vocabulary',
      'Word in Context', 'Figurative Language'
    ]
  };

  useEffect(() => {
    const domainMappings = subject === 'math' ? mathDomains : englishDomains;
    const groups: DomainGroup[] = [];
    const matchedTopics = new Set<string>();

    Object.entries(domainMappings).forEach(([domainName, skillKeywords]) => {
      const domainSkills = topics.filter(topic => {
        if (matchedTopics.has(topic.id)) return false;
        
        const isMatch = skillKeywords.some(keyword => 
          topic.skill?.toLowerCase().includes(keyword.toLowerCase()) ||
          topic.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(topic.skill?.toLowerCase() || '') ||
          keyword.toLowerCase().includes(topic.name?.toLowerCase() || '')
        );
        
        if (isMatch) {
          matchedTopics.add(topic.id);
          return true;
        }
        return false;
      });

      if (domainSkills.length > 0) {
        groups.push({
          name: domainName,
          skills: domainSkills
        });
      }
    });

    const unmatchedTopics = topics.filter(topic => !matchedTopics.has(topic.id));
    if (unmatchedTopics.length > 0) {
      groups.push({
        name: 'Other Topics',
        skills: unmatchedTopics
      });
    }

    setDomainGroups(groups);

    if (groups.length > 0) {
      setExpandedDomains(new Set([groups[0].name]));
    }
  }, [topics, subject]);

  const toggleDomain = (domainName: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainName)) {
      newExpanded.delete(domainName);
    } else {
      newExpanded.add(domainName);
    }
    setExpandedDomains(newExpanded);
  };

  const handleSelectAllDomain = (domainSkills: Topic[], checked: boolean) => {
    domainSkills.forEach(skill => {
      const isSelected = selectedTopics.includes(skill.id);
      if (checked && !isSelected) {
        onTopicToggle(skill.id);
      } else if (!checked && isSelected) {
        onTopicToggle(skill.id);
      }
    });
  };

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
      
      <div className="mb-4">
        <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 bg-blue-50 border-blue-200">
          <Checkbox
            id="wrong-questions"
            checked={selectedTopics.includes('wrong-questions')}
            onCheckedChange={() => onTopicToggle('wrong-questions')}
            className="mt-1"
          />
          <div className="flex-1">
            <label htmlFor="wrong-questions" className="text-sm font-medium text-gray-900 cursor-pointer">
              Questions I Got Wrong (0 questions)
            </label>
            <p className="text-xs text-gray-600 mt-1">Practice questions you previously answered incorrectly</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {domainGroups.map((domain) => (
          <DomainCard
            key={domain.name}
            domainName={domain.name}
            skills={domain.skills}
            selectedTopics={selectedTopics}
            isExpanded={expandedDomains.has(domain.name)}
            onToggle={() => toggleDomain(domain.name)}
            onTopicToggle={onTopicToggle}
            onSelectAll={handleSelectAllDomain}
          />
        ))}
      </div>
      
      {domainGroups.length === 0 && topics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No topics available for {subject}</p>
          <p className="text-sm text-gray-400 mt-2">Try refreshing the page or contact support if this persists.</p>
        </div>
      )}
    </div>
  );
};

export default DomainTopicSelector;
