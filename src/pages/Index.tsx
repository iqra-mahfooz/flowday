import React, { useState, useCallback } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useTodaySessions, useCreateFocusSession, useCompleteFocusSession } from '@/hooks/useFocusSessions';
import { Task } from '@/types/gitspace';
import FlowDayHeader from '@/components/FlowDayHeader';
import TaskListPanel from '@/components/TaskListPanel';
import DayTimeline from '@/components/DayTimeline';
import FocusTimer from '@/components/FocusTimer';
import DailyStats from '@/components/DailyStats';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import { toast } from 'sonner';

export default function Index() {
  const { data: tasks = [] } = useTasks();
  const { data: todaySessions = [] } = useTodaySessions();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createFocusSession = useCreateFocusSession();
  const completeFocusSession = useCompleteFocusSession();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'complete'>('all');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  const focusMinutesToday = todaySessions
    .filter(s => s.session_type === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const handleCreateTask = useCallback(async () => {
    const task = await createTask.mutateAsync({
      title: 'New Task',
      priority: 'medium',
    });
    setSelectedTaskId(task.id);
    toast.success('Task created');
  }, [createTask]);

  const handleCompleteTask = useCallback(async (task: Task) => {
    const newStatus = task.status === 'complete' ? 'open' : 'complete';
    await updateTask.mutateAsync({ id: task.id, updates: { status: newStatus } });
    toast.success(newStatus === 'complete' ? 'Task completed! 🎉' : 'Task reopened');
  }, [updateTask]);

  const handleDeleteTask = useCallback(async (task: Task) => {
    await deleteTask.mutateAsync({ id: task.id, title: task.title });
    if (selectedTaskId === task.id) setSelectedTaskId(null);
    toast('Task deleted');
  }, [deleteTask, selectedTaskId]);

  const handleSaveTask = useCallback((id: string, updates: Partial<Task>) => {
    updateTask.mutate({ id, updates });
  }, [updateTask]);

  const handleSessionComplete = useCallback(async (minutes: number, type: 'focus' | 'break') => {
    const session = await createFocusSession.mutateAsync({
      task_id: selectedTaskId,
      duration_minutes: minutes,
      session_type: type,
    });
    // Mark it completed immediately
    await completeFocusSession.mutateAsync(session.id);
    toast.success(
      type === 'focus' ? `Focus session complete! ${minutes}m logged` : 'Break time over!'
    );
  }, [createFocusSession, completeFocusSession, selectedTaskId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <FlowDayHeader
        totalTasks={tasks.length}
        completedTasks={tasks.filter(t => t.status === 'complete').length}
        focusMinutesToday={focusMinutesToday}
        streak={todaySessions.filter(s => s.completed && s.session_type === 'focus').length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Task List */}
        <div className="w-72 flex-shrink-0">
          <TaskListPanel
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onCreateTask={handleCreateTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Center: Day Timeline */}
        <div className="flex-1 p-4 overflow-hidden">
          <DayTimeline
            tasks={tasks}
            onSelectTask={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
          />
        </div>

        {/* Right: Timer + Stats OR Task Detail */}
        <div className="w-72 flex-shrink-0 p-4 space-y-4 overflow-y-auto">
          {selectedTask ? (
            <TaskDetailPanel
              task={selectedTask}
              onClose={() => setSelectedTaskId(null)}
              onSave={handleSaveTask}
              onComplete={handleCompleteTask}
            />
          ) : (
            <>
              <FocusTimer
                activeTask={selectedTask}
                onSessionComplete={handleSessionComplete}
              />
              <DailyStats tasks={tasks} sessions={todaySessions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
