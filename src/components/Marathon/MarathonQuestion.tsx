
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionContent from './QuestionContent';
import AnswerOptions from './AnswerOptions';
import QuestionActions from './QuestionActions';
import AnswerFeedback from './AnswerFeedback';

interface MarathonQuestionProps {
  question: DatabaseQuestion;
  onAnswer: (answer: string) => void;
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

  console.log('MarathonQuestion: Rendering', { questionId: question.id, answered, showFeedback });

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    console.log('MarathonQuestion: Answer selected', answer);
    setSelectedAnswer(answer);
  };

  const handleShowAnswer = () => {
    console.log('MarathonQuestion: Show answer clicked');
    setShowAnswer(true);
    setShowFeedback(true);
    setSelectedAnswer(question.correct_answer);
    onAnswer(question.correct_answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer && !showAnswer) return;
    
    console.log('MarathonQuestion: Submit clicked', { selectedAnswer, showAnswer });
    setAnswered(true);
    setShowFeedback(true);
    onAnswer(selectedAnswer);
  };

  const handleNext = () => {
    console.log('MarathonQuestion: Next clicked');
    setSelectedAnswer('');
    setAnswered(false);
    setShowAnswer(false);
    setShowFeedback(false);
    onNext();
  };

  // Get the incorrect rationale based on the selected answer
  const getIncorrectRationale = (selectedAnswer: string) => {
    switch (selectedAnswer) {
      case 'A':
        return question.incorrect_rationale_a;
      case 'B':
        return question.incorrect_rationale_b;
      case 'C':
        return question.incorrect_rationale_c;
      case 'D':
        return question.incorrect_rationale_d;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card className="border-slate-200">
        <CardContent className="p-4 md:p-8">
          <QuestionContent
            questionText={question.question_text}
            imageUrl={question.metadata?.image_url}
            hasImage={question.image}
            questionId={question.id}
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
              incorrectRationale={getIncorrectRationale(selectedAnswer)}
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
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
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
