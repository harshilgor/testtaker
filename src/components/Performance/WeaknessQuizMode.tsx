import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Trophy,
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  correct_rationale: string;
  skill: string;
  difficulty: string;
  domain: string;
  test: string;
}

interface WeaknessQuizModeProps {
  questions: QuizQuestion[];
  weaknessTopics: string[];
  totalQuestions: number;
  estimatedTime: string;
  onQuizComplete?: (results: { correct: number; total: number; timeSpent: number }) => void;
}

const WeaknessQuizMode: React.FC<WeaknessQuizModeProps> = ({
  questions,
  weaknessTopics,
  totalQuestions,
  estimatedTime,
  onQuizComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalCorrect = questionResults.filter(result => result).length;

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const newResults = [...questionResults, isCorrect];
    setQuestionResults(newResults);
    setShowExplanation(true);
    
    if (isLastQuestion) {
      setIsCompleted(true);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onQuizComplete?.({
        correct: newResults.filter(result => result).length,
        total: newResults.length,
        timeSpent
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

  const getTestColor = (test: string) => {
    switch (test.toLowerCase()) {
      case 'math': return 'bg-blue-100 text-blue-800';
      case 'reading': return 'bg-purple-100 text-purple-800';
      case 'writing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-900 mb-2">No Questions Available</h3>
          <p className="text-orange-700">Unable to find questions for your weak areas at this time.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-green-600" />
            <span className="text-green-900">Quiz Complete!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalCorrect}/{totalQuestions}
            </div>
            <p className="text-green-700">
              You got {totalCorrect} out of {totalQuestions} questions correct!
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg text-center">
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-lg font-semibold">
                {Math.round((totalCorrect / totalQuestions) * 100)}%
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg text-center">
              <div className="text-sm text-gray-600">Time</div>
              <div className="text-lg font-semibold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg text-center">
              <div className="text-sm text-gray-600">Topics</div>
              <div className="text-lg font-semibold">{weaknessTopics.length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-green-900">Weakness Topics Practiced:</h4>
            <div className="flex flex-wrap gap-2">
              {weaknessTopics.map((topic, index) => (
                <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                  {topic}
                </Badge>
              ))}
            </div>
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
          <span className="text-orange-900">Target My Weakness Quiz</span>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-orange-700">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getTestColor(currentQuestion.test)}>
            {currentQuestion.test}
          </Badge>
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            {currentQuestion.skill}
          </Badge>
        </div>

        {/* Question Text */}
        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <h3 className="font-medium text-gray-900 mb-3">Question:</h3>
          <p className="text-gray-700 leading-relaxed">{currentQuestion.question_text}</p>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Choose your answer:</h4>
          {[
            { letter: 'A', text: currentQuestion.option_a },
            { letter: 'B', text: currentQuestion.option_b },
            { letter: 'C', text: currentQuestion.option_c },
            { letter: 'D', text: currentQuestion.option_d }
          ].map((option, index) => {
            const isSelected = selectedAnswer === option.letter;
            const isCorrect = option.letter === currentQuestion.correct_answer;
            const isWrong = showExplanation && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option.letter)}
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
                  <span className="font-medium">{option.letter}.</span>
                  <span>{option.text}</span>
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
              <p className="text-gray-700">{currentQuestion.correct_rationale}</p>
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
                  const timeSpent = Math.round((Date.now() - startTime) / 1000);
                  onQuizComplete?.({
                    correct: questionResults.filter(result => result).length + (selectedAnswer === currentQuestion.correct_answer ? 1 : 0),
                    total: totalQuestions,
                    timeSpent
                  });
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Quiz
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeaknessQuizMode;




