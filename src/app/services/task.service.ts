import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import {
  Task,
  TaskFilter,
  TaskPriority,
  TaskSortDirection,
  TaskSortField,
} from '../models/task.model';
import { todayLocalDateString } from '../core/utils/date.util';
import { StorageService } from './storage.service';
import { SampleDataService } from './sample-data.service';

const STORAGE_KEY = 'taskflow_tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly sampleData = inject(SampleDataService);
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);

  readonly tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.load();
  }

  private load(): void {
    const tasks = (this.storage.get<Task[]>(STORAGE_KEY) ?? []).map((t) =>
      this.normalizeTask(t),
    );
    this.tasksSubject.next(tasks);
  }

  /** Migrate legacy category values and ensure shape */
  private normalizeTask(task: Task): Task {
    const raw = task.category as string;
    const category =
      raw === 'shopping' ? 'other' : (raw as Task['category']);
    return {
      ...task,
      category,
      dueDate: task.dueDate ?? '',
      dueTime: task.dueTime ?? '',
    };
  }

  private persist(tasks: Task[]): void {
    this.storage.set(STORAGE_KEY, tasks);
    this.tasksSubject.next(tasks);
  }

  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find((t) => t.id === id);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Task {
    const tasks = this.tasksSubject.value;
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: tasks.length,
    };
    this.persist([...tasks, newTask]);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.tasksSubject.value.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
    );
    this.persist(tasks);
  }

  deleteTask(id: string): void {
    this.persist(this.tasksSubject.value.filter((t) => t.id !== id));
  }

  toggleComplete(id: string): void {
    const task = this.getTaskById(id);
    if (task) {
      this.updateTask(id, { completed: !task.completed });
    }
  }

  reorderTasks(orderedIds: string[]): void {
    const map = new Map(this.tasksSubject.value.map((t) => [t.id, t]));
    const reordered = orderedIds
      .map((id, index) => {
        const task = map.get(id);
        return task ? { ...task, order: index, updatedAt: new Date().toISOString() } : null;
      })
      .filter((t): t is Task => t !== null);
    const remaining = this.tasksSubject.value.filter((t) => !orderedIds.includes(t.id));
    this.persist([...reordered, ...remaining]);
  }

  /** Stats and filtered views */
  stats$ = this.tasks$.pipe(
    map((tasks) => {
      const today = todayLocalDateString();
      const completed = tasks.filter((t) => t.completed).length;
      const pending = tasks.length - completed;
      const todayTasks = tasks.filter(
        (t) => !t.completed && t.dueDate === today,
      ).length;
      const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
      return { total: tasks.length, completed, pending, todayTasks, progress };
    }),
  );

  filterAndSort(
    tasks: Task[],
    filter: TaskFilter,
    sortField: TaskSortField,
    sortDir: TaskSortDirection,
  ): Task[] {
    let result = [...tasks];

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (filter.category !== 'all') {
      result = result.filter((t) => t.category === filter.category);
    }
    if (filter.priority !== 'all') {
      result = result.filter((t) => t.priority === filter.priority);
    }
    if (filter.status === 'completed') {
      result = result.filter((t) => t.completed);
    } else if (filter.status === 'pending') {
      result = result.filter((t) => !t.completed);
    }

    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) {
            cmp = 0;
          } else if (!a.dueDate) {
            cmp = 1;
          } else if (!b.dueDate) {
            cmp = -1;
          } else {
            cmp = `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`);
          }
          break;
        }
        case 'priority':
          cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
        case 'order':
          cmp = a.order - b.order;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }

  resetToSample(): void {
    const sample = this.sampleData.generateTasks();
    this.persist(sample);
  }

  clearAll(): void {
    this.persist([]);
  }
}
