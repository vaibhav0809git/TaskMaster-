import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useUIStore } from '../store/uiStore';
import { useCreateTask, useUpdateTask, useAISuggest } from '../api/hooks';
import { Priority, TaskStatus } from '../types';
import { addDays, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Other'];

const INPUT_CLS = 'w-full px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all';

export function TaskForm() {
  const { isTaskFormOpen, closeTaskForm, editingTask, prefillDate } = useUIStore();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const aiSuggest = useAISuggest();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status === 'ARCHIVED' ? 'PENDING' : editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : null);
      setReminder(editingTask.reminder ? new Date(editingTask.reminder) : null);
      setTags(editingTask.tags || []);
      setCategory(editingTask.category || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
      setPriority('MEDIUM');
      setDueDate(prefillDate ? startOfDay(prefillDate) : null);
      setReminder(null);
      setTags([]);
      setTagInput('');
      setCategory('');
    }
  }, [editingTask, isTaskFormOpen]);

  const handleAISuggest = async () => {
    if (!title.trim()) { toast.error('Enter a title first'); return; }
    const toastId = toast.loading('✨ Getting AI suggestions...');
    try {
      const s = await aiSuggest.mutateAsync(title);
      if (s.description) setDescription(s.description);
      if (s.priority) setPriority(s.priority);
      if (s.suggestedDueDays) setDueDate(addDays(new Date(), s.suggestedDueDays));
      if (s.tags?.length) setTags(s.tags);
      if (s.category) setCategory(s.category);
      toast.success('AI suggestions applied!', { id: toastId });
    } catch {
      toast.error('AI suggestion failed', { id: toastId });
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(tag)) setTags([...tags, tag]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }

    const data = {
      title: title.trim(), description, status, priority,
      dueDate: dueDate?.toISOString(), reminder: reminder?.toISOString(),
      tags, category,
    };

    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data });
        toast.success('Task updated');
      } else {
        await createTask.mutateAsync(data);
        toast.success('Task created');
      }
      closeTaskForm();
    } catch {
      toast.error('Failed to save task');
    }
  };

  if (!isTaskFormOpen) return null;

  const isLoading = createTask.isPending || updateTask.isPending;

  const reminderMinTime = (() => {
    const now = new Date();
    if (reminder && startOfDay(reminder).getTime() === startOfDay(now).getTime()) return now;
    return startOfDay(new Date());
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={closeTaskForm} />
      <div className="relative w-full max-w-lg bg-white rounded-[16px] shadow-modal animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-2">
          <h2 className="font-semibold text-ink">{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={closeTaskForm} className="w-8 h-8 rounded-input hover:bg-surface-2 flex items-center justify-center text-muted hover:text-ink transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title + AI */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Title *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAISuggest}
                disabled={aiSuggest.isPending}
                className="px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm font-medium hover:bg-surface-2 transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                <span>{aiSuggest.isPending ? '⏳' : '✨'}</span>
                <span className="hidden sm:block">AI Fill</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 bg-surface border border-surface-3 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={setDueDate}
                placeholderText="Set due date"
                dateFormat="MMM d, yyyy"
                className={INPUT_CLS}
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="datepicker-portal"
                popperPlacement="bottom-start"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Reminder</label>
              <DatePicker
                selected={reminder}
                onChange={setReminder}
                placeholderText="Date & time"
                showTimeSelect
                dateFormat="MMM d, h:mm aa"
                timeIntervals={15}
                minTime={reminderMinTime}
                maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
                timeCaption="Time"
                className={INPUT_CLS}
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="datepicker-portal"
                popperPlacement="bottom-start"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(category === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-badge text-xs font-medium transition-all ${
                    category === c ? 'bg-ink text-white' : 'bg-surface-2 text-muted hover:bg-surface-3 hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-surface border border-surface-3 rounded-input min-h-[42px] focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-surface-3 text-muted text-xs px-2 py-0.5 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-danger">×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder={tags.length === 0 ? 'Add tags (Enter to add)' : ''}
                className="flex-1 min-w-[80px] text-xs bg-transparent outline-none placeholder:text-muted"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeTaskForm}
              className="flex-1 px-4 py-2.5 border border-surface-3 rounded-input text-sm font-medium text-muted hover:bg-surface hover:text-ink transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-ink text-white rounded-input text-sm font-medium hover:bg-ink/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                editingTask ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
