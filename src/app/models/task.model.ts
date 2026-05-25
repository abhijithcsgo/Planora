export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'study' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  dueTime: string;
  reminderEnabled: boolean;
  reminderDateTime: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export type TaskSortField = 'dueDate' | 'priority' | 'title' | 'createdAt' | 'order';
export type TaskSortDirection = 'asc' | 'desc';

export interface TaskFilter {
  search: string;
  category: TaskCategory | 'all';
  priority: TaskPriority | 'all';
  status: 'all' | 'completed' | 'pending';
}
