import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, Project } from '@/types/gitspace';
import { X, Save, CheckSquare, Square, Eye, Edit3, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskEditorProps {
  task: Task;
  projects: Project[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>, logEdit?: boolean) => void;
  onComplete: (task: Task) => void;
}

export default function TaskEditor({ task, projects, onClose, onSave, onComplete }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.markdown_content);
  const [projectId, setProjectId] = useState<string | null>(task.project_id);
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);

  // Sync when task changes
  useEffect(() => {
    setTitle(task.title);
    setContent(task.markdown_content);
    setProjectId(task.project_id);
    setSaveStatus('saved');
    isFirstRender.current = true;
  }, [task.id]);

  // Debounced auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus('unsaved');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSaveStatus('saving');
      onSave(task.id, { title, markdown_content: content, project_id: projectId }, true);
      setTimeout(() => setSaveStatus('saved'), 400);
    }, 1200);

    return () => clearTimeout(debounceRef.current);
  }, [title, content, projectId]);

  // ⌘S force save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        onSave(task.id, { title, markdown_content: content, project_id: projectId }, true);
        setSaveStatus('saved');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onComplete(task);
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [title, content, projectId, task, onSave, onComplete, onClose]);

  const isComplete = task.status === 'complete';

  return (
    <div className="flex flex-col h-full bg-card border-l border-border animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="mono text-xs text-muted-foreground">task editor</span>
          <span
            className="mono text-xs px-1.5 py-0.5 rounded-sm"
            style={{
              color: saveStatus === 'saved' ? 'hsl(var(--muted-foreground))' : saveStatus === 'saving' ? 'hsl(var(--primary))' : 'hsl(45 100% 51%)',
              border: '1px solid currentColor',
              opacity: 0.7,
            }}
          >
            {saveStatus === 'saved' ? '● saved' : saveStatus === 'saving' ? '↑ saving…' : '○ unsaved'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="mono text-xs px-2 py-1 rounded-sm border border-border hover:bg-muted transition-colors flex items-center gap-1.5"
            onClick={() => setPreview(p => !p)}
          >
            {preview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {preview ? 'edit' : 'preview'}
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <input
          className="w-full bg-transparent mono text-base font-bold text-foreground outline-none placeholder:text-muted-foreground border-b border-transparent focus:border-border transition-colors pb-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title…"
        />
      </div>

      {/* Project selector */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative inline-flex items-center">
          {projectId && (
            <div
              className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
              style={{ backgroundColor: projects.find(p => p.id === projectId)?.color ?? '#00ffcc' }}
            />
          )}
          <select
            className="mono text-xs text-muted-foreground bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
            value={projectId ?? ''}
            onChange={e => setProjectId(e.target.value || null)}
          >
            <option value="">No project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-0 pointer-events-none" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 pb-3">
        {preview ? (
          <div className="flex-1 overflow-y-auto pr-1 markdown-content">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-sm italic">Nothing to preview.</p>
            )}
          </div>
        ) : (
          <textarea
            className="flex-1 w-full bg-muted/30 border border-border rounded-sm mono text-sm text-foreground outline-none resize-none p-3 placeholder:text-muted-foreground focus:border-primary/50 transition-colors"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`## Task notes\n\nWrite in **Markdown**…`}
            spellCheck={false}
          />
        )}
      </div>

      {/* Complete button */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <button
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-sm mono text-sm font-semibold transition-all duration-200 ${
            isComplete
              ? 'border border-border text-muted-foreground hover:bg-muted'
              : 'border border-primary/50 text-primary hover:bg-primary/10'
          }`}
          onClick={() => onComplete(task)}
          title="⌘Enter"
        >
          {isComplete ? (
            <><Square className="w-4 h-4" /> Reopen task</>
          ) : (
            <><CheckSquare className="w-4 h-4" /> Mark complete → commit</>
          )}
        </button>
      </div>

      {/* Metadata footer */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 space-y-1">
        <div className="mono text-xs text-muted-foreground opacity-50 flex gap-2">
          <span>id</span>
          <span className="truncate">{task.id}</span>
        </div>
        <div className="mono text-xs text-muted-foreground opacity-50 flex gap-2">
          <span>created</span>
          <span>{format(new Date(task.created_at), 'yyyy-MM-dd HH:mm')}</span>
        </div>
        <div className="mono text-xs text-muted-foreground opacity-50 flex gap-2">
          <span>updated</span>
          <span>{formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
        </div>
        <div className="mono text-xs text-muted-foreground opacity-30 mt-1">
          ⌘S save · ⌘Enter commit · Esc close
        </div>
      </div>
    </div>
  );
}
