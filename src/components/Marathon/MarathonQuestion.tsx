
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionContent from './QuestionContent';
import AnswerOptions from './AnswerOptions';
import QuestionActions from './QuestionActions';
import AnswerFeedback from './AnswerFeedback';

interface MarathonQuestionProps {
  question: DatabaseQuestion;
  onAnswer: (answer: string, isCorrect: boolean, showAnswerUsed: boolean) => void;
  onNext: () => void;
}

const MarathonQuestion: React.FC<MarathonQuestionProps> = ({
  question,
  onAnswer,
  onNext
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowFeedback(true);
    setSelectedAnswer(question.correct_answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer && !showAnswer) return;
    
    const isCorrect = selectedAnswer === question.correct_answer;
    setAnswered(true);
    setShowFeedback(true);
    onAnswer(selectedAnswer, isCorrect, showAnswer);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setAnswered(false);
    setShowAnswer(false);
    setShowFeedback(false);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-slate-200">
        <CardContent className="p-8">
          <QuestionContent
            questionText={question.question_text}
            imageUrl={question.metadata?.image_url}
          />

          <AnswerOptions
            optionA={question.option_a}
            optionB={question.option_b}
            optionC={question.option_c}
            optionD={question.option_d}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleAnswerSelect}
            answered={answered}
            correctAnswer={showFeedback ? question.correct_answer : ''}
          />

          {showFeedback && (
            <AnswerFeedback
              isCorrect={selectedAnswer === question.correct_answer}
              selectedAnswer={selectedAnswer}
              correctAnswer={question.correct_answer}
              correctRationale={question.correct_rationale}
              showAnswerUsed={showAnswer}
            />
          )}

          {!showFeedback && (
            <QuestionActions
              answered={answered}
              showAnswer={showAnswer}
              selectedAnswer={selectedAnswer}
              onShowAnswer={handleShowAnswer}
              onSubmit={handleSubmit}
            />
          )}

          {showFeedback && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Next Question
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarathonQuestion;
