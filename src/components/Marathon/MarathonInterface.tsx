
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseQuestion } from '@/services/questionService';
import { Badge } from '@/components/ui/badge';
import { Flag, Clock, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [markedForReview, setMarkedForReview] = useState(false);
  const [eliminateMode, setEliminateMode] = useState(false);

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
    setMarkedForReview(false);
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
  const isMathQuestion = question.section === 'Math';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - matches SAT test header */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
            MARATHON
          </div>
          <span className="text-sm">
            {isMathQuestion ? 'Section 2, Module 1: Math' : 'Section 1, Module 1: Reading and Writing'}
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          {timeRemaining && (
            <div className="flex items-center space-x-2 text-lg font-mono">
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <span>Eliminate Answers</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={setEliminateMode}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Main content - split layout */}
      <div className="flex-1 flex">
        {/* Left panel - Question/Passage */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto border-r border-gray-200">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {isMathQuestion ? 'Question' : 'Passage'}
              </h2>
              
              {/* Question content in gray box for passages */}
              {!isMathQuestion ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {question.question_text}
                  </p>
                </div>
              ) : (
                <div className="text-lg leading-relaxed text-gray-900 mb-6">
                  {question.question_text}
                </div>
              )}

              {/* Question image if exists */}
              {question.image && (
                <QuestionImage 
                  imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
                  alt="Question diagram" 
                  className="max-w-full mb-6"
                />
              )}
            </div>

            {/* Question section for reading passages */}
            {!isMathQuestion && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
                <p className="text-lg leading-relaxed text-gray-900">
                  {/* This would be a separate question field in a real implementation */}
                  Based on the passage, what can be inferred about Mrs. Spring Fragrance's situation?
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Answer options */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto">
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
              ].map((option) => (
                <div
                  key={option.letter}
                  onClick={() => handleAnswerSelect(option.letter)}
                  className={`border-2 rounded-lg transition-all cursor-pointer ${
                    selectedAnswer === option.letter
                      ? showFeedback
                        ? option.letter === question.correct_answer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && option.letter === question.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  } ${answered ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center p-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                      selectedAnswer === option.letter
                        ? showFeedback
                          ? option.letter === question.correct_answer
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-red-500 bg-red-500 text-white'
                          : 'border-blue-500 bg-blue-500 text-white'
                        : showFeedback && option.letter === question.correct_answer
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}>
                      {option.letter}
                    </div>
                    
                    <div className="flex-1 text-gray-900 leading-relaxed">
                      {option.text}
                    </div>
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

      {/* Bottom navigation - matches SAT test bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="text-sm text-gray-600">
          Student Name
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded flex items-center space-x-2"
          >
            <span>Question {currentQuestionNumber} of {totalQuestions}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={onEndMarathon}
            variant="outline"
            className="px-4 py-2"
          >
            Exit Marathon
          </Button>

          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind fixed nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default MarathonInterface;
