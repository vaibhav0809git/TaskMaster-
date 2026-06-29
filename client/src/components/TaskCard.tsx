import React, { useState } from 'react';
import { Task } from '../types';
import { priorityConfig, statusConfig, formatDate, isOverdue, formatRelative } from '../utils';
import { useDeleteTask, useToggleComplete } from '../api/hooks';
import { useUIStore } from '../store/uiStore';
import toast from 'react-hot-toast';

interface Props { task: Task; }

export function TaskCard({ task }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { openTaskForm, setSelectedTask } = useUIStore();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleComplete();
  const overdue = isOverdue(task.dueDate, task.status);
  const pCfg = priorityConfig[task.priority];
  const sCfg = statusConfig[task.status];

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    await deleteTask.mutateAsync(task.id);
    toast.success('Task deleted');
    setConfirmDelete(false);
  };

  const handleToggle = async () => {
    await toggleComplete.mutateAsync(task.id);
    toast.success(task.status === 'COMPLETED' ? 'Reopened' : 'Completed! 🎉');
  };

  return (
    <div className={`group bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 border border-transparent hover:border-surface-3 ${overdue ? 'border-l-4 !border-l-danger' : ''} relative`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className={`mt-0.5 w-5 h-5 rounded-[5px] border-2 flex-shrink-0 transition-all flex items-center justify-center ${
              task.status === 'COMPLETED'
                ? 'bg-success border-success'
                : 'border-surface-3 hover:border-accent'
            }`}
          >
            {task.status === 'COMPLETED' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="m20 6-11 11-5-5"/>
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-[15px] leading-snug ${task.status === 'COMPLETED' ? 'line-through text-muted' : 'text-ink'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-badge ${pCfg.bg} ${pCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                {pCfg.label}
              </span>

              {/* Status */}
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-badge ${sCfg.bg} ${sCfg.color}`}>
                {sCfg.label}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span className={`text-[11px] flex items-center gap-1 ${overdue ? 'text-danger font-medium' : 'text-muted'}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
                </span>
              )}

              {/* Reminder */}
              {task.reminder && (
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {formatRelative(task.reminder)}
                </span>
              )}

              {/* Category */}
              {task.category && (
                <span className="text-[11px] text-muted bg-surface-2 px-2 py-0.5 rounded-badge">{task.category}</span>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-[11px] bg-surface-2 text-muted px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — reveal on hover */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setSelectedTask(task.id)}
          title="View history"
          className="w-7 h-7 rounded-[6px] hover:bg-surface-2 flex items-center justify-center text-muted hover:text-ink transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </button>
        <button
          onClick={() => openTaskForm(task)}
          title="Edit task"
          className="w-7 h-7 rounded-[6px] hover:bg-surface-2 flex items-center justify-center text-muted hover:text-ink transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
          className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all ${
            confirmDelete ? 'bg-danger text-white' : 'hover:bg-red-50 text-muted hover:text-danger'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
