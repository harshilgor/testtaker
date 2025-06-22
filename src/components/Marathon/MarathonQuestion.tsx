
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionContent from './QuestionContent';
import AnswerOptions from './AnswerOptions';
import QuestionActions from './QuestionActions';
import AnswerFeedback from './AnswerFeedback';
import { Flag } from 'lucide-react';

interface MarathonQuestionProps {
  question: DatabaseQuestion;
  onAnswer: (answer: string, showAnswerUsed?: boolean) => void;
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
  const [isFlagged, setIsFlagged] = useState(false);

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
    onAnswer(question.correct_answer, true);
  };

  const handleSubmit = () => {
    if (!selectedAnswer && !showAnswer) return;
    
    console.log('MarathonQuestion: Submit clicked', { selectedAnswer, showAnswer });
    setAnswered(true);
    setShowFeedback(true);
    onAnswer(selectedAnswer, showAnswer);
  };

  const handleNext = () => {
    console.log('MarathonQuestion: Next clicked');
    setSelectedAnswer('');
    setAnswered(false);
    setShowAnswer(false);
    setShowFeedback(false);
    setIsFlagged(false);
    onNext();
  };

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
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Question content */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 border-slate-200">
          <CardContent className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {question.difficulty}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {question.skill || 'General'}
                </span>
              </div>
              <button 
                onClick={() => setIsFlagged(!isFlagged)}
                className={`p-2 rounded hover:bg-gray-100 ${isFlagged ? 'text-orange-600' : 'text-slate-400'}`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
            
            <QuestionContent
              questionText={question.question_text}
              imageUrl={question.metadata?.image_url}
              hasImage={question.image}
              questionId={question.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Answer options and actions */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 border-slate-200">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex-1 flex flex-col justify-between">
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

              <div className="mt-6">
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
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleNext}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        Next Question
                      </button>
                    </div>
                    
                    <AnswerFeedback
                      isCorrect={selectedAnswer === question.correct_answer && !showAnswer}
                      selectedAnswer={selectedAnswer}
                      correctAnswer={question.correct_answer}
                      correctRationale={question.correct_rationale}
                      incorrectRationale={getIncorrectRationale(selectedAnswer)}
                      showAnswerUsed={showAnswer}
                    />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarathonQuestion;
