
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface ResultDetailViewProps {
  result: any;
  resultType: 'quiz' | 'mock';
  onBack: () => void;
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({
  result,
  resultType,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {resultType === 'quiz' ? 'Quiz' : 'Mock Test'} Review
          </h1>
        </div>

        <div className="space-y-6">
          {result.questions.map((question: any, index: number) => {
            const userAnswer = result.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Question {index + 1}</span>
                    {isCorrect ? (
                      <span className="text-green-600 text-sm">✅ Correct</span>
                    ) : (
                      <span className="text-red-600 text-sm">❌ Incorrect</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-lg font-medium">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : optionIndex === userAnswer && !isCorrect
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">(Correct Answer)</span>
                          )}
                          {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                            <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDetailView;
