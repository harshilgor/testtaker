import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Target, Zap } from 'lucide-react';

interface ResultDetailViewProps {
  result: any;
  resultType: 'quiz' | 'mock' | 'marathon';
  onBack: () => void;
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({
  result,
  resultType,
  onBack
}) => {
  const renderMarathonDetails = () => {
    const accuracy = result.total_questions > 0 
      ? Math.round((result.correct_answers / result.total_questions) * 100) 
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{result.total_questions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{result.correct_answers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${
                accuracy >= 70 ? 'text-green-600' : 
                accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {accuracy}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {result.total_questions - result.correct_answers}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Date:</span>
                  <span>{new Date(result.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <Badge variant="outline">{result.difficulty}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {result.subjects && result.subjects.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Subjects:</span>
                    <div className="flex space-x-1">
                      {result.subjects.map((subject: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuizDetails = () => {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{result.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((result.score / 100) * (result.questions?.length || 0))}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Subject:</strong> {result.subject}</div>
              <div><strong>Date:</strong> {new Date(result.date).toLocaleDateString()}</div>
              {result.topics && (
                <div>
                  <strong>Topics:</strong> {result.topics.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMockTestDetails = () => {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{result.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((result.score / 100) * (result.questions?.length || 0))}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Date:</strong> {new Date(result.date).toLocaleDateString()}</div>
              <div><strong>Test Type:</strong> Mock SAT</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
            {resultType === 'quiz' && 'Quiz Result Details'}
            {resultType === 'mock' && 'Mock Test Result Details'}
            {resultType === 'marathon' && 'Marathon Session Details'}
          </h1>
        </div>

        {resultType === 'quiz' && renderQuizDetails()}
        {resultType === 'mock' && renderMockTestDetails()}
        {resultType === 'marathon' && renderMarathonDetails()}
      </div>
    </div>
  );
};

export default ResultDetailView;
