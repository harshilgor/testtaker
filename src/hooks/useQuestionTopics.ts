
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';

interface TopicData {
  id: string;
  skill: string;
  name: string;
  description: string;
  count: number;
  domain?: string;
  question_count?: number;
}

export const useQuestionTopics = (subject: Subject) => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        console.log('=== FETCHING TOPICS DEBUG ===');
        console.log('Subject:', subject);
        setError(null);
        
        // Map subject to database test field
        const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
        
        // Fetch topics using correct database structure
        const { data, error: fetchError } = await supabase
          .from('question_bank')
          .select('skill, domain, test, assessment')
          .eq('assessment', 'SAT')
          .eq('test', testFilter)
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (fetchError) {
          console.error('Topics error:', fetchError);
          throw fetchError;
        }

        console.log('Raw data from database:', data);
        console.log('Total records found:', data?.length || 0);

        // Debug: Log all unique skills with their exact values
        const allSkills = data?.map(item => item.skill) || [];
        console.log('All skills from database:', allSkills);

        // Create a simple count map using exact skill names (preserve original casing)
        const skillCounts: Record<string, { count: number; domain?: string; skill: string }> = {};
        
        data?.forEach(item => {
          if (item.skill) {
            const exactSkill = item.skill.trim(); // Only trim whitespace
            
            if (!skillCounts[exactSkill]) {
              skillCounts[exactSkill] = { 
                count: 0, 
                domain: item.domain,
                skill: exactSkill
              };
            }
            skillCounts[exactSkill].count++;
            
            console.log(`Counting skill: "${exactSkill}" -> ${skillCounts[exactSkill].count}`);
          }
        });

        console.log('Final skill counts:', skillCounts);

        // Convert to array format with proper structure
        const topicsArray = Object.entries(skillCounts).map(([skillName, data]) => ({
          id: skillName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          skill: data.skill, // Use exact original skill name
          name: data.skill,
          description: `Practice ${data.skill} problems`,
          count: data.count,
          question_count: data.count,
          domain: data.domain
        }));

        console.log('Final topics array:', topicsArray);
        
        // Debug: Show specific analysis topic
        const analysisTopics = topicsArray.filter(t => 
          t.skill.toLowerCase().includes('analysis')
        );
        console.log('Analysis topics found:', analysisTopics);
        
        setTopics(topicsArray);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        
        // Provide fallback topics if database fails
        const fallbackTopics = subject === 'math' ? [
          { id: 'linear-equations', skill: 'Linear Equations', name: 'Linear Equations', description: 'Practice Linear Equations problems', count: 50, question_count: 50 },
          { id: 'quadratic-functions', skill: 'Quadratic Functions', name: 'Quadratic Functions', description: 'Practice Quadratic Functions problems', count: 40, question_count: 40 },
        ] : [
          { id: 'grammar', skill: 'Grammar', name: 'Grammar', description: 'Practice Grammar problems', count: 60, question_count: 60 },
          { id: 'reading-comprehension', skill: 'Reading Comprehension', name: 'Reading Comprehension', description: 'Practice Reading Comprehension problems', count: 45, question_count: 45 },
        ];
        
        setTopics(fallbackTopics);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject]);

  return { topics, loading, error };
};
