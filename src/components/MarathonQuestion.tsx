
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flag, Lightbulb, Eye } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  subject: 'math' | 'english';
  type?: 'multiple-choice' | 'grid-in';
}

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
  const [gridInValue, setGridInValue] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const questionType = question.type || 'multiple-choice';

  const handleSubmit = () => {
    if (selectedAnswer === null && !gridInValue) return;
    
    const answer = questionType === 'grid-in' ? gridInValue : selectedAnswer;
    const isCorrect = answer === question.correctAnswer;
    
    onAnswer(answer!, isCorrect, showAnswer, hintsUsed);
    
    // Reset for next question
    setSelectedAnswer(null);
    setGridInValue('');
    setShowHint(false);
    setShowAnswer(false);
    setHintsUsed(0);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (questionType === 'multiple-choice') {
      setSelectedAnswer(question.correctAnswer as number);
    } else {
      setGridInValue(question.correctAnswer as string);
    }
  };

  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Question Header */}
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          question.subject === 'math' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {question.subject === 'math' ? 'Math' : 'English'}
        </span>
        
        <Button
          onClick={onFlag}
          variant="outline"
          size="sm"
          className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
        >
          <Flag className={`h-4 w-4 mr-2 ${isFlagged ? 'fill-yellow-400' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag'}
        </Button>
      </div>

      {/* Question */}
      <h2 className={`font-semibold mb-6 leading-relaxed ${fontSizeClass}`}>
        {question.question}
      </h2>

      {/* Answer Options */}
      {questionType === 'multiple-choice' && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Grid-In Input */}
      {questionType === 'grid-in' && (
        <div className="mb-6">
          <Input
            type="text"
            value={gridInValue}
            onChange={(e) => setGridInValue(e.target.value)}
            placeholder="Enter your answer"
            className="text-lg text-center"
          />
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Hint: Think about the fundamental concepts involved.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={handleShowHint} variant="outline" size="sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Hint
          </Button>
          <Button onClick={handleShowAnswer} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Show Answer
          </Button>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={selectedAnswer === null && !gridInValue}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
};

export default MarathonQuestion;
