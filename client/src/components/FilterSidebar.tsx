import React from 'react';
import { useUIStore } from '../store/uiStore';
import { Priority, TaskStatus } from '../types';
import { priorityConfig, statusConfig } from '../utils';

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Other'];

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useUIStore();
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <aside className="w-52 flex-shrink-0 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Filters</span>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[11px] text-danger hover:text-danger/80 font-medium">Clear</button>
        )}
      </div>

      {/* Priority */}
      <div>
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">Priority</p>
        <div className="space-y-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilter('priority', filters.priority === p ? '' : p)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-input text-xs transition-all text-left ${
                filters.priority === p ? 'bg-ink text-white' : 'hover:bg-surface-2 text-muted hover:text-ink'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${priorityConfig[p].dot}`} />
              {priorityConfig[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">Status</p>
        <div className="space-y-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter('status', filters.status === s ? '' : s)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-input text-xs transition-all text-left ${
                filters.status === s ? 'bg-ink text-white' : 'hover:bg-surface-2 text-muted hover:text-ink'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig[s].bg.replace('bg-', 'bg-').replace('-50', '-400')}`} />
              {statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter('category', filters.category === c ? '' : c)}
              className={`w-full px-3 py-2 rounded-input text-xs text-left transition-all ${
                filters.category === c ? 'bg-ink text-white' : 'hover:bg-surface-2 text-muted hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
