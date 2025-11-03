import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LearningPlanCardProps {
  onEdit?: () => void;
}

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
  { key: 'T2', label: 'T' },
  { key: 'F', label: 'F' },
  { key: 'S', label: 'S' },
  { key: 'S2', label: 'S' },
];

const LEARNING_PLAN_KEY = 'userLearningPlan';

const LearningPlanCard: React.FC<LearningPlanCardProps> = ({ onEdit }) => {
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    M: true,
    T: true,
    W: true,
    T2: true,
    F: true,
    S: true,
    S2: true,
  });
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    // Check if user has a saved learning plan
    const savedPlan = localStorage.getItem(LEARNING_PLAN_KEY);
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        if (parsed.days) {
          setActiveDays(parsed.days);
        }
        setHasPlan(true);
      } catch (e) {
        // Invalid saved plan, treat as no plan
        setHasPlan(false);
      }
    } else {
      setHasPlan(false);
    }
  }, []);

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Learning plan</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4">
          I'm committed to learning 7 days a week on get1600.
        </p>

        <div className="flex items-center gap-3 mb-4">
          {DAYS.map((d) => (
            <span
              key={d.key}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full border text-sm font-medium transition-colors ${
                activeDays[d.key]
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
              aria-label={d.label}
            >
              {d.label}
            </span>
          ))}
        </div>

        <Button variant="link" className="p-0 h-auto text-blue-600" onClick={handleEdit}>
          {hasPlan ? 'Edit my learning plan' : 'Create Study Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LearningPlanCard;


