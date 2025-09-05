import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Clock, 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-react';

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  subject: string;
  reasoning: string;
}

interface WeaknessTrainingZoneProps {
  questions: GeneratedQuestion[];
  weaknessInsights: string[];
  overallStrategy: string;
  estimatedTime: string;
  onQuestionComplete?: (questionIndex: number, isCorrect: boolean) => void;
  onAllQuestionsComplete?: (results: { correct: number; total: number }) => void;
}

const WeaknessTrainingZone: React.FC<WeaknessTrainingZoneProps> = ({
  questions,
  weaknessInsights,
  overallStrategy,
  estimatedTime,
  onQuestionComplete,
  onAllQuestionsComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalCorrect = questionResults.filter(result => result).length;

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return; // Don't allow changing answer after submission
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newResults = [...questionResults, isCorrect];
    setQuestionResults(newResults);
    setShowExplanation(true);
    
    onQuestionComplete?.(currentQuestionIndex, isCorrect);
    
    if (isLastQuestion) {
      setIsCompleted(true);
      onAllQuestionsComplete?.({
        correct: newResults.filter(result => result).length,
        total: newResults.length
      });
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) return;
    
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuestionResults([]);
    setIsCompleted(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'math': return 'bg-blue-100 text-blue-800';
      case 'english': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-900 mb-2">No Questions Generated</h3>
          <p className="text-orange-700">Unable to generate targeted practice questions at this time.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-green-600" />
            <span className="text-green-900">Training Complete!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalCorrect}/{questions.length}
            </div>
            <p className="text-green-700">
              You got {totalCorrect} out of {questions.length} questions correct!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-lg font-semibold">
                {Math.round((totalCorrect / questions.length) * 100)}%
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Time</div>
              <div className="text-lg font-semibold">{estimatedTime}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-green-900">Key Insights:</h4>
            {weaknessInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-green-700">{insight}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Strategy:</h4>
            <p className="text-sm text-green-700">{overallStrategy}</p>
          </div>

          <Button 
            onClick={handleRestart}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Practice Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          <span className="text-orange-900">Weakness Training Zone</span>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-orange-700">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getSubjectColor(currentQuestion.subject)}>
            {currentQuestion.subject}
          </Badge>
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            {currentQuestion.topic}
          </Badge>
        </div>

        {/* Question Text */}
        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <h3 className="font-medium text-gray-900 mb-3">Question:</h3>
          <p className="text-gray-700 leading-relaxed">{currentQuestion.question}</p>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Choose your answer:</h4>
          {currentQuestion.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === optionLetter;
            const isCorrect = optionLetter === currentQuestion.correctAnswer;
            const isWrong = showExplanation && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(optionLetter)}
                disabled={showExplanation}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  showExplanation
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : isWrong
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : isSelected
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    showExplanation
                      ? isCorrect
                        ? 'border-green-500 bg-green-500'
                        : isWrong
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300 bg-gray-300'
                      : isSelected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {showExplanation && isCorrect && <CheckCircle className="h-4 w-4 text-white" />}
                    {showExplanation && isWrong && <XCircle className="h-4 w-4 text-white" />}
                    {!showExplanation && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium">{optionLetter}.</span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        {!showExplanation && (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400"
          >
            Submit Answer
          </Button>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
              <p className="text-gray-700 mb-3">{currentQuestion.explanation}</p>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-1">Why you might have struggled:</h5>
                <p className="text-sm text-blue-700">{currentQuestion.reasoning}</p>
              </div>
            </div>

            {/* Next Button */}
            {!isLastQuestion ? (
              <Button 
                onClick={handleNextQuestion}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Next Question
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setIsCompleted(true);
                  onAllQuestionsComplete?.({
                    correct: questionResults.filter(result => result).length + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0),
                    total: questions.length
                  });
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Training
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeaknessTrainingZone;
