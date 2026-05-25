import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ReminderItem } from '../models/reminder.model';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly taskService = inject(TaskService);
  private readonly dismissedSubject = new BehaviorSubject<Set<string>>(new Set());
  /** taskId -> reminderDateTime when notification was sent */
  private readonly notifiedAt = new Map<string, string>();

  readonly reminders$ = combineLatest([
    this.taskService.tasks$,
    this.dismissedSubject,
  ]).pipe(
    map(([tasks, dismissed]) => {
      const now = new Date();
      return tasks
        .filter((t) => t.reminderEnabled && t.reminderDateTime && !t.completed)
        .map(
          (t): ReminderItem => ({
            id: t.id,
            taskId: t.id,
            taskTitle: t.title,
            reminderDateTime: t.reminderDateTime,
            dismissed: dismissed.has(t.id),
            notified: this.notifiedAt.get(t.id) === t.reminderDateTime,
          }),
        )
        .filter((r) => new Date(r.reminderDateTime) >= now || !r.dismissed)
        .sort(
          (a, b) =>
            new Date(a.reminderDateTime).getTime() -
            new Date(b.reminderDateTime).getTime(),
        );
    }),
  );

  readonly upcoming$ = this.reminders$.pipe(
    map((items) =>
      items
        .filter((r) => !r.dismissed && new Date(r.reminderDateTime) >= new Date())
        .slice(0, 10),
    ),
  );

  readonly badgeCount$ = this.upcoming$.pipe(map((items) => items.length));

  dismiss(id: string): void {
    const next = new Set(this.dismissedSubject.value);
    next.add(id);
    this.dismissedSubject.next(next);
  }

  clearNotified(taskId: string): void {
    this.notifiedAt.delete(taskId);
  }

  /** Check tasks every 10s; fire when reminder time is reached */
  startPolling(onReminder: (item: ReminderItem) => void): () => void {
    const tick = () => {
      const now = Date.now();
      this.taskService.getTasks().forEach((task) => {
        if (
          !task.reminderEnabled ||
          !task.reminderDateTime ||
          task.completed
        ) {
          return;
        }
        if (this.notifiedAt.get(task.id) === task.reminderDateTime) {
          return;
        }
        const due = new Date(task.reminderDateTime).getTime();
        if (Number.isNaN(due) || due > now) {
          return;
        }
        this.notifiedAt.set(task.id, task.reminderDateTime);
        onReminder({
          id: task.id,
          taskId: task.id,
          taskTitle: task.title,
          reminderDateTime: task.reminderDateTime,
          dismissed: false,
          notified: true,
        });
      });
    };

    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }
}
