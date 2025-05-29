
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Question } from '../data/questions';
import Calculator from './Calculator';
import MarathonQuestionHeader from './MarathonQuestionHeader';
import MarathonAnswerOptions from './MarathonAnswerOptions';
import MarathonHints from './MarathonHints';
import MarathonExplanation from './MarathonExplanation';
import MarathonActionButtons from './MarathonActionButtons';

interface MarathonQuestionProps {
  question: Question;
  onAnswer: (answer: number | string, isCorrect: boolean, showAnswerUsed: boolean, hintsUsed: number) => void;
  onFlag: () => void;
  isFlagged: boolean;
  calculatorEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
}

const MarathonQuestion: React.FC<MarathonQuestionProps> = ({
  question,
  onAnswer,
  onFlag,
  isFlagged,
  calculatorEnabled,
  fontSize,
  darkMode
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowExplanation(false);
    setHintsUsed(0);
    setHintText('');
    setIsSubmitting(false);
  }, [question.id]);

  const getHint = useCallback(() => {
    const hints = [
      "Think about what type of problem this is and what approach you should use.",
      "Break down the problem step by step. What information are you given?",
      "Consider the key concepts or formulas that might apply to this question."
    ];
    
    if (hintsUsed < hints.length) {
      setHintText(hints[hintsUsed]);
      setHintsUsed(prev => prev + 1);
    }
  }, [hintsUsed]);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
    setShowExplanation(true);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null || isSubmitting) return;
    
    setIsSubmitting(true);
    const isCorrect = !showAnswer && selectedAnswer === question.correctAnswer;
    
    // Use setTimeout to ensure smooth UI transition
    setTimeout(() => {
      onAnswer(selectedAnswer, isCorrect, showAnswer, hintsUsed);
    }, 100);
  }, [selectedAnswer, showAnswer, question.correctAnswer, hintsUsed, onAnswer, isSubmitting]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!showAnswer && !isSubmitting) {
      setSelectedAnswer(answerIndex);
    }
  }, [showAnswer, isSubmitting]);

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} transition-colors`}>
      <Card className={`p-8 ${fontSizeClass} ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <MarathonQuestionHeader
          question={question}
          onFlag={onFlag}
          isFlagged={isFlagged}
          calculatorEnabled={calculatorEnabled}
          calculatorOpen={calculatorOpen}
          onCalculatorToggle={() => setCalculatorOpen(!calculatorOpen)}
        />

        <div className="mb-8">
          <h2 className={`text-xl font-semibold leading-relaxed mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {question.question}
          </h2>

          <MarathonAnswerOptions
            question={question}
            selectedAnswer={selectedAnswer}
            showAnswer={showAnswer}
            isSubmitting={isSubmitting}
            darkMode={darkMode}
            onAnswerSelect={handleAnswerSelect}
          />
        </div>

        <MarathonHints hintText={hintText} />
        <MarathonExplanation question={question} showExplanation={showExplanation} />

        <MarathonActionButtons
          showAnswer={showAnswer}
          hintsUsed={hintsUsed}
          isSubmitting={isSubmitting}
          showExplanation={showExplanation}
          selectedAnswer={selectedAnswer}
          onGetHint={getHint}
          onShowAnswer={handleShowAnswer}
          onSubmitAnswer={handleSubmitAnswer}
        />
      </Card>

      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};

export default MarathonQuestion;
