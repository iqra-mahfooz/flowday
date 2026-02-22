import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/gitspace';
import { useCommitLog } from './useCommitLog';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { logCommit } = useCommitLog();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title ?? 'Untitled Task',
          markdown_content: task.markdown_content ?? '',
          project_id: task.project_id ?? null,
          status: 'open',
          priority: task.priority ?? 'medium',
          estimated_minutes: task.estimated_minutes ?? null,
          due_date: task.due_date ?? null,
          time_block_start: task.time_block_start ?? null,
          time_block_end: task.time_block_end ?? null,
          quadrant: task.quadrant ?? null,
          x: task.x ?? 300,
          y: task.y ?? 300,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: async (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      await logCommit(task.id, 'CREATE', `feat: created task "${task.title}"`);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { logCommit } = useCommitLog();

  return useMutation({
    mutationFn: async ({ id, updates, logEdit }: { id: string; updates: Partial<Task>; logEdit?: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { task: data as Task, logEdit };
    },
    onSuccess: async ({ task, logEdit }) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      if (task.status === 'complete' && logEdit === undefined) {
        await logCommit(task.id, 'COMPLETE', `chore: closed task #${task.id.slice(0, 7)} - ${task.title}`);
      } else if (logEdit) {
        await logCommit(task.id, 'EDIT', `docs: updated task "${task.title}"`);
      }
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { logCommit } = useCommitLog();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      await logCommit(id, 'DELETE', `chore: deleted task #${id.slice(0, 7)} - ${title}`);
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
