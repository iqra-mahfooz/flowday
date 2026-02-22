import React, { useState, useEffect, useCallback } from 'react';
import { Task, Priority } from '@/types/gitspace';
import { X, CheckCircle2, Circle, Calendar, Clock, Flag } from 'lucide-react';

interface Props {
  task: Task;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
  onComplete: (task: Task) => void;
}

export default function TaskDetailPanel({ task, onClose, onSave, onComplete }: Props) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(
    task.estimated_minutes?.toString() ?? ''
  );
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [timeStart, setTimeStart] = useState(task.time_block_start ?? '');
  const [timeEnd, setTimeEnd] = useState(task.time_block_end ?? '');
  const [notes, setNotes] = useState(task.markdown_content);

  // Reset when task changes
  useEffect(() => {
    setTitle(task.title);
    setPriority(task.priority);
    setEstimatedMinutes(task.estimated_minutes?.toString() ?? '');
    setDueDate(task.due_date ?? '');
    setTimeStart(task.time_block_start ?? '');
    setTimeEnd(task.time_block_end ?? '');
    setNotes(task.markdown_content);
  }, [task.id]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      const updates: Partial<Task> = {
        title,
        priority,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        due_date: dueDate || null,
        time_block_start: timeStart || null,
        time_block_end: timeEnd || null,
        markdown_content: notes,
      };
      onSave(task.id, updates);
    }, 600);
    return () => clearTimeout(timer);
  }, [title, priority, estimatedMinutes, dueDate, timeStart, timeEnd, notes, task.id, onSave]);

  const PRIORITIES: { value: Priority; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: 'bg-priority-high' },
    { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
    { value: 'low', label: 'Low', color: 'bg-priority-low' },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l border-border animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => onComplete(task)}>
            {task.status === 'complete' ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <Circle className="w-5 h-5 text-border hover:text-primary transition-colors" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {task.status === 'complete' ? 'Completed' : 'Open'}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-lg font-semibold font-display bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          placeholder="Task title..."
        />

        {/* Priority */}
        <div>
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-2">
            <Flag className="w-3 h-3" /> Priority
          </label>
          <div className="flex gap-1.5">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  priority === p.value
                    ? 'bg-foreground/10 text-foreground ring-1 ring-foreground/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${p.color}`} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated time */}
        <div>
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-2">
            <Clock className="w-3 h-3" /> Estimated Time (minutes)
          </label>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(e.target.value)}
            placeholder="25"
            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Due date */}
        <div>
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-2">
            <Calendar className="w-3 h-3" /> Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border-none outline-none text-foreground focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Time block */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">
            Time Block
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={timeStart}
              onChange={e => setTimeStart(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border-none outline-none text-foreground focus:ring-1 focus:ring-primary/30"
            />
            <span className="text-muted-foreground self-center text-sm">→</span>
            <input
              type="datetime-local"
              value={timeEnd}
              onChange={e => setTimeEnd(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border-none outline-none text-foreground focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={6}
            placeholder="Add notes, details, or context..."
            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border-none outline-none text-foreground placeholder:text-muted-foreground resize-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}
