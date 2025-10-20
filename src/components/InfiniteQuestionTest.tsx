import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInfiniteQuestions } from '@/hooks/useInfiniteQuestions';
import { Loader2, RefreshCw, Zap } from 'lucide-react';

const InfiniteQuestionTest: React.FC = () => {
  const { questions, loading, error, generateQuestions, clearQuestions, aiUsed } = useInfiniteQuestions();
  const [testResults, setTestResults] = useState<any>(null);

  const testComprehensionEasy = async () => {
    await generateQuestions({
      subject: 'english',
      skill: 'Comprehension',
      domain: 'Information and Ideas',
      difficulty: 'easy',
      count: 3,
      useAI: true
    });
  };

  const testComprehensionMedium = async () => {
    await generateQuestions({
      subject: 'english',
      skill: 'Comprehension',
      domain: 'Information and Ideas',
      difficulty: 'medium',
      count: 3,
      useAI: true
    });
  };

  const testComprehensionHard = async () => {
    await generateQuestions({
      subject: 'english',
      skill: 'Comprehension',
      domain: 'Information and Ideas',
      difficulty: 'hard',
      count: 3,
      useAI: true
    });
  };

  const testDatabaseOnly = async () => {
    await generateQuestions({
      subject: 'english',
      skill: 'Comprehension',
      domain: 'Information and Ideas',
      difficulty: 'easy',
      count: 5,
      useAI: false
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Infinite Question Generation Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={testComprehensionEasy}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Easy (AI)
            </Button>
            
            <Button 
              onClick={testComprehensionMedium}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Medium (AI)
            </Button>
            
            <Button 
              onClick={testComprehensionHard}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Hard (AI)
            </Button>
            
            <Button 
              onClick={testDatabaseOnly}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              DB Only
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={clearQuestions} variant="secondary" size="sm">
              Clear Questions
            </Button>
            
            {aiUsed && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Zap className="h-4 w-4" />
                AI Generated Questions
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Generated Questions ({questions.length})
              {aiUsed && <span className="text-sm text-blue-600 ml-2">(AI Enhanced)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{question.difficulty}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{question.skill}</span>
                    {question.metadata?.generated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">AI Generated</span>
                    )}
                  </div>
                </div>

                {question.question_prompt && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Passage:</h4>
                    <p className="text-sm text-gray-700">{question.question_prompt}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm mb-2">Question:</h4>
                  <p className="text-sm">{question.question_text}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">A.</span> {question.option_a}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">B.</span> {question.option_b}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">C.</span> {question.option_c}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">D.</span> {question.option_d}
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-green-800">
                    Correct Answer: {question.correct_answer}
                  </h4>
                  <p className="text-sm text-green-700">{question.correct_rationale}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfiniteQuestionTest;

