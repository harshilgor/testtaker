import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInfiniteQuestions } from '@/hooks/useInfiniteQuestions';
import { geminiQuestionService } from '@/services/geminiQuestionService';
import { Loader2, RefreshCw, Zap, CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const QuestionGenerationTest: React.FC = () => {
  const { questions, loading, error, generateQuestions, clearQuestions, aiUsed } = useInfiniteQuestions();
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const runComprehensiveTest = async () => {
    console.log('🧪 Starting comprehensive test...');
    
    try {
      // Test 1: Generate questions using the service
      await generateQuestions({
        subject: 'english',
        skill: 'Comprehension',
        domain: 'Information and Ideas',
        difficulty: 'easy',
        count: 2,
        useAI: true
      });

      // Test 2: Validate each question
      if (questions.length > 0) {
        const validationResults = questions.map((question, index) => {
          return validateQuestion(question, index + 1);
        });
        
        setTestResults({
          totalQuestions: questions.length,
          validQuestions: validationResults.filter(r => r.isValid).length,
          invalidQuestions: validationResults.filter(r => !r.isValid).length,
          details: validationResults
        });
      }

    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  const validateQuestion = (question: any, questionNumber: number) => {
    const validation = {
      questionNumber,
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      checks: {
        hasPassage: false,
        hasQuestion: false,
        hasAllOptions: false,
        hasCorrectAnswer: false,
        hasCorrectRationale: false,
        hasAllIncorrectRationales: false,
        correctAnswerFormat: false,
        rationaleQuality: false
      }
    };

    // Check passage
    if (question.question_prompt && question.question_prompt.trim().length > 50) {
      validation.checks.hasPassage = true;
    } else {
      validation.errors.push('Missing or too short passage');
      validation.isValid = false;
    }

    // Check question text
    if (question.question_text && question.question_text.trim().length > 10) {
      validation.checks.hasQuestion = true;
    } else {
      validation.errors.push('Missing or too short question text');
      validation.isValid = false;
    }

    // Check all options
    const options = [question.option_a, question.option_b, question.option_c, question.option_d];
    if (options.every(opt => opt && opt.trim().length > 5)) {
      validation.checks.hasAllOptions = true;
    } else {
      validation.errors.push('Missing or too short answer options');
      validation.isValid = false;
    }

    // Check correct answer
    if (question.correct_answer && ['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
      validation.checks.hasCorrectAnswer = true;
      validation.checks.correctAnswerFormat = true;
    } else {
      validation.errors.push('Invalid correct answer format');
      validation.isValid = false;
    }

    // Check correct rationale
    if (question.correct_rationale && question.correct_rationale.trim().length > 50) {
      validation.checks.hasCorrectRationale = true;
    } else {
      validation.errors.push('Missing or too short correct rationale');
      validation.isValid = false;
    }

    // Check incorrect rationales
    const incorrectRationales = [
      question.incorrect_rationale_a,
      question.incorrect_rationale_b,
      question.incorrect_rationale_c,
      question.incorrect_rationale_d
    ];
    if (incorrectRationales.every(rationale => rationale && rationale.trim().length > 30)) {
      validation.checks.hasAllIncorrectRationales = true;
    } else {
      validation.errors.push('Missing or too short incorrect rationales');
      validation.isValid = false;
    }

    // Check rationale quality (basic heuristics)
    const allRationales = [
      question.correct_rationale,
      ...incorrectRationales
    ];
    const hasGoodQuality = allRationales.every(rationale => 
      rationale && 
      rationale.length > 50 && 
      !rationale.includes('undefined') &&
      !rationale.includes('null')
    );
    
    if (hasGoodQuality) {
      validation.checks.rationaleQuality = true;
    } else {
      validation.warnings.push('Rationales may be low quality');
    }

    return validation;
  };

  const testDirectGeminiAPI = async () => {
    try {
      console.log('🔬 Testing direct Gemini API...');
      const response = await geminiQuestionService.generateTopicQuestions(
        'Comprehension',
        'Information and Ideas',
        'easy',
        1
      );
      
      setRawResponse(response[0]);
      console.log('✅ Direct API test successful:', response[0]);
    } catch (err) {
      console.error('❌ Direct API test failed:', err);
    }
  };

  const getValidationIcon = (isValid: boolean, hasWarnings: boolean = false) => {
    if (isValid && !hasWarnings) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isValid && hasWarnings) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Question Generation Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={runComprehensiveTest}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Run Full Test
            </Button>
            
            <Button 
              onClick={testDirectGeminiAPI}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Test Direct API
            </Button>
            
            <Button 
              onClick={clearQuestions}
              variant="secondary"
              className="flex items-center gap-2"
            >
              Clear All
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowRawResponse(!showRawResponse)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showRawResponse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRawResponse ? 'Hide' : 'Show'} Raw Response
            </Button>
            
            {aiUsed && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResults.totalQuestions}</div>
                <div className="text-sm text-blue-600">Total Questions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResults.validQuestions}</div>
                <div className="text-sm text-green-600">Valid Questions</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResults.invalidQuestions}</div>
                <div className="text-sm text-red-600">Invalid Questions</div>
              </div>
            </div>

            <div className="space-y-3">
              {testResults.details.map((detail: any) => (
                <div key={detail.questionNumber} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getValidationIcon(detail.isValid, detail.warnings.length > 0)}
                    <span className="font-medium">Question {detail.questionNumber}</span>
                    <Badge variant={detail.isValid ? "default" : "destructive"}>
                      {detail.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      {detail.checks.hasPassage ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Passage
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.hasQuestion ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Question
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.hasAllOptions ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Options
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.hasCorrectAnswer ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Correct Answer
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.hasCorrectRationale ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Correct Rationale
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.hasAllIncorrectRationales ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Incorrect Rationales
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.correctAnswerFormat ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      Answer Format
                    </div>
                    <div className="flex items-center gap-1">
                      {detail.checks.rationaleQuality ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                      Quality
                    </div>
                  </div>

                  {detail.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                      <strong>Errors:</strong> {detail.errors.join(', ')}
                    </div>
                  )}

                  {detail.warnings.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                      <strong>Warnings:</strong> {detail.warnings.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Response */}
      {showRawResponse && rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Gemini API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Generated Questions ({questions.length})
              {aiUsed && <Badge variant="secondary" className="ml-2">AI Enhanced</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.skill}</Badge>
                    {question.metadata?.generated && (
                      <Badge variant="secondary">AI Generated</Badge>
                    )}
                  </div>
                </div>

                {/* Passage */}
                {question.question_prompt && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">📖 Passage:</h4>
                    <p className="text-sm text-gray-700">{question.question_prompt}</p>
                  </div>
                )}

                {/* Question */}
                <div>
                  <h4 className="font-medium text-sm mb-2">❓ Question:</h4>
                  <p className="text-sm">{question.question_text}</p>
                </div>

                {/* Options */}
                <div>
                  <h4 className="font-medium text-sm mb-2">📝 Answer Options:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">A.</span> {question.option_a}
                    </div>
                    <div className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">B.</span> {question.option_b}
                    </div>
                    <div className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">C.</span> {question.option_c}
                    </div>
                    <div className="text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">D.</span> {question.option_d}
                    </div>
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-green-800">
                    ✅ Correct Answer: {question.correct_answer}
                  </h4>
                  <p className="text-sm text-green-700">{question.correct_rationale}</p>
                </div>

                {/* Incorrect Rationales */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">❌ Incorrect Answer Explanations:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-red-50 rounded">
                      <span className="font-medium text-red-800">A:</span> {question.incorrect_rationale_a}
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <span className="font-medium text-red-800">B:</span> {question.incorrect_rationale_b}
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <span className="font-medium text-red-800">C:</span> {question.incorrect_rationale_c}
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <span className="font-medium text-red-800">D:</span> {question.incorrect_rationale_d}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionGenerationTest;

