import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Task, Project } from '@/types/gitspace';
import { CheckSquare, Square, Trash2, Copy, GitCommit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  project?: Project;
  isSelected: boolean;
  isHighlighted: boolean;
  commitCount: number;
  onSelect: () => void;
  onDrop: (taskId: string, x: number, y: number) => void;
  onComplete: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function TaskCard({
  task,
  project,
  isSelected,
  isHighlighted,
  commitCount,
  onSelect,
  onDrop,
  onComplete,
  onDelete,
  onDuplicate,
}: TaskCardProps) {
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, cardX: 0, cardY: 0 });
  const [localPos, setLocalPos] = useState({ x: task.x, y: task.y });
  const [showMenu, setShowMenu] = useState(false);
  const hasMoved = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalPos({ x: task.x, y: task.y });
  }, [task.x, task.y]);

  // Close context menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = () => setShowMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showMenu]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, cardX: localPos.x, cardY: localPos.y };

    const onMouseMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = me.clientX - dragStart.current.mouseX;
      const dy = me.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      setLocalPos({
        x: dragStart.current.cardX + dx,
        y: dragStart.current.cardY + dy,
      });
    };

    const onMouseUp = (me: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const dx = me.clientX - dragStart.current.mouseX;
      const dy = me.clientY - dragStart.current.mouseY;
      const newX = dragStart.current.cardX + dx;
      const newY = dragStart.current.cardY + dy;
      if (hasMoved.current) {
        onDrop(task.id, newX, newY);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [localPos.x, localPos.y, task.id, onDrop]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMoved.current) {
      onSelect();
    }
  }, [onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
  }, []);

  const isComplete = task.status === 'complete';
  const accentColor = project?.color ?? '#00ffcc';

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: localPos.x,
        top: localPos.y,
        width: 240,
        cursor: isDragging.current ? 'grabbing' : 'grab',
        zIndex: isSelected ? 20 : isHighlighted ? 15 : 10,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging.current ? 'none' : 'transform 0.15s ease',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`
          rounded-sm border bg-card text-card-foreground
          transition-all duration-200
          ${isSelected ? 'shadow-lg' : 'shadow-md'}
          ${isHighlighted ? 'animate-commit-flash' : ''}
        `}
        style={{
          borderColor: isComplete
            ? 'hsl(142 71% 45% / 0.5)'
            : isSelected
            ? accentColor + '99'
            : 'hsl(var(--border))',
          backgroundColor: isComplete ? 'hsl(142 71% 45% / 0.06)' : undefined,
          boxShadow: isSelected ? `0 0 0 1px ${accentColor}44, 0 8px 24px -4px ${accentColor}22` : undefined,
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px w-full"
          style={{ backgroundColor: isComplete ? 'hsl(142 71% 45%)' : accentColor + '66' }}
        />

        <div className="px-3 py-2.5">
          {/* Status + title */}
          <div className="flex items-start gap-2">
            <span className="mono text-xs mt-0.5 flex-shrink-0 select-none" style={{ color: isComplete ? 'hsl(142 71% 45%)' : 'hsl(var(--muted-foreground))' }}>
              {isComplete ? '[x]' : '[ ]'}
            </span>
            <p className="mono text-sm font-semibold leading-snug text-foreground break-words flex-1">
              {task.title}
            </p>
          </div>

          {/* Project badge */}
          {project && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <span className="mono text-xs" style={{ color: project.color + 'cc' }}>
                {project.name}
              </span>
            </div>
          )}

          {/* Footer: timestamp + commit count */}
          <div className="flex items-center justify-between mt-2">
            <span className="mono text-xs text-muted-foreground opacity-60">
              {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </span>
            {commitCount > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <GitCommit className="w-3 h-3" />
                <span className="mono text-xs">{commitCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-sm shadow-lg py-1 min-w-36"
          onClick={e => e.stopPropagation()}
        >
          {!isComplete ? (
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs mono hover:bg-muted transition-colors"
              style={{ color: 'hsl(142 71% 45%)' }}
              onClick={() => { onComplete(); setShowMenu(false); }}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Mark complete
            </button>
          ) : (
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs mono hover:bg-muted transition-colors text-muted-foreground"
              onClick={() => { onComplete(); setShowMenu(false); }}
            >
              <Square className="w-3.5 h-3.5" />
              Reopen task
            </button>
          )}
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs mono hover:bg-muted transition-colors text-muted-foreground"
            onClick={() => { onDuplicate(); setShowMenu(false); }}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <div className="border-t border-border my-1" />
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs mono hover:bg-muted transition-colors text-destructive"
            onClick={() => { onDelete(); setShowMenu(false); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
