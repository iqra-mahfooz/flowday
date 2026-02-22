import React, { useState } from 'react';
import { Task, Priority } from '@/types/gitspace';
import { Plus, Circle, CheckCircle2, Calendar, Clock, ChevronDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onCreateTask: () => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  filter: 'all' | 'open' | 'complete';
  onFilterChange: (f: 'all' | 'open' | 'complete') => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string }> = {
  high: { label: 'High', dot: 'bg-priority-high' },
  medium: { label: 'Med', dot: 'bg-priority-medium' },
  low: { label: 'Low', dot: 'bg-priority-low' },
};

export default function TaskListPanel({
  tasks, selectedTaskId, onSelectTask, onCreateTask, onCompleteTask, onDeleteTask, filter, onFilterChange,
}: Props) {
  const filtered = tasks.filter(t => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'complete') return t.status === 'complete';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    if (a.status !== b.status) return a.status === 'complete' ? 1 : -1;
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold font-display text-foreground uppercase tracking-wide">Tasks</h2>
          <button
            onClick={onCreateTask}
            className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
          {(['all', 'open', 'complete'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all capitalize ${
                filter === f
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks yet. Create one!
          </div>
        )}
        {sorted.map(task => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`group p-3 mb-1.5 rounded-xl cursor-pointer task-card-hover transition-colors ${
              selectedTaskId === task.id
                ? 'bg-primary/8 border border-primary/20'
                : 'hover:bg-muted/60 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {/* Complete toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onCompleteTask(task); }}
                className="mt-0.5 flex-shrink-0"
              >
                {task.status === 'complete' ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                ) : (
                  <Circle className="w-4.5 h-4.5 text-border hover:text-primary transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${
                  task.status === 'complete' ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {task.title}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[task.priority]?.dot ?? 'bg-priority-none'}`} />
                  <span className="text-[11px] text-muted-foreground">
                    {PRIORITY_CONFIG[task.priority]?.label ?? 'None'}
                  </span>

                  {task.estimated_minutes && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{task.estimated_minutes}m</span>
                      </div>
                    </>
                  )}

                  {task.due_date && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <div className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteTask(task); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
