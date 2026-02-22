import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommitLog, ActionType } from '@/types/gitspace';

export function useCommitLog() {
  const qc = useQueryClient();

  const logCommit = async (taskId: string, actionType: ActionType, message: string) => {
    const { error } = await supabase.from('commit_log').insert({
      task_id: taskId,
      action_type: actionType,
      message,
      timestamp: new Date().toISOString(),
    });
    if (error) console.error('Commit log error:', error);
    qc.invalidateQueries({ queryKey: ['commit_log'] });
  };

  return { logCommit };
}

export function useCommitHistory(taskId?: string | null) {
  return useQuery({
    queryKey: ['commit_log', taskId],
    queryFn: async () => {
      let query = supabase
        .from('commit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommitLog[];
    },
    staleTime: 10_000,
  });
}

export function generateShortHash(id: string): string {
  return id.replace(/-/g, '').slice(0, 7);
}
