import React from 'react';
import { CheckCircle, Circle, Flag, Clock } from 'lucide-react';

interface QuizSidebarProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
  onBack: () => void;
  subject: string;
  topics: string[];
  timeRemaining: number;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  answerCorrectness: (boolean | null)[];
}

const QuizSidebar: React.FC<QuizSidebarProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
  onBack,
  subject,
  topics,
  timeRemaining,
  isCollapsed,
  onToggleSidebar,
  answerCorrectness
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return 'current';
    if (answers[index] !== null) {
      // Check if answer is correct or incorrect
      const isCorrect = answerCorrectness[index];
      if (isCorrect === true) return 'correct';
      if (isCorrect === false) return 'incorrect';
      return 'answered';
    }
    if (flaggedQuestions[index]) return 'flagged';
    return 'unanswered';
  };

  const getStatusIcon = (index: number) => {
    const status = getQuestionStatus(index);
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) {
      return <Circle className="h-4 w-4 text-blue-400" fill="currentColor" />;
    }
    
    if (status === 'correct') {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    
    if (status === 'incorrect') {
      return <div className="h-4 w-4 text-red-400 flex items-center justify-center">
        <span className="text-xs font-bold">✕</span>
      </div>;
    }
    
    if (flaggedQuestions[index]) {
      return <Flag className="h-4 w-4 text-orange-400" />;
    }
    
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (index: number) => {
    const status = getQuestionStatus(index);
    switch (status) {
      case 'current':
        return 'Current';
      case 'correct':
        return 'Correct';
      case 'incorrect':
        return 'Incorrect';
      case 'answered':
        return 'Answered';
      case 'flagged':
        return 'Flagged';
      default:
        return 'Unanswered';
    }
  };

  const getQuestionPreview = (question: any, index: number) => {
    // Truncate question text for preview
    const maxLength = 50;
    let preview = '';
    
    if (question.question) {
      preview = question.question;
    } else if (question.question_prompt) {
      preview = question.question_prompt;
    } else {
      preview = `Question ${index + 1}`;
    }
    
    return preview.length > maxLength 
      ? preview.substring(0, maxLength) + '...' 
      : preview;
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 text-white h-full flex flex-col">
        {/* Collapsed Header */}
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={onToggleSidebar}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <div className="w-6 h-6 flex flex-col space-y-1">
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
        
        {/* Collapsed Question List */}
        <div className="flex-1 overflow-y-auto p-2">
          {questions.map((question, index) => {
            const status = getQuestionStatus(index);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={index}
                onClick={() => onGoToQuestion(index)}
                className={`w-full p-2 mb-1 rounded transition-colors ${
                  isCurrent 
                    ? 'bg-blue-600' 
                    : status === 'correct'
                      ? 'bg-green-600/20'
                      : status === 'incorrect'
                        ? 'bg-red-600/20'
                        : status === 'flagged'
                          ? 'bg-orange-600/20'
                          : 'bg-slate-700'
                }`}
                title={`Question ${index + 1}: ${getQuestionPreview(question, index)}`}
              >
                {getStatusIcon(index)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-white">
            Get1600.co
          </div>
          <button
            onClick={onToggleSidebar}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <div className="w-4 h-4 flex flex-col space-y-0.5">
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
        <div className="text-sm text-gray-300 mb-3">
          {topics.join(', ')}
        </div>
        {/* Exit Quiz Button */}
        <button
          onClick={onBack}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
        >
          Exit Quiz
        </button>
      </div>

      {/* Today's Questions */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            TODAY'S QUESTIONS
          </h3>
          <div className="space-y-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(index);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => onGoToQuestion(index)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : status === 'correct'
                        ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                        : status === 'incorrect'
                          ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                          : status === 'flagged'
                            ? 'bg-orange-600/20 text-orange-300 hover:bg-orange-600/30'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(index)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {getQuestionPreview(question, index)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-sm text-gray-300 mb-2">Progress</div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Answered: {answers.filter(a => a !== null).length}</span>
          <span>Total: {questions.length}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(answers.filter(a => a !== null).length / questions.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizSidebar;
