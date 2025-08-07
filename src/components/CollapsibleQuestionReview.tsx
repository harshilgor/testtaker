import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topic?: string;
  subject: string;
  difficulty: string;
}

interface CollapsibleQuestionReviewProps {
  questions: Question[];
  answers: number[];
}

const CollapsibleQuestionReview: React.FC<CollapsibleQuestionReviewProps> = ({
  questions,
  answers
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    const filteredQuestions = getFilteredQuestions();
    const allIndices = new Set(filteredQuestions.map(q => q.originalIndex));
    setExpandedQuestions(allIndices);
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const getFilteredQuestions = () => {
    return questions.map((question, index) => ({
      ...question,
      originalIndex: index,
      isCorrect: answers[index] === question.correctAnswer
    })).filter(q => !showIncorrectOnly || !q.isCorrect);
  };

  const filteredQuestions = getFilteredQuestions();
  const allExpanded = filteredQuestions.every(q => expandedQuestions.has(q.originalIndex));

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIncorrectOnly(!showIncorrectOnly)}
              className="flex items-center gap-2"
            >
              {showIncorrectOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showIncorrectOnly ? 'Show All' : 'Show Incorrect Only'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={allExpanded ? collapseAll : expandAll}
              className="flex items-center gap-2"
            >
              {allExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const isExpanded = expandedQuestions.has(question.originalIndex);
            const userAnswer = answers[question.originalIndex];
            
            return (
              <Collapsible key={question.id} open={isExpanded} onOpenChange={() => toggleQuestion(question.originalIndex)}>
                <div className={`border rounded-lg ${
                  question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            question.isCorrect 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {question.originalIndex + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Question {question.originalIndex + 1}
                            </div>
                            <div className={`text-sm font-medium ${
                              question.isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {question.isCorrect ? 'Correct' : 'Incorrect'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {question.topic && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {question.topic}
                            </span>
                          )}
                          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t bg-white rounded-b-lg">
                      <div className="pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">
                          {question.question}
                        </h3>
                        <div className="grid gap-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-3 rounded border text-sm ${
                                optionIndex === question.correctAnswer
                                  ? 'border-green-300 bg-green-100 text-green-800 font-medium'
                                  : optionIndex === userAnswer && userAnswer !== question.correctAnswer
                                    ? 'border-red-300 bg-red-100 text-red-800'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>
                                  <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}
                                </span>
                                <div className="flex items-center gap-2">
                                  {optionIndex === question.correctAnswer && (
                                    <span className="text-green-600 font-medium text-xs">✓ Correct Answer</span>
                                  )}
                                  {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                                    <span className="text-red-600 font-medium text-xs">✗ Your Answer</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {question.explanation && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                            <p className="text-sm text-blue-800">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && showIncorrectOnly && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-green-600 mb-2">🎉</div>
            <p className="font-medium">Perfect Score!</p>
            <p className="text-sm">You answered all questions correctly.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollapsibleQuestionReview;