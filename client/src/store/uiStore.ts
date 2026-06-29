import { create } from 'zustand';
import { Task } from '../types';

interface UIState {
  view: 'list' | 'kanban' | 'calendar';
  setView: (v: 'list' | 'kanban' | 'calendar') => void;

  selectedTaskId: string | null;
  setSelectedTask: (id: string | null) => void;

  isTaskFormOpen: boolean;
  editingTask: Task | null;
  prefillDate: Date | null;
  openTaskForm: (task?: Task, prefillDate?: Date) => void;
  closeTaskForm: () => void;

  isAIPanelOpen: boolean;
  toggleAIPanel: () => void;

  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'list',
  setView: (view) => set({ view }),

  selectedTaskId: null,
  setSelectedTask: (id) => set({ selectedTaskId: id }),

  isTaskFormOpen: false,
  editingTask: null,
  prefillDate: null,
  openTaskForm: (task, prefillDate) => set({ isTaskFormOpen: true, editingTask: task || null, prefillDate: prefillDate || null }),
  closeTaskForm: () => set({ isTaskFormOpen: false, editingTask: null, prefillDate: null }),

  isAIPanelOpen: false,
  toggleAIPanel: () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),

  filters: {},
  setFilter: (key, value) => set((s) => ({ filters: value ? { ...s.filters, [key]: value } : Object.fromEntries(Object.entries(s.filters).filter(([k]) => k !== key)) })),
  clearFilters: () => set({ filters: {} }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
