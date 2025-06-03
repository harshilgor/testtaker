
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, Flag, Calculator } from 'lucide-react';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionWithImage from '../QuestionWithImage';

interface MarathonQuestionProps {
  question: DatabaseQuestion;
  onAnswer: (selectedAnswer: string) => void;
  onNext: () => void;
}

const MarathonQuestion: React.FC<MarathonQuestionProps> = ({
  question,
  onAnswer,
  onNext
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (showAnswer) return;
    
    setSelectedAnswer(answer);
    onAnswer(answer);
    setShowAnswer(true);
    setShowExplanation(true);
  };

  const isCorrect = selectedAnswer === question.correct_answer;
  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d }
  ].filter(option => option.text);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-8">
          <QuestionWithImage question={question}>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
                {question.question_text}
              </h2>
            </div>

            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-start space-x-4 ${
                    selectedAnswer === option.key
                      ? showAnswer
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showAnswer && option.key === question.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  } ${showAnswer ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                    selectedAnswer === option.key
                      ? showAnswer
                        ? isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-blue-500 bg-blue-500 text-white'
                      : showAnswer && option.key === question.correct_answer
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}>
                    {option.key}
                  </div>
                  <span className="text-slate-700 flex-1">{option.text}</span>
                  {showAnswer && selectedAnswer === option.key && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  )}
                  {showAnswer && option.key === question.correct_answer && selectedAnswer !== option.key && (
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {showExplanation && question.correct_rationale && (
              <div className={`mt-6 p-6 rounded-xl ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h3>
                <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'} leading-relaxed`}>
                  {question.correct_rationale}
                </p>
              </div>
            )}

            {showAnswer && (
              <div className="mt-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Question
                  </Button>
                  {question.section === 'math' && (
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculator
                    </Button>
                  )}
                </div>
                <Button
                  onClick={onNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6 py-2"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </QuestionWithImage>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarathonQuestion;
