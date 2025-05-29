
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Flag, ArrowRight, Lightbulb, Eye, GraduationCap, Calculator as CalculatorIcon } from 'lucide-react';
import { Question } from '../data/questions';
import Calculator from './Calculator';

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
        {/* Question Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.subject === 'math' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {question.subject === 'math' ? 'Mathematics' : 'English'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {question.subject === 'math' && calculatorEnabled && (
              <Button
                onClick={() => setCalculatorOpen(!calculatorOpen)}
                variant="outline"
                size="sm"
                className={calculatorOpen ? 'bg-blue-50 border-blue-300' : ''}
              >
                <CalculatorIcon className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={onFlag}
              variant="outline"
              size="sm"
              className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
            >
              <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold leading-relaxed mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {question.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showAnswer || isSubmitting}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showAnswer
                    ? index === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : `border-gray-200 hover:border-gray-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`
                }`}
              >
                <div className="flex items-center">
                  <span className="font-medium mr-3 text-gray-500">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hints */}
        {hintText && (
          <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-yellow-800">{hintText}</p>
            </div>
          </Card>
        )}

        {/* Explanation */}
        {showExplanation && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
            <p className="text-blue-800">{question.explanation}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            {!showAnswer && hintsUsed < 3 && !isSubmitting && (
              <Button onClick={getHint} variant="outline" size="sm">
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({hintsUsed}/3)
              </Button>
            )}
            
            {!showAnswer && !isSubmitting && (
              <Button onClick={handleShowAnswer} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Show Answer
              </Button>
            )}
            
            {showExplanation && (
              <Button variant="outline" size="sm">
                <GraduationCap className="h-4 w-4 mr-1" />
                Teach Me This Concept
              </Button>
            )}
          </div>

          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null || isSubmitting}
            className={`bg-orange-600 hover:bg-orange-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Next Question'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Calculator */}
      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};

export default MarathonQuestion;
