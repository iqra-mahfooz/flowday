import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FocusSession } from '@/types/gitspace';

export function useFocusSessions() {
  return useQuery({
    queryKey: ['focus_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as FocusSession[];
    },
    staleTime: 10_000,
  });
}

export function useTodaySessions() {
  return useQuery({
    queryKey: ['focus_sessions', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .gte('started_at', today.toISOString())
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data as FocusSession[];
    },
    staleTime: 10_000,
  });
}

export function useCreateFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: Partial<FocusSession>) => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          task_id: session.task_id ?? null,
          duration_minutes: session.duration_minutes ?? 25,
          session_type: session.session_type ?? 'focus',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as FocusSession;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus_sessions'] });
    },
  });
}

export function useCompleteFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({ completed: true, ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as FocusSession;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus_sessions'] });
    },
  });
}
