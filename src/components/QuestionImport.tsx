
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { questionService } from '@/services/questionService';

const QuestionImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const csvTemplate = `question_text,option_a,option_b,option_c,option_d,correct_answer,correct_rationale,incorrect_rationale_a,incorrect_rationale_b,incorrect_rationale_c,incorrect_rationale_d,section,skill,difficulty,domain,test_name,question_type
"If 3x + 7 = 22, what is the value of x?","3","5","7","15","B","Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.","This would be incorrect.","","This is the coefficient, not the value.","This would be if you forgot to divide.","math","Linear Equations","easy","Algebra","SAT Practice","multiple-choice"
"What is the area of a circle with radius 4?","8π","16π","32π","64π","B","Area = πr². With r = 4, area = π(4)² = 16π.","This is circumference formula.","","This uses wrong formula.","This uses wrong calculation.","math","Geometry","medium","Geometry","SAT Practice","multiple-choice"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const text = await file.text();
      const questionsData = parseCSV(text);
      
      if (questionsData.length === 0) {
        throw new Error('No valid questions found in the CSV file');
      }

      const insertedCount = await questionService.importQuestions(questionsData);
      setImportResult(`Successfully imported ${insertedCount} questions!`);
      
      // Clear question cache after import
      if ('marathonQuestionService' in window) {
        (window as any).marathonQuestionService.clearCache();
      }
    } catch (err: any) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-6 w-6" />
            <span>Question Bank Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Columns */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Required CSV Columns:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code>question_text</code>
              <code>option_a, option_b, option_c, option_d</code>
              <code>correct_answer</code>
              <code>correct_rationale</code>
              <code>section</code>
              <code>skill</code>
              <code>difficulty</code>
              <code>domain</code>
              <code>test_name</code>
              <code>question_type</code>
            </div>
          </div>

          {/* Download Template */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Download the template with correct format and example questions.
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Questions
            </h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Status Messages */}
          {importing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Importing questions...</span>
            </div>
          )}

          {importResult && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span>{importResult}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionImport;
