import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trophy, Target, Flame, Star, BookOpen, BarChart3 } from 'lucide-react';

type ActivityItem = {
  id: string;
  message: string;
  icon: 'check' | 'trophy' | 'target' | 'flame' | 'star' | 'book' | 'chart';
};

const ICON_MAP: Record<ActivityItem['icon'], React.ReactNode> = {
  check: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  trophy: <Trophy className="h-4 w-4 text-yellow-500" />,
  target: <Target className="h-4 w-4 text-blue-600" />,
  flame: <Flame className="h-4 w-4 text-orange-500" />,
  star: <Star className="h-4 w-4 text-amber-400" />,
  book: <BookOpen className="h-4 w-4 text-violet-600" />,
  chart: <BarChart3 className="h-4 w-4 text-sky-600" />,
};

const NAMES = [
  'Harshil G.', 'Sarah C.', 'Marcus J.', 'Emily R.', 'David K.', 'Jessica W.', 'Alex T.', 'Maya P.', 'Ryan O.',
  'Aarav S.', 'Ishaan P.', 'Noah L.', 'Ava M.'
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMessage(): ActivityItem {
  const name = randomChoice(NAMES);
  const roll = Math.random();

  if (roll < 0.2) {
    return { id: crypto.randomUUID(), icon: 'trophy', message: `${name} just jumped to #3 on the leaderboard` };
  }
  if (roll < 0.4) {
    const solved = 3 + Math.floor(Math.random() * 6);
    return { id: crypto.randomUUID(), icon: 'check', message: `${name} solved ${solved} questions` };
  }
  if (roll < 0.6) {
    const streak = 3 + Math.floor(Math.random() * 10);
    return { id: crypto.randomUUID(), icon: 'flame', message: `${name} hit a ${streak}-day streak` };
  }
  if (roll < 0.8) {
    return { id: crypto.randomUUID(), icon: 'book', message: `${name} completed a Reading drill` };
  }
  return { id: crypto.randomUUID(), icon: 'chart', message: `${name} improved Math accuracy to ${80 + Math.floor(Math.random() * 19)}%` };
}

interface LiveActivityPopupsProps {
  className?: string;
  maxVisible?: number;
  intervalMs?: number;
  lifetimeMs?: number;
}

const LiveActivityPopups: React.FC<LiveActivityPopupsProps> = ({
  className,
  maxVisible = 3,
  intervalMs = 4500,
  lifetimeMs = 9500,
}) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const initialBurst = useMemo<ActivityItem[]>(() => [generateMessage(), generateMessage()], []);

  useEffect(() => {
    // Seed with a quick burst so the UI looks alive immediately
    setItems(initialBurst);

    const interval = window.setInterval(() => {
      setItems(prev => {
        const next = [...prev, generateMessage()].slice(-maxVisible);
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [initialBurst, intervalMs, maxVisible]);

  useEffect(() => {
    // Manage per-item lifetime and cleanup
    items.forEach(item => {
      if (!timersRef.current[item.id]) {
        timersRef.current[item.id] = window.setTimeout(() => {
          setItems(prev => prev.filter(i => i.id !== item.id));
          window.clearTimeout(timersRef.current[item.id]);
          delete timersRef.current[item.id];
        }, lifetimeMs);
      }
    });

    return () => {
      // clear any stray timers on unmount
      Object.values(timersRef.current).forEach(id => window.clearTimeout(id));
      timersRef.current = {};
    };
  }, [items, lifetimeMs]);

  return (
    <div className={`pointer-events-none fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-10 ${className || ''}`}>
      <div className="flex flex-col-reverse gap-3 w-[280px] sm:w-[320px] opacity-80">
        <AnimatePresence initial={false}>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 24, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="pointer-events-auto"
            >
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur rounded-xl">
                <div className="flex items-start gap-3 p-3">
                  <div className="mt-0.5">{ICON_MAP[item.icon]}</div>
                  <div className="text-[13px] leading-snug text-slate-700">
                    {item.message}
                    <div className="text-[11px] text-slate-400 mt-1">Just now</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityPopups;


