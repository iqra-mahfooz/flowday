import React from 'react';
import { Task, FocusSession } from '@/types/gitspace';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';

interface Props {
  tasks: Task[];
  sessions: FocusSession[];
}

export default function DailyStats({ tasks, sessions }: Props) {
  const openTasks = tasks.filter(t => t.status === 'open');
  const completedTasks = tasks.filter(t => t.status === 'complete');
  const totalFocusMinutes = sessions
    .filter(s => s.session_type === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const highPriority = openTasks.filter(t => t.priority === 'high').length;
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const stats = [
    {
      icon: Target,
      label: 'Completion',
      value: `${completionRate}%`,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Zap,
      label: 'High Priority',
      value: highPriority,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Clock,
      label: 'Focus Time',
      value: `${totalFocusMinutes}m`,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/40',
    },
    {
      icon: TrendingUp,
      label: 'Sessions',
      value: sessions.filter(s => s.completed).length,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
      <h3 className="text-sm font-semibold font-display text-foreground uppercase tracking-wide mb-3">
        Daily Stats
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
            <p className="text-lg font-bold font-display text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
