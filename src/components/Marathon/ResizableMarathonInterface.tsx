
import React, { useState } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import QuestionImage from '../QuestionImage';

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
      // In eliminate mode, toggle elimination
      const newEliminated = new Set(eliminatedOptions);
      if (newEliminated.has(answer)) {
        newEliminated.delete(answer);
      } else {
        newEliminated.add(answer);
      }
      setEliminatedOptions(newEliminated);
    } else {
      // Normal mode, select answer
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

  const isMathQuestion = question.section === 'Math';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 text-white px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="bg-blue-600 rounded px-2 md:px-3 py-1 text-xs md:text-sm font-medium">
            SAT
          </div>
          <span className="text-xs md:text-sm">
            Marathon Mode - Section {isMathQuestion ? '2' : '1'}, Module 1: {isMathQuestion ? 'Math' : 'Reading and Writing'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
          {timeRemaining && (
            <div className="flex items-center space-x-2 text-base md:text-lg font-mono">
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <span className="hidden sm:inline">Eliminate Answers</span>
            <span className="sm:hidden">Eliminate</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={setEliminateMode}
              className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1">
        {isMobile ? (
          // Mobile: Stack vertically
          <div className="h-full flex flex-col">
            {/* Question Panel - Mobile */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl">
                {/* Passage Section */}
                {!isMathQuestion && (
                  <div className="mb-6">
                    <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3">Passage</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                        {question.question_text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Question Section */}
                <div className="mb-4">
                  <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3">
                    {isMathQuestion ? 'Question' : 'Question'}
                  </h2>
                  
                  {isMathQuestion ? (
                    <div className="text-base md:text-lg leading-relaxed text-gray-900">
                      {question.question_text}
                    </div>
                  ) : (
                    <p className="text-base md:text-lg leading-relaxed text-gray-900">
                      Based on the passage, what can be inferred about Mrs. Spring Fragrance's situation?
                    </p>
                  )}

                  {/* Question image if exists */}
                  {question.image && (
                    <QuestionImage 
                      imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
                      alt="Question diagram" 
                      className="max-w-full mb-4 mt-3"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Answer Panel - Mobile */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-2 mb-3">
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

                {/* Answer options */}
                <div className="space-y-2 mb-6">
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
                        onClick={() => handleAnswerSelect(option.letter)}
                        className={`border-2 rounded-lg transition-all cursor-pointer ${
                          isEliminated
                            ? 'border-red-200 bg-red-50 opacity-50'
                            : isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        } ${answered ? 'cursor-default' : ''}`}
                      >
                        <div className="flex items-center p-3">
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-semibold flex-shrink-0 ${
                            isEliminated
                              ? 'border-red-300 bg-red-100 text-red-600'
                              : isCorrect
                              ? 'border-green-500 bg-green-500 text-white'
                              : isIncorrect
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}>
                            {option.letter}
                          </div>
                          
                          <div className={`flex-1 text-gray-900 leading-relaxed text-sm md:text-base ${
                            isEliminated ? 'line-through text-gray-500' : ''
                          }`}>
                            {option.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show feedback if answered */}
                {showFeedback && (
                  <div className={`p-3 rounded-lg mb-4 ${
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
        ) : (
          // Desktop: Resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Passage and Question */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-y-auto p-8">
                <div className="max-w-3xl">
                  {/* Passage Section */}
                  {!isMathQuestion && (
                    <div className="mb-8">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Passage</h2>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {question.question_text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Question Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      {isMathQuestion ? 'Question' : 'Question'}
                    </h2>
                    
                    {isMathQuestion ? (
                      <div className="text-lg leading-relaxed text-gray-900">
                        {question.question_text}
                      </div>
                    ) : (
                      <p className="text-lg leading-relaxed text-gray-900">
                        Based on the passage, what can be inferred about Mrs. Spring Fragrance's situation?
                      </p>
                    )}

                    {/* Question image if exists */}
                    {question.image && (
                      <QuestionImage 
                        imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
                        alt="Question diagram" 
                        className="max-w-full mb-6 mt-4"
                      />
                    )}
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Answer Choices */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-y-auto p-8">
                <div className="max-w-2xl">
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

                  <div className="text-sm text-gray-600 mb-6">
                    Choose the best answer.
                  </div>

                  {/* Answer options */}
                  <div className="space-y-3 mb-8">
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
                          onClick={() => handleAnswerSelect(option.letter)}
                          className={`border-2 rounded-lg transition-all cursor-pointer ${
                            isEliminated
                              ? 'border-red-200 bg-red-50 opacity-50'
                              : isCorrect
                              ? 'border-green-500 bg-green-50'
                              : isIncorrect
                              ? 'border-red-500 bg-red-50'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          } ${answered ? 'cursor-default' : ''}`}
                        >
                          <div className="flex items-center p-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                              isEliminated
                                ? 'border-red-300 bg-red-100 text-red-600'
                                : isCorrect
                                ? 'border-green-500 bg-green-500 text-white'
                                : isIncorrect
                                ? 'border-red-500 bg-red-500 text-white'
                                : isSelected
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700'
                            }`}>
                              {option.letter}
                            </div>
                            
                            <div className={`flex-1 text-gray-900 leading-relaxed ${
                              isEliminated ? 'line-through text-gray-500' : ''
                            }`}>
                              {option.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show feedback if answered */}
                  {showFeedback && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      selectedAnswer === question.correct_answer 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className={`font-medium mb-2 ${
                        selectedAnswer === question.correct_answer 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {selectedAnswer === question.correct_answer ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div className="text-gray-700 text-sm">
                        <strong>Explanation:</strong> {question.correct_rationale}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="text-xs md:text-sm text-gray-600">
          Questions Solved: {currentQuestionNumber - 1}
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="bg-gray-800 text-white hover:bg-gray-700 px-2 md:px-4 py-2 rounded flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
          >
            <span>Question {currentQuestionNumber} of {totalQuestions}</span>
            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2 md:space-x-3">
          <Button
            onClick={onEndMarathon}
            variant="outline"
            className="px-2 md:px-4 py-2 text-xs md:text-sm"
          >
            <span className="hidden sm:inline">Exit Marathon Mode</span>
            <span className="sm:hidden">Exit</span>
          </Button>

          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 rounded text-xs md:text-sm"
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 rounded text-xs md:text-sm"
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
