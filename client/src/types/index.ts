export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  reminder?: string;
  reminderSent: boolean;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  history?: TaskHistory[];
}

export interface TaskHistory {
  id: string;
  taskId: string;
  action: string;
  changes?: Array<{ field: string; from: any; to: any }>;
  timestamp: string;
  note?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  completedToday: number;
  overdue: number;
}

export interface AISuggestion {
  description: string;
  priority: Priority;
  suggestedDueDays: number;
  tags: string[];
  category: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  reminder?: string;
  tags?: string[];
  category?: string;
}
