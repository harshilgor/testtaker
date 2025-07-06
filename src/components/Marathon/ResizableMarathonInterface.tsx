import React, { useState } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';
import QuestionImage from '../QuestionImage';
import QuestionInfoTooltip from './QuestionInfoTooltip';

interface ResizableMarathonInterfaceProps {
  question: DatabaseQuestion;
  currentQuestionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
  onAnswer: (answer: string, showAnswerUsed?: boolean) => void;
  onNext: () => void;
  onFlag: () => void;
  onEndMarathon: () => void;
}

const ResizableMarathonInterface: React.FC<ResizableMarathonInterfaceProps> = ({
  question,
  currentQuestionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  onNext,
  onFlag,
  onEndMarathon
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(false);
  const [eliminateMode, setEliminateMode] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;

    if (eliminateMode) {
      const newEliminated = new Set(eliminatedOptions);
      if (newEliminated.has(answer)) {
        newEliminated.delete(answer);
      } else {
        newEliminated.add(answer);
      }
      setEliminatedOptions(newEliminated);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setAnswered(true);
    setShowFeedback(true);
    onAnswer(selectedAnswer);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setAnswered(false);
    setShowFeedback(false);
    setMarkedForReview(false);
    setEliminatedOptions(new Set());
    onNext();
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Simplified */}
      <div className="bg-slate-800 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-600 rounded px-3 py-1 text-sm font-medium">
            MARATHON
          </div>
          <span className="text-sm font-medium">Marathon Mode</span>
          <QuestionInfoTooltip question={question} />
        </div>
        
        <div className="flex items-center space-x-4">
          {timeRemaining && (
            <div className="text-base font-mono">
              {formatTimeRemaining(timeRemaining)}
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="hidden sm:inline">Eliminate</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={setEliminateMode}
              className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
            />
          </div>
          
          <Button
            onClick={onEndMarathon}
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-xs px-3 py-1"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content Area - Split Screen Layout */}
      <div className="flex-1 flex flex-col">
        {/* Question Panel - Top Half */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-base md:text-lg leading-relaxed text-gray-900 mb-4">
              {question.question_text}
            </div>

            {/* Question image if exists */}
            {question.image && (
              <QuestionImage 
                imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
                alt="Question diagram" 
                className="max-w-full mb-4 rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Answer Panel - Bottom Half, Fixed Position */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="mark-review"
                checked={markedForReview}
                onCheckedChange={(checked) => setMarkedForReview(checked === true)}
              />
              <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
                Mark for Review
              </label>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Choose the best answer.
            </div>

            {/* Answer options - Keep existing design, add elimination features */}
            <div className="space-y-3 mb-6">
              {[
                { letter: 'A', text: question.option_a },
                { letter: 'B', text: question.option_b },
                { letter: 'C', text: question.option_c },
                { letter: 'D', text: question.option_d }
              ].map((option) => {
                const isSelected = selectedAnswer === option.letter;
                const isEliminated = eliminatedOptions.has(option.letter);
                const isCorrect = showFeedback && option.letter === question.correct_answer;
                const isIncorrect = showFeedback && isSelected && option.letter !== question.correct_answer;

                return (
                  <div
                    key={option.letter}
                    onClick={() => !eliminateMode && handleAnswerSelect(option.letter)}
                    className={`border-2 rounded-xl transition-all mx-2 relative ${
                      isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    } ${answered || eliminateMode ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center p-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                        isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isIncorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}>
                        {option.letter}
                      </div>
                      
                      <div className={`flex-1 text-gray-900 leading-relaxed text-sm md:text-base pr-2 ${
                        isEliminated ? 'line-through' : ''
                      }`}>
                        {option.text}
                      </div>

                      {/* Elimination X button */}
                      {eliminateMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnswerSelect(option.letter);
                          }}
                          className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show feedback if answered */}
            {showFeedback && (
              <div className={`p-4 rounded-xl mb-4 mx-2 ${
                selectedAnswer === question.correct_answer 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium mb-2 text-sm ${
                  selectedAnswer === question.correct_answer 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {selectedAnswer === question.correct_answer ? 'Correct!' : 'Incorrect'}
                </div>
                <div className="text-gray-700 text-xs">
                  <strong>Explanation:</strong> {question.correct_rationale}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Simplified */}
      <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Questions Solved: {answered ? currentQuestionNumber : currentQuestionNumber - 1}
        </div>
        
        <div className="flex space-x-3">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]"
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResizableMarathonInterface;
