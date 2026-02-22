export interface Project {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  markdown_content: string;
  project_id: string | null;
  status: 'open' | 'complete';
  priority: 'high' | 'medium' | 'low';
  estimated_minutes: number | null;
  due_date: string | null;
  time_block_start: string | null;
  time_block_end: string | null;
  quadrant: string | null;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  task_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  session_type: 'focus' | 'break';
  completed: boolean;
  created_at: string;
}

export interface CommitLog {
  id: string;
  task_id: string | null;
  action_type: 'CREATE' | 'COMPLETE' | 'EDIT' | 'DELETE' | 'REOPEN';
  message: string;
  timestamp: string;
}

export type ActionType = CommitLog['action_type'];
export type Priority = Task['priority'];

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}
