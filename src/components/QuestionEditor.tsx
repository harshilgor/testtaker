
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, Save, AlertCircle } from 'lucide-react';
import { DatabaseQuestion } from '@/services/questionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuestionEditorProps {
  question: DatabaseQuestion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuestion: DatabaseQuestion) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_answer: question.correct_answer,
    correct_rationale: question.correct_rationale,
    incorrect_rationale_a: question.incorrect_rationale_a || '',
    incorrect_rationale_b: question.incorrect_rationale_b || '',
    incorrect_rationale_c: question.incorrect_rationale_c || '',
    incorrect_rationale_d: question.incorrect_rationale_d || '',
    section: question.section,
    skill: question.skill,
    difficulty: question.difficulty,
    domain: question.domain,
    test_name: question.test_name,
    question_type: question.question_type
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (!formData.option_a.trim()) {
      newErrors.option_a = 'Option A is required';
    }

    if (!formData.option_b.trim()) {
      newErrors.option_b = 'Option B is required';
    }

    if (!formData.option_c.trim()) {
      newErrors.option_c = 'Option C is required';
    }

    if (!formData.option_d.trim()) {
      newErrors.option_d = 'Option D is required';
    }

    if (!formData.correct_answer) {
      newErrors.correct_answer = 'Correct answer is required';
    }

    if (!formData.correct_rationale.trim()) {
      newErrors.correct_rationale = 'Correct rationale is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('question_bank')
        .update({
          question_text: formData.question_text,
          option_a: formData.option_a,
          option_b: formData.option_b,
          option_c: formData.option_c,
          option_d: formData.option_d,
          correct_answer: formData.correct_answer,
          correct_rationale: formData.correct_rationale,
          incorrect_rationale_a: formData.incorrect_rationale_a || null,
          incorrect_rationale_b: formData.incorrect_rationale_b || null,
          incorrect_rationale_c: formData.incorrect_rationale_c || null,
          incorrect_rationale_d: formData.incorrect_rationale_d || null,
          section: formData.section,
          skill: formData.skill,
          difficulty: formData.difficulty,
          domain: formData.domain,
          test_name: formData.test_name,
          question_type: formData.question_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id)
        .select()
        .single();

      if (error) throw error;

      const updatedQuestion = { ...question, ...formData };
      onSave(updatedQuestion);
      toast.success('Question updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Question</span>
            <Badge variant="outline">{question.section}</Badge>
            <Badge variant="secondary">{question.difficulty}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Enter the question text..."
              rows={4}
              className={errors.question_text ? 'border-red-500' : ''}
            />
            {errors.question_text && (
              <div className="flex items-center space-x-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.question_text}</span>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Answer Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => {
                const fieldName = `option_${option.toLowerCase()}` as keyof typeof formData;
                const isCorrect = formData.correct_answer === option;
                
                return (
                  <div key={option} className="space-y-2">
                    <Label htmlFor={fieldName} className="flex items-center space-x-2">
                      <span>Option {option}</span>
                      {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id={fieldName}
                        value={formData[fieldName]}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        placeholder={`Enter option ${option}...`}
                        className={`flex-1 ${errors[fieldName] ? 'border-red-500' : ''} ${
                          isCorrect ? 'border-green-500 bg-green-50' : ''
                        }`}
                      />
                    </div>
                    {errors[fieldName] && (
                      <div className="flex items-center space-x-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors[fieldName]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Correct Answer Selection */}
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select 
              value={formData.correct_answer} 
              onValueChange={(value) => handleInputChange('correct_answer', value)}
            >
              <SelectTrigger className={errors.correct_answer ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
            {errors.correct_answer && (
              <div className="flex items-center space-x-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.correct_answer}</span>
              </div>
            )}
          </div>

          {/* Rationales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Explanations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Correct Rationale */}
              <div className="space-y-2">
                <Label htmlFor="correct_rationale">Correct Answer Explanation</Label>
                <Textarea
                  id="correct_rationale"
                  value={formData.correct_rationale}
                  onChange={(e) => handleInputChange('correct_rationale', e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  rows={3}
                  className={errors.correct_rationale ? 'border-red-500' : ''}
                />
                {errors.correct_rationale && (
                  <div className="flex items-center space-x-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.correct_rationale}</span>
                  </div>
                )}
              </div>

              {/* Incorrect Rationales */}
              {['A', 'B', 'C', 'D'].map((option) => {
                const fieldName = `incorrect_rationale_${option.toLowerCase()}` as keyof typeof formData;
                const isCorrect = formData.correct_answer === option;
                
                if (isCorrect) return null;
                
                return (
                  <div key={option} className="space-y-2">
                    <Label htmlFor={fieldName}>Why Option {option} is Wrong (Optional)</Label>
                    <Textarea
                      id={fieldName}
                      value={formData[fieldName]}
                      onChange={(e) => handleInputChange(fieldName, e.target.value)}
                      placeholder={`Explain why option ${option} is incorrect...`}
                      rows={2}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <Select 
                  value={formData.section} 
                  onValueChange={(value) => handleInputChange('section', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="reading-writing">Reading-Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Skill</Label>
                <Input
                  value={formData.skill}
                  onChange={(e) => handleInputChange('skill', e.target.value)}
                  placeholder="e.g., Algebra, Reading Comprehension"
                />
              </div>

              <div className="space-y-2">
                <Label>Domain</Label>
                <Input
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="e.g., Algebra and Functions"
                />
              </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select 
                  value={formData.question_type} 
                  onValueChange={(value) => handleInputChange('question_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="grid-in">Grid-In</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  value={formData.test_name}
                  onChange={(e) => handleInputChange('test_name', e.target.value)}
                  placeholder="e.g., SAT Practice Test 1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditor;
