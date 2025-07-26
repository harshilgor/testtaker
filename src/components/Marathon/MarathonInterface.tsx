
import React from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import ResizableMarathonInterface from './ResizableMarathonInterface';

interface MarathonInterfaceProps {
  question: DatabaseQuestion;
  currentQuestionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
  onAnswer: (answer: string, showAnswerUsed?: boolean) => void;
  onNext: () => void;
  onFlag: () => void;
  onEndMarathon: () => void;
  questionsSolved?: number;
  onGoToQuestion?: (questionNumber: number) => void;
  answeredQuestions?: Set<number>;
}

const MarathonInterface: React.FC<MarathonInterfaceProps> = (props) => {
  return <ResizableMarathonInterface {...props} />;
};

export default MarathonInterface;
