
import React, { useState } from 'react';
import { SATQuestion } from '../data/satQuestions';
import SATQuestionHeader from './SAT/SATQuestionHeader';
import SATMultipleChoice from './SAT/SATMultipleChoice';
import SATGridIn from './SAT/SATGridIn';
import SATQuestionNavigation from './SAT/SATQuestionNavigation';

interface SATQuestionViewProps {
  question: SATQuestion;
  selectedAnswer: number | string | null;
  isFlagged: boolean;
  onAnswerChange: (answer: number | string | null) => void;
  onFlag: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  onModuleComplete: () => void;
}

const SATQuestionView: React.FC<SATQuestionViewProps> = ({
  question,
  selectedAnswer,
  isFlagged,
  onAnswerChange,
  onFlag,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  onModuleComplete
}) => {
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());

  const handleEliminateOption = (optionIndex: number) => {
    const newEliminated = new Set(eliminatedOptions);
    if (newEliminated.has(optionIndex)) {
      newEliminated.delete(optionIndex);
    } else {
      newEliminated.add(optionIndex);
      // If the eliminated option was selected, deselect it
      if (selectedAnswer === optionIndex) {
        onAnswerChange(null);
      }
    }
    setEliminatedOptions(newEliminated);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <SATQuestionHeader
        section={question.section}
        topic={question.topic}
        isFlagged={isFlagged}
        onFlag={onFlag}
      />

      {/* Question Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        {question.type === 'multiple-choice' && question.options && (
          <SATMultipleChoice
            options={question.options}
            selectedAnswer={typeof selectedAnswer === 'number' ? selectedAnswer : null}
            onAnswerSelect={onAnswerChange}
            eliminatedOptions={eliminatedOptions}
            onEliminateOption={handleEliminateOption}
          />
        )}

        {/* Grid-In Input */}
        {question.type === 'grid-in' && (
          <SATGridIn
            selectedAnswer={typeof selectedAnswer === 'string' ? selectedAnswer : null}
            onAnswerChange={onAnswerChange}
          />
        )}
      </div>

      <SATQuestionNavigation
        onNext={onNext}
        onPrevious={onPrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLastQuestion={isLastQuestion}
        onModuleComplete={onModuleComplete}
      />
    </div>
  );
};

export default SATQuestionView;
