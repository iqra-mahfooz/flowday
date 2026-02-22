import React from 'react';
import { Task } from '@/types/gitspace';
import { format, parseISO, isToday } from 'date-fns';

interface Props {
  tasks: Task[];
  onSelectTask: (id: string) => void;
  selectedTaskId: string | null;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

export default function DayTimeline({ tasks, onSelectTask, selectedTaskId }: Props) {
  // Get tasks that have time blocks for today
  const timeBlockedTasks = tasks.filter(t => {
    if (!t.time_block_start) return false;
    try {
      return isToday(parseISO(t.time_block_start));
    } catch {
      return false;
    }
  });

  const getTaskPosition = (task: Task) => {
    if (!task.time_block_start || !task.time_block_end) return null;
    const start = parseISO(task.time_block_start);
    const end = parseISO(task.time_block_end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = ((startHour - 6) / 16) * 100;
    const height = ((endHour - startHour) / 16) * 100;
    return { top: `${top}%`, height: `${Math.max(height, 2)}%` };
  };

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'bg-primary/20 border-primary/40 text-primary',
    medium: 'bg-secondary/40 border-secondary text-secondary-foreground',
    low: 'bg-accent/20 border-accent/40 text-accent-foreground',
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold font-display text-foreground uppercase tracking-wide">
          Today's Flow
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(new Date(), 'EEEE, MMM d')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="relative" style={{ minHeight: '640px' }}>
          {/* Hour lines */}
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="absolute w-full flex items-start"
              style={{ top: `${(i / 16) * 100}%` }}
            >
              <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0 -mt-1.5 tabular-nums">
                {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </span>
              <div className="flex-1 border-t border-border/50" />
            </div>
          ))}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const currentHour = now.getHours() + now.getMinutes() / 60;
            if (currentHour >= 6 && currentHour <= 22) {
              const top = ((currentHour - 6) / 16) * 100;
              return (
                <div
                  className="absolute left-10 right-0 flex items-center z-10"
                  style={{ top: `${top}%` }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary -ml-1" />
                  <div className="flex-1 border-t-2 border-primary" />
                </div>
              );
            }
            return null;
          })()}

          {/* Time-blocked tasks */}
          {timeBlockedTasks.map(task => {
            const pos = getTaskPosition(task);
            if (!pos) return null;
            const colorClass = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.low;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`absolute left-12 right-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-all hover:scale-[1.01] ${colorClass} ${
                  selectedTaskId === task.id ? 'ring-2 ring-primary/30' : ''
                }`}
                style={{ top: pos.top, height: pos.height, minHeight: '28px' }}
              >
                <p className="text-xs font-medium truncate">{task.title}</p>
                {task.time_block_start && task.time_block_end && (
                  <p className="text-[10px] opacity-70">
                    {format(parseISO(task.time_block_start), 'h:mm a')} – {format(parseISO(task.time_block_end), 'h:mm a')}
                  </p>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {timeBlockedTasks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">No time blocks yet</p>
                <p className="text-xs mt-1">Edit a task to assign a time block</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
