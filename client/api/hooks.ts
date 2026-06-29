import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { Task, TaskStats, CreateTaskInput } from '../types';

export function useTasks(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {}).toString();
  return useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: () => api.get(`/tasks?${params}`).then((r) => r.data),
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => api.get(`/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useStats() {
  return useQuery<TaskStats>({
    queryKey: ['stats'],
    queryFn: () => api.get('/reminders/stats').then((r) => r.data),
    refetchInterval: 30000,
  });
}

export function useUpcomingReminders() {
  return useQuery<Task[]>({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders/upcoming').then((r) => r.data),
    refetchInterval: 60000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => api.post('/tasks', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskInput> }) =>
      api.put(`/tasks/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
}

export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/complete`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
}

export function useAISuggest() {
  return useMutation({
    mutationFn: (title: string) => api.post('/ai/suggest', { title }).then((r) => r.data),
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: (message: string) => api.post('/ai/chat', { message }).then((r) => r.data),
  });
}
