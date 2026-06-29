import React from 'react';
import { useStats, useUpcomingReminders } from '../api/hooks';
import { formatRelative, priorityConfig } from '../utils';
import { useUIStore } from '../store/uiStore';

export function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const { data: reminders = [] } = useUpcomingReminders();
  const { openTaskForm } = useUIStore();

  const cards = [
    { label: 'Total Tasks', value: stats?.total ?? 0, icon: '◈', color: 'text-ink', bg: 'bg-surface-2' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: '◎', color: 'text-accent', bg: 'bg-blue-50' },
    { label: 'Done Today', value: stats?.completedToday ?? 0, icon: '◉', color: 'text-success', bg: 'bg-green-50' },
    { label: 'Overdue', value: stats?.overdue ?? 0, icon: '◈', color: 'text-danger', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-card shadow-card p-5">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-16 bg-surface-3 rounded animate-pulse" />
                <div className="h-8 w-12 bg-surface-3 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted font-medium">{card.label}</p>
                  <span className={`w-7 h-7 rounded-input ${card.bg} flex items-center justify-center ${card.color} text-lg`}>{card.icon}</span>
                </div>
                <p className={`text-3xl font-semibold ${card.color} font-mono`}>{card.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming Reminders Strip */}
      {reminders.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
              <span>🔔</span> Upcoming Reminders
            </h3>
            <span className="text-xs text-muted">Next 24 hours</span>
          </div>
          <div className="space-y-2">
            {reminders.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 bg-surface rounded-input hover:bg-surface-2 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[task.priority].dot}`} />
                <span className="flex-1 text-sm text-ink truncate">{task.title}</span>
                <span className="text-xs text-muted flex-shrink-0">{task.reminder ? formatRelative(task.reminder) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-ink to-ink/90 rounded-card p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-white" />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full border-2 border-white" />
        </div>
        <div className="relative">
          <h3 className="font-semibold text-lg mb-1">Ready to be productive?</h3>
          <p className="text-white/60 text-sm mb-4">Start adding tasks or let AI help you plan your day.</p>
          <button
            onClick={() => openTaskForm()}
            className="px-4 py-2 bg-white text-ink rounded-input text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            + Add First Task
          </button>
        </div>
      </div>
    </div>
  );
}
