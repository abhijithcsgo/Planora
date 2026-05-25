import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { Note } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class SampleDataService {
  /** Known demo task titles — used to detect and remove legacy sample data */
  static readonly SAMPLE_TASK_TITLES = [
    'Quarterly report presentation',
    'Grocery shopping',
    'Angular chapter 5 study',
    'Morning workout',
    'Client follow-up email',
    'Book dentist appointment',
    'Team standup notes',
    'Read productivity article',
  ] as const;

  static readonly SAMPLE_NOTE_TITLES = [
    'Meeting ideas',
    'Weekend plans',
    'Book recommendations',
  ] as const;

  generateTasks(): Task[] {
    const now = new Date();
    const addDays = (d: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      return date.toISOString().split('T')[0];
    };
    const addHours = (h: number) => {
      const date = new Date(now);
      date.setHours(date.getHours() + h);
      return date.toISOString();
    };

    return [
      {
        id: crypto.randomUUID(),
        title: 'Quarterly report presentation',
        description: 'Prepare slides and metrics for Q2 review meeting.',
        completed: false,
        priority: 'high',
        category: 'work',
        dueDate: addDays(0),
        dueTime: '14:00',
        reminderEnabled: true,
        reminderDateTime: addHours(1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 0,
      },
      {
        id: crypto.randomUUID(),
        title: 'Grocery shopping',
        description: 'Milk, eggs, vegetables, and coffee beans.',
        completed: false,
        priority: 'medium',
        category: 'other',
        dueDate: addDays(0),
        dueTime: '18:30',
        reminderEnabled: true,
        reminderDateTime: addHours(3),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        title: 'Angular chapter 5 study',
        description: 'Complete reactive forms exercises.',
        completed: false,
        priority: 'medium',
        category: 'study',
        dueDate: addDays(1),
        dueTime: '10:00',
        reminderEnabled: false,
        reminderDateTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        title: 'Morning workout',
        description: '30 min cardio and stretching.',
        completed: true,
        priority: 'low',
        category: 'personal',
        dueDate: addDays(-1),
        dueTime: '07:00',
        reminderEnabled: false,
        reminderDateTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 3,
      },
      {
        id: crypto.randomUUID(),
        title: 'Client follow-up email',
        description: 'Send project timeline update to stakeholders.',
        completed: false,
        priority: 'high',
        category: 'work',
        dueDate: addDays(2),
        dueTime: '11:00',
        reminderEnabled: true,
        reminderDateTime: addHours(24),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 4,
      },
      {
        id: crypto.randomUUID(),
        title: 'Book dentist appointment',
        description: 'Call clinic for routine checkup.',
        completed: false,
        priority: 'low',
        category: 'personal',
        dueDate: addDays(3),
        dueTime: '09:00',
        reminderEnabled: false,
        reminderDateTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 5,
      },
      {
        id: crypto.randomUUID(),
        title: 'Team standup notes',
        description: 'Document blockers and action items.',
        completed: true,
        priority: 'medium',
        category: 'work',
        dueDate: addDays(-2),
        dueTime: '09:30',
        reminderEnabled: false,
        reminderDateTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 6,
      },
      {
        id: crypto.randomUUID(),
        title: 'Read productivity article',
        description: 'Review latest SaaS dashboard design patterns.',
        completed: false,
        priority: 'low',
        category: 'study',
        dueDate: addDays(4),
        dueTime: '20:00',
        reminderEnabled: false,
        reminderDateTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 7,
      },
    ];
  }

  generateNotes(): Note[] {
    return [
      {
        id: crypto.randomUUID(),
        title: 'Meeting ideas',
        content: 'Discuss sprint goals, design system updates, and Q3 roadmap.',
        color: '#6366f1',
        pinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Weekend plans',
        content: 'Hiking trail, farmer market, and dinner with friends.',
        color: '#10b981',
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Book recommendations',
        content: 'Atomic Habits, Deep Work, The Pragmatic Programmer.',
        color: '#f59e0b',
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
