
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionHeader from './Marathon/QuestionHeader';
import QuestionContent from './Marathon/QuestionContent';
import AnswerOptions from './Marathon/AnswerOptions';
import QuestionActions from './Marathon/QuestionActions';
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

  const getAllIncorrectRationales = () => {
    return {
      A: question.incorrect_rationale_a,
      B: question.incorrect_rationale_b,
      C: question.incorrect_rationale_c,
      D: question.incorrect_rationale_d
    };
  };

  const getImageUrl = () => {
    return question.metadata?.image_url || null;
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <QuestionHeader
            questionNumber={questionNumber}
            section={question.section}
            difficulty={question.difficulty}
            skill={question.skill}
            questionsAttempted={questionsAttempted}
            totalQuestions={totalQuestions}
            timeSpent={timeSpent}
            isFlagged={isFlagged}
            onFlag={onFlag}
            answered={answered}
          />

          <QuestionContent
            questionText={question.question_text}
            imageUrl={getImageUrl()}
          />

          <AnswerOptions
            optionA={question.option_a}
            optionB={question.option_b}
            optionC={question.option_c}
            optionD={question.option_d}
            selectedAnswer={selectedAnswer}
            onAnswerChange={setSelectedAnswer}
            answered={answered}
          />

          <QuestionActions
            answered={answered}
            showAnswer={showAnswer}
            selectedAnswer={selectedAnswer}
            onShowAnswer={handleShowAnswer}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <FeedbackModal
        isOpen={showFeedback}
        isCorrect={selectedAnswer === question.correct_answer}
        selectedAnswer={selectedAnswer}
        correctAnswer={question.correct_answer}
        correctRationale={question.correct_rationale}
        incorrectRationale={getIncorrectRationale()}
        allIncorrectRationales={getAllIncorrectRationales()}
        onNext={handleNextQuestion}
      />
    </>
  );
};

export default MarathonQuestion;
