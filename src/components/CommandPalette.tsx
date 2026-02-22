import React, { useState, useEffect, useRef } from 'react';
import { Task, Project } from '@/types/gitspace';
import { Search, Plus, FolderPlus, GitBranch, Terminal } from 'lucide-react';

interface CommandPaletteProps {
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
  onCreateProject: () => void;
  onOpenCommitLog: () => void;
}

type ResultItem =
  | { type: 'task'; task: Task; project?: Project }
  | { type: 'action'; label: string; icon: React.ReactNode; action: () => void };

export default function CommandPalette({
  tasks,
  projects,
  onClose,
  onSelectTask,
  onCreateTask,
  onCreateProject,
  onOpenCommitLog,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const actions: ResultItem[] = [
    { type: 'action', label: 'New task', icon: <Plus className="w-3.5 h-3.5" />, action: () => { onCreateTask(); onClose(); } },
    { type: 'action', label: 'New project', icon: <FolderPlus className="w-3.5 h-3.5" />, action: () => { onCreateProject(); onClose(); } },
    { type: 'action', label: 'Open commit log', icon: <GitBranch className="w-3.5 h-3.5" />, action: () => { onOpenCommitLog(); onClose(); } },
  ];

  const filteredTasks = query.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.markdown_content.toLowerCase().includes(query.toLowerCase()))
    : [];

  const results: ResultItem[] = [
    ...(query ? [] : actions),
    ...filteredTasks.map(t => ({
      type: 'task' as const,
      task: t,
      project: projects.find(p => p.id === t.project_id),
    })),
    ...(query ? actions.filter(a => a.type === 'action' && a.label.toLowerCase().includes(query.toLowerCase())) : []),
  ];

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[selected];
        if (!item) return;
        if (item.type === 'task') { onSelectTask(item.task.id); onClose(); }
        else if (item.type === 'action') item.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, selected, onClose, onSelectTask]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-border rounded-sm shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search tasks or type a command…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="mono text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center mono text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          )}

          {!query && results.length > 0 && (
            <div className="px-3 py-1.5">
              <span className="mono text-xs text-muted-foreground opacity-50">ACTIONS</span>
            </div>
          )}

          {results.map((item, i) => {
            const isActive = i === selected;
            if (item.type === 'action') {
              return (
                <button
                  key={`action-${item.label}`}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 mono text-sm transition-colors ${
                    isActive ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={item.action}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span className="text-muted-foreground">{item.icon}</span>
                  {item.label}
                </button>
              );
            }
            const { task, project } = item;
            return (
              <button
                key={task.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  isActive ? 'bg-muted' : 'hover:bg-muted'
                }`}
                onClick={() => { onSelectTask(task.id); onClose(); }}
                onMouseEnter={() => setSelected(i)}
              >
                <span className="mono text-xs text-muted-foreground">
                  {task.status === 'complete' ? '[x]' : '[ ]'}
                </span>
                <span className="mono text-sm text-foreground flex-1 text-left truncate">{task.title}</span>
                {project && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="mono text-xs text-muted-foreground">{project.name}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4">
          <span className="mono text-xs text-muted-foreground opacity-40">↑↓ navigate · Enter select · Esc close</span>
        </div>
      </div>
    </div>
  );
}
