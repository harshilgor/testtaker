import { supabase } from '@/integrations/supabase/client';

export interface DailyTask {
  id: string;
  date: string; // ISO date string
  type: 'practice' | 'review' | 'mock_exam' | 'drill' | 'skill_focus';
  subject: 'math' | 'reading-writing' | 'both';
  skill?: string;
  domain?: string;
  title: string;
  description: string;
  questions?: number;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  phase: 'foundation' | 'strengthening' | 'mastery';
}

export interface StudyPlan {
  id: string;
  userId: string;
  testDate: string;
  currentScore: number;
  dreamScore: number;
  studyDays: Record<string, boolean>;
  studyHours: number;
  totalDays: number;
  studyDaysCount: number;
  dailyTasks: DailyTask[];
  phases: {
    foundation: number;
    strengthening: number;
    mastery: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface LearningPlanInput {
  testDate: string;
  dreamScore: number;
  days: Record<string, boolean>;
  studyHours: number;
}

// Math domains and skills
const MATH_DOMAINS = [
  { domain: 'Heart of Algebra', skills: ['Linear Equations', 'Linear Functions', 'Systems of Linear Equations', 'Linear Inequalities'] },
  { domain: 'Passport to Advanced Math', skills: ['Polynomial Operations', 'Quadratic Functions', 'Exponential Functions', 'Rational Functions'] },
  { domain: 'Problem Solving and Data Analysis', skills: ['Ratios and Proportions', 'Percentages', 'Data Analysis', 'Statistics', 'Probability'] },
  { domain: 'Additional Topics in Math', skills: ['Geometry', 'Trigonometry', 'Complex Numbers', 'Volume', 'Area'] }
];

// Reading & Writing skills
const READING_WRITING_SKILLS = [
  'Comprehension',
  'Command of Evidence',
  'Central Ideas and Details',
  'Words in Context',
  'Transitions',
  'Rhetorical Synthesis',
  'Form, Structure, and Sense',
  'Boundaries'
];

/**
 * Calculate current score from user attempts
 */
export async function calculateCurrentScore(userId: string): Promise<number> {
  try {
    const { data: attempts, error } = await supabase
      .from('question_attempts_v2')
      .select('is_correct, difficulty, time_spent')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100); // Use last 100 attempts for accuracy

    if (error || !attempts || attempts.length === 0) {
      return 1200; // Default starting score
    }

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const accuracy = correctAttempts / totalAttempts;

    // Calculate average time per question
    const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const avgTimePerQuestion = totalTime / totalAttempts;

    // Base score calculation
    const baseScore = 800 + (accuracy * 800);
    
    // Adjust based on time (faster = better score, target is ~90 seconds per question)
    const timeAdjustment = Math.max(-100, Math.min(100, (90 - avgTimePerQuestion) * 2));
    
    // Adjust based on difficulty
    const difficultyAdjustment = attempts.reduce((sum, attempt) => {
      const difficulty = attempt.difficulty?.toLowerCase();
      if (difficulty === 'easy') return sum + 0;
      if (difficulty === 'medium') return sum + 50;
      if (difficulty === 'hard') return sum + 100;
      return sum;
    }, 0) / totalAttempts;

    const totalScore = Math.min(1600, Math.max(400, baseScore + timeAdjustment + difficultyAdjustment));
    return Math.round(totalScore);
  } catch (error) {
    console.error('Error calculating current score:', error);
    return 1200; // Default fallback
  }
}

/**
 * Get available skills from database
 */
async function getAvailableSkills(): Promise<{ math: string[]; readingWriting: string[] }> {
  try {
    const [mathData, rwData] = await Promise.all([
      supabase
        .from('question_bank')
        .select('skill, domain')
        .eq('assessment', 'SAT')
        .eq('test', 'Math')
        .not('skill', 'is', null),
      supabase
        .from('question_bank')
        .select('skill, domain')
        .eq('assessment', 'SAT')
        .eq('test', 'Reading and Writing')
        .not('skill', 'is', null)
    ]);

    const mathSkills = new Set<string>();
    const readingWritingSkills = new Set<string>();

    mathData.data?.forEach(row => {
      if (row.skill) mathSkills.add(row.skill);
    });

    rwData.data?.forEach(row => {
      if (row.skill) readingWritingSkills.add(row.skill);
    });

    return {
      math: Array.from(mathSkills),
      readingWriting: Array.from(readingWritingSkills)
    };
  } catch (error) {
    console.error('Error fetching skills:', error);
    return {
      math: MATH_DOMAINS.flatMap(d => d.skills),
      readingWriting: READING_WRITING_SKILLS
    };
  }
}

type PhaseType = 'foundation' | 'strengthening' | 'mastery';

interface PendingTask extends Omit<DailyTask, 'id' | 'completed' | 'completedAt'> {}

const createSkillTasks = (
  subject: 'math' | 'reading-writing',
  skills: string[],
  startIndex: number,
  dateStr: string,
  phase: PhaseType,
  type: 'practice' | 'skill_focus',
  studyHours: number,
  options?: {
    descriptionPrefix?: string;
    maxTasks?: number;
    randomize?: boolean;
  }
): { tasks: PendingTask[]; nextIndex: number } => {
  const perQuestionMinutes = subject === 'math' ? 2 : 1.5;
  const taskMinutes = Math.round(perQuestionMinutes * 20);
  const desiredMinutes = Math.max(taskMinutes, studyHours * 60);
  const calculatedTasks = Math.max(1, Math.round(desiredMinutes / taskMinutes));
  const maxTasks = options?.maxTasks ?? 3;
  const numberOfTasks = Math.min(maxTasks, calculatedTasks);

  const tasks: PendingTask[] = [];
  let currentIndex = startIndex;

  for (let i = 0; i < numberOfTasks; i++) {
    const skill = skills.length > 0
      ? options?.randomize
        ? skills[Math.floor(Math.random() * skills.length)]
        : skills[currentIndex % skills.length]
      : undefined;

    const titleSkill = skill ?? (subject === 'math' ? 'Math Skills' : 'Reading & Writing Skills');
    const subjectLabel = subject === 'math' ? 'math' : 'reading & writing';

    tasks.push({
      date: dateStr,
      type,
      subject,
      phase,
      skill: skill ?? undefined,
      title: `${type === 'skill_focus' ? 'Focus' : 'Practice'}: ${titleSkill} (20 questions)`,
      description: options?.descriptionPrefix
        ? `${options.descriptionPrefix} ${skill ?? subjectLabel}.`
        : `Solve 20 ${subjectLabel} questions to strengthen ${skill ?? 'core concepts'}.`,
      questions: 20,
      estimatedMinutes: taskMinutes
    });

    currentIndex++;
  }

  return { tasks, nextIndex: currentIndex };
};

/**
 * Generate study plan based on user inputs
 */
export async function generateStudyPlan(
  userId: string,
  input: LearningPlanInput
): Promise<StudyPlan> {
  const testDate = new Date(input.testDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  testDate.setHours(0, 0, 0, 0);

  const daysUntilTest = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilTest <= 0) {
    throw new Error('Test date must be in the future');
  }

  // Calculate current score
  const currentScore = await calculateCurrentScore(userId);
  const scoreGap = input.dreamScore - currentScore;

  // Get available study days
  const dayMap: Record<string, number> = { M: 1, T: 2, W: 3, T2: 4, F: 5, S: 6, S2: 0 };
  const activeDays = Object.entries(input.days)
    .filter(([_, active]) => active)
    .map(([key, _]) => dayMap[key])
    .sort((a, b) => a - b);

  const studyDaysCount = activeDays.length;
  const totalStudyDays = Math.max(1, Math.floor((daysUntilTest / 7) * studyDaysCount));
  const totalStudyHours = totalStudyDays * input.studyHours;

  console.log('Study plan parameters:', {
    daysUntilTest,
    studyDaysCount,
    totalStudyDays,
    studyHours: input.studyHours,
    testDate: input.testDate
  });

  // Get available skills
  const { math, readingWriting } = await getAvailableSkills();
  
  console.log('Available skills:', { math: math.length, readingWriting: readingWriting.length });
  
  // Ensure we have at least some skills to work with
  if (math.length === 0 && readingWriting.length === 0) {
    throw new Error('No skills available. Please contact support.');
  }
  
  if (activeDays.length === 0) {
    throw new Error('Please select at least one study day.');
  }
  
  if (totalStudyDays <= 0) {
    throw new Error('Not enough time until test date. Please select a later test date.');
  }

  // Generate daily tasks
  const dailyTasks: DailyTask[] = [];
  let taskId = 1;
  let currentDate = new Date(today);
  let weekOffset = 0;

  // Phase 1: Foundation (first 30% of time) - Cover all topics
  // Phase 2: Strengthening (middle 40%) - Focus on weaknesses
  // Phase 3: Mastery (last 30%) - Practice tests and refinement
  const phase1End = Math.max(1, Math.floor(totalStudyDays * 0.3));
  const phase2End = Math.max(phase1End + 1, Math.floor(totalStudyDays * 0.7));

  let mathSkillIndex = 0;
  let rwSkillIndex = 0;
  let dayIndex = 0;
  let mockExamCount = 0;
  let maxIterations = daysUntilTest * 2; // Safety limit to prevent infinite loops
  let iterations = 0;

  const addTasks = (tasks: PendingTask[]) => {
    tasks.forEach(task => {
      dailyTasks.push({
        ...task,
        id: `task-${taskId++}`,
        completed: false
      });
    });
  };

  for (let day = 0; day < totalStudyDays; day++) {
    // Find next study day
    iterations = 0;
    while (iterations < maxIterations) {
      iterations++;
      const dayOfWeek = currentDate.getDay();
      if (activeDays.includes(dayOfWeek)) {
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate >= testDate) break;
    }
    
    if (iterations >= maxIterations) {
      console.warn('Reached max iterations while finding study day');
      break;
    }

    if (currentDate >= testDate) break;

    const dateStr = currentDate.toISOString().split('T')[0];
    const phase = day < phase1End ? 'foundation' : day < phase2End ? 'strengthening' : 'mastery';

    // Weekly mock exam (every 7 study days, but not in first week)
    if (day > 0 && day % 7 === 0 && mockExamCount < Math.floor(totalStudyDays / 7)) {
      addTasks([{
        date: dateStr,
        type: 'mock_exam',
        subject: 'both',
        phase,
        title: 'Full-Length Practice Test',
        description: 'Complete a full-length SAT practice test to assess your progress.',
        estimatedMinutes: 134 // 2h 14m
      }]);
      mockExamCount++;
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Determine subject focus (alternate or focus on weaker area)
    const mathWeight = scoreGap > 0 ? 0.5 : 0.6; // If behind, focus more on math
    const isMathDay = day % 2 === 0 || Math.random() < mathWeight;

    if (phase === 'foundation') {
      // Cover all topics systematically with smaller, varied blocks
      if (isMathDay) {
        const { tasks, nextIndex } = createSkillTasks(
          'math',
          math,
          mathSkillIndex,
          dateStr,
          phase,
          'practice',
          input.studyHours
        );
        addTasks(tasks.length > 0 ? tasks : [{
          date: dateStr,
          type: 'practice',
          subject: 'math',
          phase,
          title: 'Practice: Math Skills (20 questions)',
          description: 'Solve 20 math questions to strengthen your foundation.',
          questions: 20,
          estimatedMinutes: 40
        }]);
        mathSkillIndex = nextIndex;
      } else {
        const { tasks, nextIndex } = createSkillTasks(
          'reading-writing',
          readingWriting,
          rwSkillIndex,
          dateStr,
          phase,
          'practice',
          input.studyHours
        );
        addTasks(tasks.length > 0 ? tasks : [{
          date: dateStr,
          type: 'practice',
          subject: 'reading-writing',
          phase,
          title: 'Practice: Reading & Writing (20 questions)',
          description: 'Solve 20 reading & writing questions to strengthen your foundation.',
          questions: 20,
          estimatedMinutes: 30
        }]);
        rwSkillIndex = nextIndex;
      }
    } else if (phase === 'strengthening') {
      // Focus on weaknesses and review
      if (day % 3 === 0) {
        addTasks([{
          date: dateStr,
          type: 'review',
          subject: 'both',
          phase,
          title: 'Review Mistakes',
          description: 'Review and understand your previous mistakes.',
          estimatedMinutes: Math.max(30, Math.floor(input.studyHours * 60 * 0.5))
        }]);
      } else {
        if (isMathDay) {
          const { tasks, nextIndex } = createSkillTasks(
            'math',
            math,
            mathSkillIndex,
            dateStr,
            phase,
            'skill_focus',
            input.studyHours,
            { descriptionPrefix: 'Focus on mastery for' }
          );
          addTasks(tasks.length > 0 ? tasks : [{
            date: dateStr,
            type: 'skill_focus',
            subject: 'math',
            phase,
            title: 'Skill Focus: Math (20 questions)',
            description: 'Focus on a challenging math skill with a 20-question set.',
            questions: 20,
            estimatedMinutes: 40
          }]);
          mathSkillIndex = nextIndex;
        } else {
          const { tasks, nextIndex } = createSkillTasks(
            'reading-writing',
            readingWriting,
            rwSkillIndex,
            dateStr,
            phase,
            'skill_focus',
            input.studyHours,
            { descriptionPrefix: 'Focus on mastery for' }
          );
          addTasks(tasks.length > 0 ? tasks : [{
            date: dateStr,
            type: 'skill_focus',
            subject: 'reading-writing',
            phase,
            title: 'Skill Focus: Reading & Writing (20 questions)',
            description: 'Focus on a challenging reading & writing skill with a 20-question set.',
            questions: 20,
            estimatedMinutes: 30
          }]);
          rwSkillIndex = nextIndex;
        }
      }
    } else {
      // Mastery phase - more practice tests and drills
      if (day % 4 === 0) {
        addTasks([{
          date: dateStr,
          type: 'drill',
          subject: 'both',
          phase,
          title: 'Timed Practice Drill',
          description: 'Complete a timed 20-question drill to build speed and accuracy.',
          questions: 20,
          estimatedMinutes: 35
        }]);
      } else {
        if (isMathDay) {
          const { tasks, nextIndex } = createSkillTasks(
            'math',
            math,
            mathSkillIndex,
            dateStr,
            phase,
            'practice',
            input.studyHours,
            { randomize: true }
          );
          addTasks(tasks.length > 0 ? tasks : [{
            date: dateStr,
            type: 'practice',
            subject: 'math',
            phase,
            title: 'Final Practice: Math (20 questions)',
            description: 'Finalize your math prep with a focused 20-question set.',
            questions: 20,
            estimatedMinutes: 40
          }]);
          mathSkillIndex = nextIndex;
        } else {
          const { tasks, nextIndex } = createSkillTasks(
            'reading-writing',
            readingWriting,
            rwSkillIndex,
            dateStr,
            phase,
            'practice',
            input.studyHours,
            { randomize: true }
          );
          addTasks(tasks.length > 0 ? tasks : [{
            date: dateStr,
            type: 'practice',
            subject: 'reading-writing',
            phase,
            title: 'Final Practice: Reading & Writing (20 questions)',
            description: 'Finalize your reading & writing prep with a focused 20-question set.',
            questions: 20,
            estimatedMinutes: 30
          }]);
          rwSkillIndex = nextIndex;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Generated ${dailyTasks.length} tasks for study plan`);
  
  if (dailyTasks.length === 0) {
    throw new Error('Failed to generate any tasks. Please check your study days and test date.');
  }

  const phaseCounts: Record<PhaseType, number> = {
    foundation: 0,
    strengthening: 0,
    mastery: 0
  };

  const datePhaseMap = new Map<string, PhaseType>();
  dailyTasks.forEach(task => {
    if (!datePhaseMap.has(task.date)) {
      datePhaseMap.set(task.date, task.phase);
    }
  });

  datePhaseMap.forEach(phase => {
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });

  const plan: StudyPlan = {
    id: `plan-${userId}-${Date.now()}`,
    userId,
    testDate: input.testDate,
    currentScore,
    dreamScore: input.dreamScore,
    studyDays: input.days,
    studyHours: input.studyHours,
    totalDays: daysUntilTest,
    studyDaysCount,
    dailyTasks,
    phases: {
      foundation: phaseCounts.foundation,
      strengthening: phaseCounts.strengthening,
      mastery: phaseCounts.mastery
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('Study plan created successfully:', {
    id: plan.id,
    tasksCount: plan.dailyTasks.length,
    testDate: plan.testDate,
    currentScore: plan.currentScore,
    dreamScore: plan.dreamScore
  });

  return plan;
}

/**
 * Save study plan to localStorage
 */
export function saveStudyPlan(plan: StudyPlan): void {
  localStorage.setItem('userStudyPlan', JSON.stringify(plan));
  window.dispatchEvent(new Event('studyPlanUpdated'));
}

/**
 * Load study plan from localStorage
 */
export function loadStudyPlan(): StudyPlan | null {
  const saved = localStorage.getItem('userStudyPlan');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/**
 * Mark task as completed
 */
export function completeTask(planId: string, taskId: string): void {
  const plan = loadStudyPlan();
  if (!plan || plan.id !== planId) return;

  const task = plan.dailyTasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    saveStudyPlan(plan);
  }
}

