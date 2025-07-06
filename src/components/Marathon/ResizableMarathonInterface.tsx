
import React, { useState } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import TopNavigation from '../shared/TopNavigation';
import QuestionDisplay from '../shared/QuestionDisplay';
import MarathonAnswerOptions from './MarathonAnswerOptions';
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
  questionsSolved?: number;
}

const ResizableMarathonInterface: React.FC<ResizableMarathonInterfaceProps> = ({
  question,
  currentQuestionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  onNext,
  onFlag,
  onEndMarathon,
  questionsSolved = 0
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(false);
  const [eliminateMode, setEliminateMode] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const { isMobile } = useResponsiveLayout();

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
  };

  const handleEliminateOption = (answer: string) => {
    const newEliminated = new Set(eliminatedOptions);
    if (newEliminated.has(answer)) {
      newEliminated.delete(answer);
    } else {
      newEliminated.add(answer);
    }
    setEliminatedOptions(newEliminated);
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

  const renderQuestionSection = () => (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <QuestionDisplay
        question={question.question_text}
        imageUrl={question.image ? `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png` : undefined}
        hasImage={question.image}
        isMobile={isMobile}
      />
    </div>
  );

  const renderAnswerSection = () => (
    <div className="h-full bg-white p-4 md:p-6 overflow-y-auto">
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

        <MarathonAnswerOptions
          question={question}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          eliminateMode={eliminateMode}
          eliminatedOptions={eliminatedOptions}
          onEliminateOption={handleEliminateOption}
          showFeedback={showFeedback}
          answered={answered}
        />

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
  );

  const additionalTopNavContent = (
    <>
      <QuestionInfoTooltip question={question} />
      <div className="flex items-center space-x-2 text-sm">
        <span className="hidden sm:inline">Eliminate</span>
        <Switch
          checked={eliminateMode}
          onCheckedChange={setEliminateMode}
          className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
        />
      </div>
    </>
  );

  const bottomNavContent = showFeedback ? (
    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]">
      Next
    </Button>
  ) : (
    <Button
      onClick={handleSubmit}
      disabled={!selectedAnswer}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]"
    >
      Submit
    </Button>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavigation
          mode="MARATHON"
          modeColor="bg-orange-600"
          title=""
          timeElapsed={timeRemaining}
          onExit={onEndMarathon}
          isMobile={true}
          additionalContent={additionalTopNavContent}
        />
        <div className="flex-1 flex flex-col pb-16">
          {renderQuestionSection()}
          {renderAnswerSection()}
        </div>
        <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
          <div className="text-sm text-gray-600">
            Questions Solved: {questionsSolved}
          </div>
          <div className="flex space-x-3">
            {bottomNavContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation
        mode="MARATHON"
        modeColor="bg-orange-600"
        title=""
        timeElapsed={timeRemaining}
        onExit={onEndMarathon}
        isMobile={false}
        additionalContent={additionalTopNavContent}
      />
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            {renderQuestionSection()}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            {renderAnswerSection()}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
        <div className="text-sm text-gray-600">
          Questions Solved: {questionsSolved}
        </div>
        <div className="flex space-x-3">
          {bottomNavContent}
        </div>
      </div>
    </div>
  );
};

export default ResizableMarathonInterface;
