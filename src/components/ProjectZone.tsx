import React, { useState, useRef, useCallback } from 'react';
import { Project } from '@/types/gitspace';

interface ProjectZoneProps {
  project: Project;
  taskCount: number;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

export default function ProjectZone({ project, taskCount, onMove, onResize }: ProjectZoneProps) {
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, zoneX: 0, zoneY: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, zoneX: project.x, zoneY: project.y };

    const onMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = me.clientX - dragStart.current.mouseX;
      const dy = me.clientY - dragStart.current.mouseY;
    };

    const onUp = (me: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const dx = me.clientX - dragStart.current.mouseX;
      const dy = me.clientY - dragStart.current.mouseY;
      onMoveHandler(dragStart.current.zoneX + dx, dragStart.current.zoneY + dy);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [project.x, project.y]);

  const onMoveHandler = useCallback((x: number, y: number) => {
    onMove(x, y);
  }, [onMove]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: project.width, h: project.height };

    const onResizeMove = (me: MouseEvent) => {};

    const onResizeUp = (me: MouseEvent) => {
      if (!isResizing.current) return;
      isResizing.current = false;
      const dx = me.clientX - resizeStart.current.mouseX;
      const dy = me.clientY - resizeStart.current.mouseY;
      const newW = Math.max(200, resizeStart.current.w + dx);
      const newH = Math.max(150, resizeStart.current.h + dy);
      onResize(newW, newH);
      window.removeEventListener('mousemove', onResizeMove);
      window.removeEventListener('mouseup', onResizeUp);
    };

    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeUp);
  }, [project.width, project.height, onResize]);

  return (
    <div
      style={{
        position: 'absolute',
        left: project.x,
        top: project.y,
        width: project.width,
        height: project.height,
        border: `1.5px solid ${project.color}33`,
        backgroundColor: `${project.color}08`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
    >
      {/* Header drag handle */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-move select-none"
        style={{
          borderBottom: `1px solid ${project.color}22`,
          background: `${project.color}10`,
          borderRadius: '3px 3px 0 0',
        }}
        onMouseDown={handleDragMouseDown}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <span className="mono text-xs font-semibold truncate" style={{ color: project.color }}>
          {project.name}
        </span>
        <span className="mono text-xs ml-auto" style={{ color: `${project.color}88` }}>
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          borderRight: `2px solid ${project.color}55`,
          borderBottom: `2px solid ${project.color}55`,
          borderRadius: '0 0 3px 0',
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
