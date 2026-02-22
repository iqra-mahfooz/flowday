import React, { useState } from 'react';
import { Project, Task, CommitLog } from '@/types/gitspace';
import { FolderOpen, Plus, GitBranch, ChevronDown, ChevronRight, Trash2, Clock } from 'lucide-react';
import { generateShortHash } from '@/hooks/useCommitLog';
import { formatDistanceToNow } from 'date-fns';

interface LeftSidebarProps {
  projects: Project[];
  tasks: Task[];
  commitLog: CommitLog[];
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onFilterProject: (id: string | null) => void;
  activeProjectFilter: string | null;
  onHighlightTask: (id: string) => void;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'hsl(var(--primary))',
  COMPLETE: 'hsl(142 71% 45%)',
  EDIT: 'hsl(45 100% 51%)',
  DELETE: 'hsl(var(--destructive))',
  REOPEN: 'hsl(var(--muted-foreground))',
};

export default function LeftSidebar({
  projects,
  tasks,
  commitLog,
  onCreateProject,
  onDeleteProject,
  onFilterProject,
  activeProjectFilter,
  onHighlightTask,
}: LeftSidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [commitOpen, setCommitOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-56 bg-sidebar border-r border-sidebar-border overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
          <span className="mono text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
            GitSpace
          </span>
        </div>
        <p className="mono text-xs text-muted-foreground mt-0.5 opacity-50">spatial task system</p>
      </div>

      {/* All tasks filter */}
      <button
        className={`flex items-center gap-2 px-3 py-2 text-xs mono transition-colors hover:bg-sidebar-accent ${
          activeProjectFilter === null ? 'text-primary bg-sidebar-accent' : 'text-sidebar-foreground'
        }`}
        onClick={() => onFilterProject(null)}
      >
        <FolderOpen className="w-3.5 h-3.5" />
        All tasks
        <span className="ml-auto text-muted-foreground">{tasks.length}</span>
      </button>

      {/* Projects section */}
      <div className="flex-shrink-0">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 text-xs mono text-muted-foreground hover:bg-sidebar-accent transition-colors"
          onClick={() => setProjectsOpen(o => !o)}
        >
          {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          PROJECTS
          <button
            className="ml-auto p-0.5 rounded hover:text-primary transition-colors"
            onClick={e => { e.stopPropagation(); onCreateProject(); }}
            title="New project"
          >
            <Plus className="w-3 h-3" />
          </button>
        </button>

        {projectsOpen && (
          <div className="pb-1">
            {projects.length === 0 && (
              <p className="mono text-xs text-muted-foreground opacity-40 px-4 py-1">no projects yet</p>
            )}
            {projects.map(project => {
              const count = tasks.filter(t => t.project_id === project.id).length;
              return (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer mono text-xs transition-colors hover:bg-sidebar-accent ${
                    activeProjectFilter === project.id ? 'bg-sidebar-accent' : ''
                  }`}
                  onClick={() => onFilterProject(activeProjectFilter === project.id ? null : project.id)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="truncate flex-1" style={{ color: activeProjectFilter === project.id ? project.color : undefined }}>
                    {project.name}
                  </span>
                  <span className="text-muted-foreground">{count}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                    onClick={e => { e.stopPropagation(); onDeleteProject(project.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-sidebar-border" />

      {/* Commit log section */}
      <div className="flex flex-col flex-1 min-h-0">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 text-xs mono text-muted-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          onClick={() => setCommitOpen(o => !o)}
        >
          {commitOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          COMMIT LOG
          <span className="ml-auto text-muted-foreground">{commitLog.length}</span>
        </button>

        {commitOpen && (
          <div className="flex-1 overflow-y-auto">
            {commitLog.length === 0 && (
              <p className="mono text-xs text-muted-foreground opacity-40 px-4 py-2">no commits yet</p>
            )}
            {commitLog.map(entry => (
              <div
                key={entry.id}
                className="px-3 py-2 border-b border-sidebar-border hover:bg-sidebar-accent cursor-pointer transition-colors"
                onClick={() => entry.task_id && onHighlightTask(entry.task_id)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="mono text-xs font-bold" style={{ color: ACTION_COLORS[entry.action_type] ?? 'hsl(var(--muted-foreground))' }}>
                    {entry.action_type}
                  </span>
                  <span className="mono text-xs text-muted-foreground opacity-50">
                    {generateShortHash(entry.id)}
                  </span>
                </div>
                <p className="mono text-xs text-foreground opacity-70 leading-snug break-all">
                  {entry.message}
                </p>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground opacity-40">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="mono text-xs">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
