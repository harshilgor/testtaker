
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Flag, Clock, Target } from 'lucide-react';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionImage from './QuestionImage';
import FeedbackModal from './FeedbackModal';

interface MarathonQuestionProps {
  question: DatabaseQuestion;
  onAnswer: (answer: string, isCorrect: boolean, showAnswerUsed: boolean) => void;
  onFlag: () => void;
  onNext: () => void;
  isFlagged: boolean;
  timeSpent: number;
  questionNumber: number;
  totalQuestions: number;
  questionsAttempted: number;
}

const MarathonQuestion: React.FC<MarathonQuestionProps> = ({
  question,
  onAnswer,
  onFlag,
  onNext,
  isFlagged,
  timeSpent,
  questionNumber,
  totalQuestions,
  questionsAttempted
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setShowAnswer(false);
    setAnswered(false);
    setShowFeedback(false);
  }, [question.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!selectedAnswer && !showAnswer) return;
    
    const isCorrect = selectedAnswer === question.correct_answer;
    setAnswered(true);
    setShowFeedback(true);
    
    // Call onAnswer with the result
    onAnswer(selectedAnswer || 'No Answer', isCorrect, showAnswer);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setSelectedAnswer(question.correct_answer);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    onNext();
  };

  const getIncorrectRationale = () => {
    switch (selectedAnswer) {
      case 'A': return question.incorrect_rationale_a;
      case 'B': return question.incorrect_rationale_b;
      case 'C': return question.incorrect_rationale_c;
      case 'D': return question.incorrect_rationale_d;
      default: return undefined;
    }
  };

  const getImageUrl = () => {
    return question.metadata?.image_url || null;
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                Question {questionNumber}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {question.section}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {question.skill}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {questionsAttempted} / {totalQuestions} solved
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatTime(timeSpent)}</span>
              </div>
              <Button
                variant={isFlagged ? "default" : "outline"}
                size="sm"
                onClick={onFlag}
                disabled={answered}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-4">
              {question.question_text}
            </h2>
            
            {/* Display image if available */}
            {getImageUrl() && (
              <QuestionImage imageUrl={getImageUrl()!} alt="Question diagram" />
            )}
          </div>

          {/* Answer Options */}
          <div className="mb-8">
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              disabled={answered}
              className="space-y-4"
            >
              {[
                { value: 'A', text: question.option_a },
                { value: 'B', text: question.option_b },
                { value: 'C', text: question.option_c },
                { value: 'D', text: question.option_d }
              ].map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1"
                    disabled={answered}
                  />
                  <Label 
                    htmlFor={option.value} 
                    className={`flex-1 text-base leading-relaxed cursor-pointer p-3 rounded-lg border transition-colors ${
                      selectedAnswer === option.value 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 border-gray-200'
                    } ${answered ? 'cursor-default' : ''}`}
                  >
                    <span className="font-semibold mr-2">{option.value}.</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div>
              {!answered && !showAnswer && (
                <Button
                  variant="outline"
                  onClick={handleShowAnswer}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Show Answer
                </Button>
              )}
            </div>
            
            <div className="space-x-4">
              {!answered && (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer && !showAnswer}
                  className="min-w-32"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        isCorrect={selectedAnswer === question.correct_answer}
        selectedAnswer={selectedAnswer}
        correctAnswer={question.correct_answer}
        correctRationale={question.correct_rationale}
        incorrectRationale={getIncorrectRationale()}
        onNext={handleNextQuestion}
      />
    </>
  );
};

export default MarathonQuestion;
