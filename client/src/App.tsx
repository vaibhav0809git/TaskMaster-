import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { TaskList } from './components/TaskList';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { AIAssistant } from './components/AIAssistant';
import { TaskForm } from './components/TaskForm';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { Dashboard } from './components/Dashboard';
import { useTasks } from './api/hooks';
import { useUIStore } from './store/uiStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useKeyboardShortcuts } from './hooks/useKeyboard';

export default function App() {
  const { view, filters, searchQuery, isAIPanelOpen } = useUIStore();
  useWebSocket();
  useKeyboardShortcuts();

  const queryFilters = {
    ...filters,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  const { data: tasks = [], isLoading } = useTasks(queryFilters);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Filter sidebar — hide on calendar/kanban */}
          {view === 'list' && (
            <aside className="hidden lg:block w-52 flex-shrink-0 p-5 overflow-y-auto border-r border-surface-3 bg-white/50">
              <FilterSidebar />
            </aside>
          )}

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-5 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Dashboard stats always visible */}
              {view === 'list' && <Dashboard />}

              {/* View content */}
              {view === 'list' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-ink">
                      All Tasks
                      {tasks.length > 0 && (
                        <span className="ml-2 text-sm font-mono text-muted">{tasks.length}</span>
                      )}
                    </h2>
                  </div>
                  <TaskList tasks={tasks} isLoading={isLoading} />
                </>
              )}

              {view === 'kanban' && (
                <>
                  <h2 className="font-semibold text-ink">Kanban Board</h2>
                  <KanbanBoard tasks={tasks} />
                </>
              )}

              {view === 'calendar' && (
                <>
                  <h2 className="font-semibold text-ink">Calendar</h2>
                  <CalendarView />
                </>
              )}
            </div>
          </main>
        </div>

        {/* AI Panel */}
        {isAIPanelOpen && <AIAssistant />}
      </div>

      {/* Modals & Drawers */}
      <TaskForm />
      <TaskDetailDrawer />

      {/* Portal for DatePicker popups — keeps them above modals */}
      <div id="datepicker-portal" />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            background: '#fff',
            color: '#1A1A18',
            border: '1px solid #E8E7E4',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#0F9D58', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E84040', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
