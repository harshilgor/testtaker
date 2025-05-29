
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { questionService, DatabaseQuestion } from '@/services/questionService';
import { supabase } from '@/integrations/supabase/client';

interface QuestionStats {
  total: number;
  bySection: Record<string, number>;
  byDifficulty: Record<string, number>;
  bySkill: Record<string, number>;
}

const QuestionBankManagement: React.FC = () => {
  const [questions, setQuestions] = useState<DatabaseQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<DatabaseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<QuestionStats | null>(null);

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (questionList: DatabaseQuestion[]): QuestionStats => {
    const stats: QuestionStats = {
      total: questionList.length,
      bySection: {},
      byDifficulty: {},
      bySkill: {}
    };

    questionList.forEach(q => {
      // Section stats
      stats.bySection[q.section] = (stats.bySection[q.section] || 0) + 1;
      
      // Difficulty stats
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      
      // Skill stats
      stats.bySkill[q.skill] = (stats.bySkill[q.skill] || 0) + 1;
    });

    return stats;
  };

  // Filter questions based on selected criteria
  const filterQuestions = () => {
    let filtered = questions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Section filter
    if (selectedSection !== 'all') {
      filtered = filtered.filter(q => q.section === selectedSection);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Skill filter
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(q => q.skill === selectedSkill);
    }

    setFilteredQuestions(filtered);
  };

  // Toggle row expansion
  const toggleRowExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedRows(newExpanded);
  };

  // Toggle question active status
  const toggleQuestionStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({ is_active: !currentStatus })
        .eq('id', questionId);

      if (error) throw error;
      
      // Refresh questions
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question status:', error);
    }
  };

  // Export questions as CSV
  const exportQuestions = () => {
    const csvContent = [
      // Header
      ['ID', 'Section', 'Skill', 'Difficulty', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Type'].join(','),
      // Data
      ...filteredQuestions.map(q => [
        q.id,
        q.section,
        q.skill,
        q.difficulty,
        `"${q.question_text.replace(/"/g, '""')}"`,
        `"${q.option_a.replace(/"/g, '""')}"`,
        `"${q.option_b.replace(/"/g, '""')}"`,
        `"${q.option_c.replace(/"/g, '""')}"`,
        `"${q.option_d.replace(/"/g, '""')}"`,
        q.correct_answer,
        q.question_type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const getUniqueValues = (field: keyof DatabaseQuestion) => {
    return Array.from(new Set(questions.map(q => q[field] as string))).sort();
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setStats(calculateStats(questions));
      filterQuestions();
    }
  }, [questions, searchTerm, selectedSection, selectedDifficulty, selectedSkill]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading questions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Math Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bySection.math || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading-Writing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bySection['reading-writing'] || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.bySkill).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters and Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {getUniqueValues('section').map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {getUniqueValues('difficulty').map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {getUniqueValues('skill').map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={exportQuestions} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <React.Fragment key={question.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(question.id)}
                        >
                          {expandedRows.has(question.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">
                          {question.question_text.substring(0, 100)}
                          {question.question_text.length > 100 && '...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.section}</Badge>
                      </TableCell>
                      <TableCell>{question.skill}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            question.difficulty === 'easy' ? 'default' :
                            question.difficulty === 'medium' ? 'secondary' : 'destructive'
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.question_type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.correct_answer}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionStatus(question.id, question.is_active)}
                        >
                          {question.is_active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedRows.has(question.id) && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Full Question:</h4>
                              <p className="text-sm">{question.question_text}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Options:</h4>
                                <div className="space-y-1 text-sm">
                                  <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100' : 'bg-white'}`}>
                                    <strong>A:</strong> {question.option_a}
                                  </div>
                                  <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100' : 'bg-white'}`}>
                                    <strong>B:</strong> {question.option_b}
                                  </div>
                                  <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100' : 'bg-white'}`}>
                                    <strong>C:</strong> {question.option_c}
                                  </div>
                                  <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100' : 'bg-white'}`}>
                                    <strong>D:</strong> {question.option_d}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Explanation:</h4>
                                <p className="text-sm bg-white p-2 rounded">{question.correct_rationale}</p>
                                
                                <div className="mt-4">
                                  <h4 className="font-semibold mb-2">Metadata:</h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Domain:</strong> {question.domain}</div>
                                    <div><strong>Test:</strong> {question.test_name}</div>
                                    <div><strong>Created:</strong> {new Date(question.created_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionBankManagement;
