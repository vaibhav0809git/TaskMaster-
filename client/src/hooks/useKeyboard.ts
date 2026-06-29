import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export function useKeyboardShortcuts() {
  const { openTaskForm, isTaskFormOpen, closeTaskForm, setSearchQuery } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' && !isTaskFormOpen) { e.preventDefault(); openTaskForm(); }
      if (e.key === 'Escape' && isTaskFormOpen) { closeTaskForm(); }
      if (e.key === '/') { e.preventDefault(); document.getElementById('search-input')?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isTaskFormOpen, openTaskForm, closeTaskForm, setSearchQuery]);
}
