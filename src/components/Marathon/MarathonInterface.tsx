
import React, { useState } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import MarathonHeader from './MarathonHeader';
import QuestionPanel from './QuestionPanel';
import AnswerPanel from './AnswerPanel';
import MarathonBottomNav from './MarathonBottomNav';

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
    setMarkedForReview(false);
    onNext();
  };

  const isMathQuestion = question.section === 'Math';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MarathonHeader
        isMathQuestion={isMathQuestion}
        timeRemaining={timeRemaining}
        eliminateMode={eliminateMode}
        onEliminateModeChange={setEliminateMode}
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      <div className="flex-1 flex">
        <QuestionPanel
          question={question}
          isMathQuestion={isMathQuestion}
        />

        <AnswerPanel
          question={question}
          selectedAnswer={selectedAnswer}
          answered={answered}
          showFeedback={showFeedback}
          showAnswer={showAnswer}
          markedForReview={markedForReview}
          onAnswerSelect={handleAnswerSelect}
          onMarkedForReviewChange={setMarkedForReview}
        />
      </div>

      <MarathonBottomNav
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
        showFeedback={showFeedback}
        selectedAnswer={selectedAnswer}
        onSubmit={handleSubmit}
        onNext={handleNext}
        onEndMarathon={onEndMarathon}
      />

      <div className="h-20"></div>
    </div>
  );
};

export default MarathonInterface;
