import React, { useState, useCallback } from 'react';
import { useUIStore } from '../store/uiStore';
import { useUpcomingReminders } from '../api/hooks';
import { formatRelative } from '../utils';

export function Header() {
  const { openTaskForm, toggleAIPanel, isAIPanelOpen, view, setView, setSearchQuery, searchQuery } = useUIStore();
  const { data: reminders = [] } = useUpcomingReminders();
  const [showReminders, setShowReminders] = useState(false);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  return (
    <header className="bg-white border-b border-surface-3 px-6 h-16 flex items-center gap-4 sticky top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 bg-ink rounded-[8px] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-semibold text-ink text-[15px] tracking-tight">TaskMaster</span>
      </div>

      {/* View Switcher */}
      <div className="flex items-center bg-surface rounded-[8px] p-1 gap-0.5">
        {(['list', 'kanban', 'calendar'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium capitalize transition-all ${
              view === v ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          id="search-input"
          type="text"
          placeholder="Search tasks… (/)"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-9 pr-4 py-2 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Reminder Bell */}
        <div className="relative">
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="w-9 h-9 rounded-input bg-surface hover:bg-surface-2 flex items-center justify-center transition-colors relative"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {reminders.length}
              </span>
            )}
          </button>
          {showReminders && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-card shadow-modal border border-surface-3 z-50 animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-2">
                <p className="text-sm font-semibold text-ink">Upcoming Reminders</p>
                <p className="text-xs text-muted">Next 24 hours</p>
              </div>
              {reminders.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted">No upcoming reminders</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {reminders.map((task) => (
                    <div key={task.id} className="px-4 py-3 border-b border-surface-2 last:border-0 hover:bg-surface transition-colors">
                      <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                      <p className="text-xs text-muted mt-0.5">{task.reminder ? formatRelative(task.reminder) : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Toggle */}
        <button
          onClick={toggleAIPanel}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-input text-sm font-medium transition-all ${
            isAIPanelOpen ? 'bg-ink text-white' : 'bg-surface hover:bg-surface-2 text-ink'
          }`}
        >
          <span>✨</span>
          <span className="hidden sm:block">AI</span>
        </button>

        {/* New Task */}
        <button
          onClick={() => openTaskForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white rounded-input text-sm font-medium hover:bg-ink/90 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>New Task</span>
          <kbd className="hidden lg:block text-[10px] opacity-50 bg-white/20 px-1 rounded">N</kbd>
        </button>
      </div>
    </header>
  );
}
