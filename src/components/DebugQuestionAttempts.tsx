import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const DebugQuestionAttempts: React.FC = () => {
  const { user } = useAuth();
  const { questionAttempts, isInitialized } = useData();
  const [dbAttempts, setDbAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDbAttempts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching attempts:', error);
      } else {
        setDbAttempts(data || []);
        console.log('🔍 Direct DB fetch results:', data);
      }
    } catch (error) {
      console.error('Error in fetchDbAttempts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbAttempts();
  }, [user?.id]);

  const incorrectDbAttempts = dbAttempts.filter(a => !a.is_correct);
  const incorrectContextAttempts = questionAttempts.filter(a => !a.is_correct);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg m-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-4">🔍 Debug: Question Attempts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-800">DataContext Results</h4>
          <p className="text-sm text-gray-600">Initialized: {isInitialized ? 'Yes' : 'No'}</p>
          <p className="text-sm text-gray-600">Total attempts: {questionAttempts.length}</p>
          <p className="text-sm text-gray-600">Incorrect attempts: {incorrectContextAttempts.length}</p>
          <div className="mt-2">
            <h5 className="text-xs font-medium text-gray-700">Sample incorrect attempts:</h5>
            {incorrectContextAttempts.slice(0, 3).map((attempt, index) => (
              <div key={index} className="text-xs text-gray-600 mt-1">
                ID: {attempt.id}, Q: {attempt.question_id}, Correct: {attempt.is_correct ? 'Yes' : 'No'}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-800">Direct DB Results</h4>
          <p className="text-sm text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
          <p className="text-sm text-gray-600">Total attempts: {dbAttempts.length}</p>
          <p className="text-sm text-gray-600">Incorrect attempts: {incorrectDbAttempts.length}</p>
          <div className="mt-2">
            <h5 className="text-xs font-medium text-gray-700">Sample incorrect attempts:</h5>
            {incorrectDbAttempts.slice(0, 3).map((attempt, index) => (
              <div key={index} className="text-xs text-gray-600 mt-1">
                ID: {attempt.id}, Q: {attempt.question_id}, Correct: {attempt.is_correct ? 'Yes' : 'No'}
              </div>
            ))}
          </div>
          <button 
            onClick={fetchDbAttempts}
            className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Refresh DB Data
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold text-gray-800 mb-2">Analysis</h4>
        <div className="text-sm text-gray-600">
          <p>• DataContext initialized: {isInitialized ? '✅' : '❌'}</p>
          <p>• DB has data: {dbAttempts.length > 0 ? '✅' : '❌'}</p>
          <p>• Context has data: {questionAttempts.length > 0 ? '✅' : '❌'}</p>
          <p>• DB has incorrect attempts: {incorrectDbAttempts.length > 0 ? '✅' : '❌'}</p>
          <p>• Context has incorrect attempts: {incorrectContextAttempts.length > 0 ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugQuestionAttempts;
