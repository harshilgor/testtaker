
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface Topic {
  id: string;
  name: string;
  description: string;
  count: number;
  skill: string;
}

interface DomainCardProps {
  domainName: string;
  skills: Topic[];
  selectedTopics: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onTopicToggle: (topicId: string) => void;
  onSelectAll: (skills: Topic[], checked: boolean) => void;
}

const DomainCard: React.FC<DomainCardProps> = ({
  domainName,
  skills,
  selectedTopics,
  isExpanded,
  onToggle,
  onTopicToggle,
  onSelectAll
}) => {
  const { isMobile } = useResponsiveLayout();

  const isDomainFullySelected = skills.length > 0 && skills.every(skill => selectedTopics.includes(skill.id));
  const isDomainPartiallySelected = skills.some(skill => selectedTopics.includes(skill.id)) && !isDomainFullySelected;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
              <div className="text-left">
                <h3 className="font-medium text-gray-900">{domainName}</h3>
                {isMobile ? (
                  <span className="text-sm text-gray-500 block">{skills.length} questions</span>
                ) : (
                  <span className="text-sm text-gray-500">({skills.length} skills)</span>
                )}
              </div>
            </div>
            
            {skills.length > 0 && (
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`select-all-${domainName}`}
                  checked={isDomainFullySelected}
                  onCheckedChange={(checked) => onSelectAll(skills, checked as boolean)}
                  className={isDomainPartiallySelected ? 'data-[state=checked]:bg-blue-400' : ''}
                />
                <label htmlFor={`select-all-${domainName}`} className="text-sm text-gray-600 cursor-pointer">
                  Select All
                </label>
              </div>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="bg-white">
          <div className="p-4 pt-0 space-y-3">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-start space-x-3 p-3 rounded-md border border-gray-100 hover:bg-gray-50">
                <Checkbox
                  id={skill.id}
                  checked={selectedTopics.includes(skill.id)}
                  onCheckedChange={() => onTopicToggle(skill.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor={skill.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                    {skill.name} ({skill.count} questions)
                  </label>
                  <p className="text-xs text-gray-600 mt-1">{skill.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DomainCard;
