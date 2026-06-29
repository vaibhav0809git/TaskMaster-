import React from 'react';
import { useTask } from '../api/hooks';
import { useUIStore } from '../store/uiStore';
import { formatTimestamp, formatRelative, getFieldLabel, formatFieldValue, priorityConfig, statusConfig } from '../utils';
import { Task } from '../types';

const actionConfig: Record<string, { label: string; icon: string; color: string; dot: string }> = {
  CREATED: { label: 'Created', icon: '✦', color: 'text-success', dot: 'bg-success' },
  UPDATED: { label: 'Updated', icon: '✎', color: 'text-accent', dot: 'bg-accent' },
  COMPLETED: { label: 'Completed', icon: '✓', color: 'text-success', dot: 'bg-success' },
  REOPENED: { label: 'Reopened', icon: '↺', color: 'text-warning', dot: 'bg-warning' },
  DELETED: { label: 'Archived', icon: '⊗', color: 'text-danger', dot: 'bg-danger' },
};

export function TaskDetailDrawer() {
  const { selectedTaskId, setSelectedTask, openTaskForm } = useUIStore();
  const { data: task, isLoading } = useTask(selectedTaskId || '');

  if (!selectedTaskId) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1" onClick={() => setSelectedTask(null)} />
      <div className="w-full max-w-md bg-white shadow-drawer border-l border-surface-3 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-2">
          <h3 className="font-semibold text-ink">Task Details</h3>
          <div className="flex items-center gap-2">
            {task && (
              <button
                onClick={() => { openTaskForm(task); setSelectedTask(null); }}
                className="px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-2 rounded-input transition-colors text-muted hover:text-ink"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setSelectedTask(null)}
              className="w-8 h-8 rounded-input hover:bg-surface-2 flex items-center justify-center text-muted hover:text-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 p-6 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-2 rounded-card animate-pulse" />)}
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto">
            {/* Task Info */}
            <div className="p-6 border-b border-surface-2">
              <h2 className="font-semibold text-ink text-lg leading-snug mb-3">{task.title}</h2>
              {task.description && <p className="text-sm text-muted leading-relaxed mb-4">{task.description}</p>}

              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Priority" value={
                  <span className={`text-xs font-medium ${priorityConfig[task.priority].color}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                } />
                <InfoRow label="Status" value={
                  <span className={`text-xs font-medium ${statusConfig[task.status].color}`}>
                    {statusConfig[task.status].label}
                  </span>
                } />
                {task.dueDate && <InfoRow label="Due Date" value={<span className="text-xs text-ink">{formatTimestamp(task.dueDate).split('·')[0]}</span>} />}
                {task.reminder && <InfoRow label="Reminder" value={<span className="text-xs text-ink">{formatRelative(task.reminder)}</span>} />}
                {task.category && <InfoRow label="Category" value={<span className="text-xs text-ink">{task.category}</span>} />}
              </div>

              {task.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {task.tags.map((t) => (
                    <span key={t} className="text-[11px] bg-surface-2 text-muted px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* History Timeline */}
            <div className="p-6">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Edit History</h4>
              {task.history && task.history.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-surface-3" />
                  <div className="space-y-4">
                    {task.history.map((entry) => {
                      const cfg = actionConfig[entry.action] || actionConfig.UPDATED;
                      return (
                        <div key={entry.id} className="flex gap-3 relative pl-8">
                          <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full ${cfg.dot} flex items-center justify-center text-white text-[11px] font-bold z-10`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-[11px] text-muted font-mono flex-shrink-0">{formatRelative(entry.timestamp)}</span>
                            </div>
                            {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                            {entry.changes && Array.isArray(entry.changes) && (entry.changes as any[]).length > 0 && (
                              <div className="mt-1.5 space-y-1">
                                {(entry.changes as any[]).map((c, i) => (
                                  <div key={i} className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-medium text-ink">{getFieldLabel(c.field)}:</span>
                                    <span className="text-[11px] text-muted line-through">{formatFieldValue(c.field, c.from)}</span>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9B9A97" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    <span className="text-[11px] font-medium text-ink">{formatFieldValue(c.field, c.to)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-[10px] text-muted/60 mt-1 font-mono">{formatTimestamp(entry.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted">No history yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted text-sm">Task not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-input p-2.5">
      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">{label}</p>
      {value}
    </div>
  );
}
