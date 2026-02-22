import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Task, Project, CanvasState } from '@/types/gitspace';
import TaskCard from './TaskCard';
import ProjectZone from './ProjectZone';

interface CanvasProps {
  tasks: Task[];
  projects: Project[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onUpdateTaskPosition: (taskId: string, x: number, y: number, projectId?: string | null) => void;
  onUpdateProjectPosition: (projectId: string, x: number, y: number) => void;
  onUpdateProjectSize: (projectId: string, width: number, height: number) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  highlightedTaskId: string | null;
}

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

export default function Canvas({
  tasks,
  projects,
  selectedTaskId,
  onSelectTask,
  onUpdateTaskPosition,
  onUpdateProjectPosition,
  onUpdateProjectSize,
  onCompleteTask,
  onDeleteTask,
  onDuplicateTask,
  highlightedTaskId,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>(() => {
    try {
      const saved = sessionStorage.getItem('gitspace-canvas');
      return saved ? JSON.parse(saved) : { offsetX: -200, offsetY: -150, zoom: 1 };
    } catch {
      return { offsetX: -200, offsetY: -150, zoom: 1 };
    }
  });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);

  // Persist canvas state to session storage
  useEffect(() => {
    sessionStorage.setItem('gitspace-canvas', JSON.stringify(canvasState));
  }, [canvasState]);

  // Space bar pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (spaceDown || e.target === canvasRef.current) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - canvasState.offsetX, y: e.clientY - canvasState.offsetY };
    }
  }, [spaceDown, canvasState.offsetX, canvasState.offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setCanvasState(prev => ({
      ...prev,
      offsetX: e.clientX - panStart.current.x,
      offsetY: e.clientY - panStart.current.y,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev.zoom + delta)),
    }));
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectTask(null);
    }
  }, [onSelectTask]);

  // Find project for task based on position overlap
  const getTaskProject = useCallback((taskX: number, taskY: number): string | null => {
    for (const project of projects) {
      if (
        taskX >= project.x &&
        taskX <= project.x + project.width &&
        taskY >= project.y &&
        taskY <= project.y + project.height
      ) {
        return project.id;
      }
    }
    return null;
  }, [projects]);

  const handleTaskDrop = useCallback((taskId: string, x: number, y: number) => {
    const projectId = getTaskProject(x, y);
    onUpdateTaskPosition(taskId, x, y, projectId);
  }, [getTaskProject, onUpdateTaskPosition]);

  return (
    <div
      className="relative w-full h-full overflow-hidden canvas-bg"
      style={{ cursor: spaceDown ? 'grab' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      ref={canvasRef}
    >
      {/* Canvas world */}
      <div
        style={{
          transform: `translate(${canvasState.offsetX}px, ${canvasState.offsetY}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: '4000px',
          height: '4000px',
          top: 0,
          left: 0,
        }}
      >
        {/* Project boundary zones (render below tasks) */}
        {projects.map(project => (
          <ProjectZone
            key={project.id}
            project={project}
            taskCount={tasks.filter(t => t.project_id === project.id).length}
            onMove={(x, y) => onUpdateProjectPosition(project.id, x, y)}
            onResize={(w, h) => onUpdateProjectSize(project.id, w, h)}
          />
        ))}

        {/* Task cards */}
        {tasks.map(task => {
          const project = projects.find(p => p.id === task.project_id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              project={project}
              isSelected={selectedTaskId === task.id}
              isHighlighted={highlightedTaskId === task.id}
              commitCount={0}
              onSelect={() => onSelectTask(task.id)}
              onDrop={handleTaskDrop}
              onComplete={() => onCompleteTask(task)}
              onDelete={() => onDeleteTask(task)}
              onDuplicate={() => onDuplicateTask(task)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2 opacity-30">
            <p className="mono text-sm text-muted-foreground">empty canvas</p>
            <p className="mono text-xs text-muted-foreground">press N or click + to create your first task</p>
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 mono text-xs text-muted-foreground bg-card border border-border px-2 py-1 rounded select-none">
        {Math.round(canvasState.zoom * 100)}%
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 mono text-xs text-muted-foreground select-none opacity-40">
        scroll to zoom · drag to pan · space+drag to pan
      </div>
    </div>
  );
}
