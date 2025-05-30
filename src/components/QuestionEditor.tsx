
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

interface QuestionEditorProps {
  question: DatabaseQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: DatabaseQuestion) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<DatabaseQuestion>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({ ...question });
    } else {
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        correct_rationale: '',
        incorrect_rationale_a: '',
        incorrect_rationale_b: '',
        incorrect_rationale_c: '',
        incorrect_rationale_d: '',
        section: 'math',
        skill: '',
        difficulty: 'medium',
        domain: '',
        test_name: 'SAT',
        question_type: 'multiple-choice',
        is_active: true,
        metadata: {}
      });
    }
  }, [question]);

  const handleImageUpload = (imageUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        image_url: imageUrl
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.question_text || !formData.skill) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        question_text: formData.question_text,
        option_a: formData.option_a || '',
        option_b: formData.option_b || '',
        option_c: formData.option_c || '',
        option_d: formData.option_d || '',
        correct_answer: formData.correct_answer || 'A',
        correct_rationale: formData.correct_rationale || '',
        incorrect_rationale_a: formData.incorrect_rationale_a || '',
        incorrect_rationale_b: formData.incorrect_rationale_b || '',
        incorrect_rationale_c: formData.incorrect_rationale_c || '',
        incorrect_rationale_d: formData.incorrect_rationale_d || '',
        section: formData.section || 'math',
        skill: formData.skill || '',
        difficulty: formData.difficulty || 'medium',
        domain: formData.domain || '',
        test_name: formData.test_name || 'SAT',
        question_type: formData.question_type || 'multiple-choice'
      };

      if (question?.id) {
        // Update existing question
        const { data, error } = await supabase
          .from('main_question_bank')
          .update(updateData)
          .eq('id', parseInt(question.id))
          .select()
          .single();

        if (error) throw error;
        
        // Convert the response to match DatabaseQuestion interface
        const convertedData: DatabaseQuestion = {
          ...data,
          id: data.id?.toString() || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {}
        };
        onSave(convertedData);
      } else {
        // Create new question
        const { data, error } = await supabase
          .from('main_question_bank')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        
        // Convert the response to match DatabaseQuestion interface
        const convertedData: DatabaseQuestion = {
          ...data,
          id: data.id?.toString() || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {}
        };
        onSave(convertedData);
      }

      toast.success(question?.id ? 'Question updated successfully' : 'Question created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentImageUrl = () => {
    return formData.metadata?.image_url || null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question?.id ? 'Edit Question' : 'Create New Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <Label htmlFor="question_text">Question Text *</Label>
            <Textarea
              id="question_text"
              value={formData.question_text || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              placeholder="Enter the question text..."
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Question Image</Label>
            <ImageUpload
              currentImageUrl={getCurrentImageUrl()}
              onImageUpload={handleImageUpload}
              disabled={saving}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="option_a">Option A</Label>
              <Textarea
                id="option_a"
                value={formData.option_a || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, option_a: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="option_b">Option B</Label>
              <Textarea
                id="option_b"
                value={formData.option_b || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, option_b: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="option_c">Option C</Label>
              <Textarea
                id="option_c"
                value={formData.option_c || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, option_c: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="option_d">Option D</Label>
              <Textarea
                id="option_d"
                value={formData.option_d || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, option_d: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={formData.correct_answer || 'A'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rationales */}
          <div>
            <Label htmlFor="correct_rationale">Correct Answer Explanation</Label>
            <Textarea
              id="correct_rationale"
              value={formData.correct_rationale || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, correct_rationale: e.target.value }))}
              placeholder="Explain why this answer is correct..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incorrect_rationale_a">Why A is wrong (if not correct)</Label>
              <Textarea
                id="incorrect_rationale_a"
                value={formData.incorrect_rationale_a || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, incorrect_rationale_a: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="incorrect_rationale_b">Why B is wrong (if not correct)</Label>
              <Textarea
                id="incorrect_rationale_b"
                value={formData.incorrect_rationale_b || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, incorrect_rationale_b: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="incorrect_rationale_c">Why C is wrong (if not correct)</Label>
              <Textarea
                id="incorrect_rationale_c"
                value={formData.incorrect_rationale_c || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, incorrect_rationale_c: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="incorrect_rationale_d">Why D is wrong (if not correct)</Label>
              <Textarea
                id="incorrect_rationale_d"
                value={formData.incorrect_rationale_d || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, incorrect_rationale_d: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Section</Label>
              <Select
                value={formData.section || 'math'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
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
            <div>
              <Label htmlFor="skill">Skill/Topic *</Label>
              <Input
                id="skill"
                value={formData.skill || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, skill: e.target.value }))}
                placeholder="e.g., Algebra, Geometry"
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty || 'medium'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={formData.domain || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="e.g., Heart of Algebra"
              />
            </div>
            <div>
              <Label>Question Type</Label>
              <Select
                value={formData.question_type || 'multiple-choice'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditor;
