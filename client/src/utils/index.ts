import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { Priority, TaskStatus } from '../types';
import clsx from 'clsx';

export { clsx };

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  LOW: { label: 'Low', color: 'text-muted', bg: 'bg-surface-2', dot: 'bg-muted' },
  MEDIUM: { label: 'Medium', color: 'text-accent', bg: 'bg-blue-50', dot: 'bg-accent' },
  HIGH: { label: 'High', color: 'text-warning', bg: 'bg-amber-50', dot: 'bg-warning' },
  URGENT: { label: 'Urgent', color: 'text-danger', bg: 'bg-red-50', dot: 'bg-danger' },
};

export const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-muted', bg: 'bg-surface-2' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-accent', bg: 'bg-blue-50' },
  COMPLETED: { label: 'Completed', color: 'text-success', bg: 'bg-green-50' },
  ARCHIVED: { label: 'Archived', color: 'text-muted', bg: 'bg-surface-3' },
};

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTimestamp(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function isOverdue(dueDate?: string | null, status?: TaskStatus): boolean {
  if (!dueDate || status === 'COMPLETED' || status === 'ARCHIVED') return false;
  return isPast(new Date(dueDate));
}

export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: 'Title', description: 'Description', status: 'Status', priority: 'Priority',
    dueDate: 'Due Date', reminder: 'Reminder', tags: 'Tags', category: 'Category',
  };
  return labels[field] || field;
}

export function formatFieldValue(field: string, value: any): string {
  if (value === null || value === undefined) return 'None';
  if (field === 'dueDate' || field === 'reminder') return value ? formatDate(value) : 'None';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
  return String(value);
}
