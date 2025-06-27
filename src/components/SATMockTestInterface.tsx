
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Flag, X, Volume2, VolumeX } from 'lucide-react';

interface Question {
  id: number;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
}

interface SATMockTestInterfaceProps {
  onBack: () => void;
}

const SATMockTestInterface: React.FC<SATMockTestInterfaceProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [eliminatedAnswers, setEliminatedAnswers] = useState<{ [key: number]: Set<number> }>({});
  const [eliminateMode, setEliminateMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(31 * 60 + 20); // 31:20 as shown in screenshot
  const [isMuted, setIsMuted] = useState(false);

  // Sample question data
  const questions: Question[] = Array.from({ length: 27 }, (_, i) => ({
    id: i + 1,
    content: i === 0 
      ? "During a spirited class debate about the most influential technological innovations of the 21st century, one student asserted that social media platforms have ____ our ability to communicate effectively. She argued that while these platforms have increased the quantity of our communication, the quality and depth have significantly diminished."
      : `Sample question ${i + 1} content goes here...`,
    passage: i === 0 
      ? undefined
      : "Sample passage content for context...",
    options: [
      "enhanced",
      "expanded", 
      "undermined",
      "diversified"
    ],
    correctAnswer: 2
  }));

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (!eliminateMode) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const handleEliminateAnswer = (questionId: number, answerIndex: number) => {
    if (eliminateMode) {
      setEliminatedAnswers(prev => {
        const questionEliminated = prev[questionId] || new Set();
        const newEliminated = new Set(questionEliminated);
        
        if (newEliminated.has(answerIndex)) {
          newEliminated.delete(answerIndex);
        } else {
          newEliminated.add(answerIndex);
        }
        
        return {
          ...prev,
          [questionId]: newEliminated
        };
      });
    }
  };

  const toggleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const currentQuestionData = questions[currentQuestion - 1];
  const currentEliminated = eliminatedAnswers[currentQuestion] || new Set();
  const currentAnswer = selectedAnswers[currentQuestion];

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
            SAT
          </div>
          <span className="text-sm">Section 1, Module 1: Reading and Writing</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-lg font-mono">
            <span>{formatTime(timeRemaining)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:bg-slate-700 p-1"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span>Eliminate Answers</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={setEliminateMode}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Question Navigator */}
        <div className="w-20 bg-slate-800 text-white p-4">
          <div className="text-xs text-slate-400 mb-4 text-center">QUESTIONS</div>
          <div className="space-y-2">
            {Array.from({ length: 27 }, (_, i) => {
              const questionNum = i + 1;
              const isAnswered = selectedAnswers[questionNum] !== undefined;
              const isMarked = markedForReview.has(questionNum);
              const isCurrent = currentQuestion === questionNum;
              
              return (
                <button
                  key={questionNum}
                  onClick={() => setCurrentQuestion(questionNum)}
                  className={`w-8 h-8 rounded-full text-xs font-medium border-2 transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isAnswered
                      ? 'bg-slate-600 border-slate-600 text-white'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  } ${isMarked ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {questionNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Question Content */}
          <div className="flex-1 bg-white p-8">
            <div className="max-w-4xl">
              <div className="mb-6">
                <p className="text-lg leading-relaxed text-gray-900">
                  {currentQuestionData.content}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="mark-review"
                    checked={markedForReview.has(currentQuestion)}
                    onCheckedChange={() => toggleMarkForReview(currentQuestion)}
                  />
                  <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
                    Mark for Review
                  </label>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Choose the most appropriate alternative to line 1. If the original version is best, choose "NO CHANGE."
                </div>

                <RadioGroup 
                  value={currentAnswer?.toString() || ""} 
                  onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option, index) => {
                    const isEliminated = currentEliminated.has(index);
                    const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 ${
                          isEliminated ? 'opacity-50 bg-gray-100' : 'bg-white'
                        } ${currentAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <RadioGroupItem 
                            value={index.toString()} 
                            id={`option-${index}`}
                            disabled={isEliminated}
                            className="text-blue-600"
                          />
                          <label 
                            htmlFor={`option-${index}`} 
                            className="cursor-pointer flex-1 flex items-center"
                          >
                            <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                              {optionLabel}
                            </span>
                            <span className={isEliminated ? 'line-through text-gray-400' : 'text-gray-900'}>
                              {option}
                            </span>
                          </label>
                        </div>
                        
                        {eliminateMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminateAnswer(currentQuestion, index)}
                            className={`p-1 h-6 w-6 ${
                              isEliminated 
                                ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Question {currentQuestion} of 27
        </div>
        
        <Button
          onClick={() => setCurrentQuestion(prev => Math.min(27, prev + 1))}
          disabled={currentQuestion >= 27}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SATMockTestInterface;
