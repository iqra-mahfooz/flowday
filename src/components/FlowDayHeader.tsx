import React from 'react';
import { format } from 'date-fns';
import { Flame, CheckCircle2, Clock, Zap } from 'lucide-react';

interface Props {
  totalTasks: number;
  completedTasks: number;
  focusMinutesToday: number;
  streak: number;
}

export default function FlowDayHeader({ totalTasks, completedTasks, focusMinutesToday, streak }: Props) {
  const today = new Date();
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
            FlowDay
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(today, 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        {/* Focus time */}
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{focusMinutesToday}m</span>
          <span className="text-muted-foreground">focused</span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{streak}</span>
          </div>
        )}
      </div>
    </header>
  );
}
