
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseQuestion } from '@/services/questionService';
import { Badge } from '@/components/ui/badge';
import { Flag, Clock } from 'lucide-react';
import QuestionImage from '../QuestionImage';

interface MarathonInterfaceProps {
  question: DatabaseQuestion;
  currentQuestionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
  onAnswer: (answer: string, showAnswerUsed?: boolean) => void;
  onNext: () => void;
  onFlag: () => void;
  onEndMarathon: () => void;
}

const MarathonInterface: React.FC<MarathonInterfaceProps> = ({
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(true);
    setSelectedAnswer(question.correct_answer);
    setAnswered(true);
    onAnswer(question.correct_answer, true);
  };

  const handleSubmit = () => {
    if (!selectedAnswer && !showAnswer) return;
    
    setAnswered(true);
    setShowFeedback(true);
    onAnswer(selectedAnswer, showAnswer);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setAnswered(false);
    setShowAnswer(false);
    setShowFeedback(false);
    setIsFlagged(false);
    onNext();
  };

  const handleFlag = () => {
    setIsFlagged(!isFlagged);
    onFlag();
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrect = selectedAnswer === question.correct_answer && !showAnswer;

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            MARATHON
          </Badge>
          <span className="text-sm">
            {question.test === 'Math' ? 'Section 2, Module 1: Math' : 'Section 1, Module 1: Reading and Writing'}
          </span>
        </div>
        <div className="flex items-center space-x-6">
          {timeRemaining && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg">{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
          <Button
            onClick={onEndMarathon}
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800"
          >
            End Marathon
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left panel - Question */}
        <div className="w-1/2 bg-white text-black p-8 overflow-y-auto">
          <div className="max-w-3xl">
            {/* Question header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {question.test === 'Math' ? 'Question' : 'Passage'}
              </h2>
              <Button
                onClick={handleFlag}
                variant="outline"
                size="sm"
                className={`${isFlagged ? 'border-orange-400 text-orange-600' : 'border-gray-300'}`}
              >
                <Flag className={`h-4 w-4 mr-2 ${isFlagged ? 'fill-orange-400' : ''}`} />
                {isFlagged ? 'Flagged' : 'Mark for Review'}
              </Button>
            </div>

            {/* Question content */}
            <div className="text-lg leading-relaxed text-gray-900 mb-6">
              {question.question_text}
            </div>

            {/* Question image if exists */}
            {question.image && (
              <QuestionImage 
                imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
                alt="Question diagram" 
                className="max-w-full mb-6"
              />
            )}
          </div>
        </div>

        {/* Right panel - Answer options */}
        <div className="w-1/2 bg-gray-50 text-black p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Choose the best answer.
            </h3>

            {/* Answer options */}
            <div className="space-y-4 mb-8">
              {[
                { letter: 'A', text: question.option_a },
                { letter: 'B', text: question.option_b },
                { letter: 'C', text: question.option_c },
                { letter: 'D', text: question.option_d }
              ].map((option) => (
                <div
                  key={option.letter}
                  onClick={() => handleAnswerSelect(option.letter)}
                  className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedAnswer === option.letter
                      ? showFeedback
                        ? option.letter === question.correct_answer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && option.letter === question.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${answered ? 'cursor-default' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    selectedAnswer === option.letter
                      ? showFeedback
                        ? option.letter === question.correct_answer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-blue-500 bg-blue-500 text-white'
                      : showFeedback && option.letter === question.correct_answer
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-400'
                  }`}>
                    {option.letter}
                  </div>
                  <div className="flex-1 text-gray-900 leading-relaxed">
                    {option.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Show feedback if answered */}
            {showFeedback && (
              <div className={`p-4 rounded-lg mb-6 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Correct!' : showAnswer ? 'Answer Revealed' : 'Incorrect'}
                </div>
                <div className="text-gray-700 text-sm">
                  <strong>Explanation:</strong> {question.correct_rationale}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="text-sm text-gray-300">
          Question {currentQuestionNumber} of {totalQuestions}
        </div>
        
        <div className="flex items-center space-x-4">
          {!showFeedback && (
            <>
              <Button
                onClick={handleShowAnswer}
                variant="outline"
                className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700"
              >
                Show Answer
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                Submit
              </Button>
            </>
          )}
          
          {showFeedback && (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarathonInterface;
