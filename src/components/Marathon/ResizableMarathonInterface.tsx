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
import { ChevronDown } from 'lucide-react';

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
  onGoToQuestion?: (questionNumber: number) => void;
  answeredQuestions?: Set<number>;
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
  questionsSolved = 0,
  onGoToQuestion,
  answeredQuestions = new Set()
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(false);
  const [eliminateMode, setEliminateMode] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
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

  const handleQuestionNavigatorToggle = () => {
    setIsNavigatorOpen(!isNavigatorOpen);
    if (!isNavigatorOpen) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const renderQuestionNavigator = () => {
    if (!isNavigatorOpen) return null;

    const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

    return (
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questionNumbers.map((questionNum) => (
              <button
                key={questionNum}
                onClick={() => onGoToQuestion && onGoToQuestion(questionNum)}
                className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
                  questionNum === currentQuestionNumber
                    ? 'bg-blue-600 text-white border-blue-600'
                    : answeredQuestions.has(questionNum)
                    ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {questionNum}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
              <span className="text-gray-600">Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    );
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
      Next Question
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
          modeColor="bg-blue-600"
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Top Navigation - Updated to match SAT Practice Test height */}
      <div className="sticky top-0 z-50">
        <TopNavigation
          mode="MARATHON"
          modeColor="bg-blue-600"
          title=""
          timeElapsed={timeRemaining}
          onExit={onEndMarathon}
          isMobile={false}
          additionalContent={additionalTopNavContent}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="min-h-full">
          <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
            {renderQuestionSection()}
          </ResizablePanel>
          <ResizableHandle 
            withHandle 
          />
          <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
            {renderAnswerSection()}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Sticky Bottom Navigation - Updated to match SAT Practice Test height and removed Exit Marathon button */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handleQuestionNavigatorToggle}
            className="text-sm font-medium bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Question {currentQuestionNumber} of {totalQuestions}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          <div className="flex space-x-3">
            {bottomNavContent}
          </div>
        </div>
      </div>

      {/* Question Navigator */}
      {renderQuestionNavigator()}
    </div>
  );
};

export default ResizableMarathonInterface;
