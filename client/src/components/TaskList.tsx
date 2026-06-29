import React from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { useUIStore } from '../store/uiStore';

interface Props { tasks: Task[]; isLoading: boolean; }

function SkeletonCard() {
  return (
    <div className="bg-white rounded-card shadow-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-surface-3 rounded-[5px] flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-3 rounded w-3/4" />
          <div className="h-3 bg-surface-3 rounded w-1/2" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-surface-3 rounded-badge w-16" />
            <div className="h-5 bg-surface-3 rounded-badge w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks, isLoading }: Props) {
  const { openTaskForm } = useUIStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 opacity-30">
          <rect x="8" y="12" width="48" height="40" rx="6" stroke="#1A1A18" strokeWidth="2"/>
          <path d="M20 24h24M20 32h16M20 40h12" stroke="#1A1A18" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="48" cy="48" r="10" fill="#F8F8F7" stroke="#1A1A18" strokeWidth="2"/>
          <path d="M45 48h6M48 45v6" stroke="#1A1A18" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h3 className="font-semibold text-ink mb-1">No tasks found</h3>
        <p className="text-sm text-muted mb-4">Create your first task to get started</p>
        <button
          onClick={() => openTaskForm()}
          className="px-4 py-2 bg-ink text-white rounded-input text-sm font-medium hover:bg-ink/90 transition-all"
        >
          + Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
