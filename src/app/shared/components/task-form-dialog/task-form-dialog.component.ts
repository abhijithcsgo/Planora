import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, OnInit, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task, TaskCategory, TaskPriority } from '../../../models/task.model';
import {
  combineLocalDateAndTime,
  parseReminderToForm,
  toLocalDateString,
} from '../../../core/utils/date.util';
import { TitlecasePipe } from '../../pipes/titlecase.pipe';

export interface TaskFormDialogData {
  task?: Task;
  presetDate?: string;
}

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TitlecasePipe,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
})
export class TaskFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly breakpoint = inject(BreakpointObserver);
  readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly isHandset = toSignal(
    this.breakpoint.observe('(max-width: 768px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );
  private readonly dueDatePicker = viewChild<MatDatepicker<Date>>('dueDatePicker');
  private readonly reminderDatePicker =
    viewChild<MatDatepicker<Date>>('reminderDatePicker');

  readonly categories: TaskCategory[] = ['work', 'personal', 'study', 'other'];
  readonly priorities: TaskPriority[] = ['high', 'medium', 'low'];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['medium' as TaskPriority, Validators.required],
    category: ['work' as TaskCategory, Validators.required],
    dueDate: [null as Date | null],
    dueTime: [''],
    reminderEnabled: [false],
    reminderDate: [null as Date | null],
    reminderTime: ['09:00'],
    completed: [false],
  });

  ngOnInit(): void {
    const task = this.data.task;
    if (task) {
      const reminder = parseReminderToForm(task.reminderDateTime);
      this.form.patchValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate ? new Date(task.dueDate + 'T12:00:00') : null,
        dueTime: task.dueTime ?? '',
        reminderEnabled: task.reminderEnabled,
        reminderDate: reminder.date,
        reminderTime: reminder.time,
        completed: task.completed,
      });
    } else if (this.data.presetDate) {
      this.form.patchValue({ dueDate: new Date(this.data.presetDate + 'T12:00:00') });
    }

    this.form.get('reminderEnabled')?.valueChanges.subscribe((enabled) => {
      if (enabled && !this.form.get('reminderDate')?.value) {
        this.syncReminderFromDue();
      }
    });
  }

  private syncReminderFromDue(): void {
    const due = this.form.get('dueDate')?.value as Date | null;
    const dueTime = (this.form.get('dueTime')?.value as string) || '09:00';
    this.form.patchValue({
      reminderDate: due ?? new Date(),
      reminderTime: dueTime,
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    const dueDate =
      v.dueDate instanceof Date ? toLocalDateString(v.dueDate) : '';

    let reminderDateTime = '';
    if (v.reminderEnabled) {
      if (!(v.reminderDate instanceof Date)) {
        return;
      }
      reminderDateTime = combineLocalDateAndTime(v.reminderDate, v.reminderTime ?? '09:00');
    }

    this.dialogRef.close({
      title: v.title!,
      description: v.description ?? '',
      priority: v.priority!,
      category: v.category!,
      dueDate,
      dueTime: (v.dueTime ?? '').trim(),
      reminderEnabled: v.reminderEnabled ?? false,
      reminderDateTime,
      completed: v.completed ?? false,
    });
  }

  useTouchDatepicker(): boolean {
    return this.isHandset() ?? false;
  }

  openDueDatePicker(): void {
    this.dueDatePicker()?.open();
  }

  openReminderDatePicker(): void {
    this.reminderDatePicker()?.open();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
