
-- Add time management columns to tasks
ALTER TABLE public.tasks 
  ADD COLUMN priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN estimated_minutes integer DEFAULT NULL,
  ADD COLUMN due_date date DEFAULT NULL,
  ADD COLUMN time_block_start timestamp with time zone DEFAULT NULL,
  ADD COLUMN time_block_end timestamp with time zone DEFAULT NULL,
  ADD COLUMN quadrant text DEFAULT NULL;

-- Create focus_sessions table for pomodoro timer
CREATE TABLE public.focus_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone DEFAULT NULL,
  duration_minutes integer NOT NULL DEFAULT 25,
  session_type text NOT NULL DEFAULT 'focus',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read focus_sessions" ON public.focus_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert focus_sessions" ON public.focus_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update focus_sessions" ON public.focus_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete focus_sessions" ON public.focus_sessions FOR DELETE USING (true);
