import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../services/task.service';
import {
  Task,
  TaskCategory,
  TaskFilter,
  TaskPriority,
  TaskSortDirection,
  TaskSortField,
} from '../../models/task.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  TaskFormDialogComponent,
  TaskFormDialogData,
} from '../../shared/components/task-form-dialog/task-form-dialog.component';
import { TitlecasePipe } from '../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    TitlecasePipe,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly filter = signal<TaskFilter>({
    search: '',
    category: 'all',
    priority: 'all',
    status: 'all',
  });
  readonly sortField = signal<TaskSortField>('order');
  readonly sortDir = signal<TaskSortDirection>('asc');

  readonly categories: (TaskCategory | 'all')[] = ['all', 'work', 'personal', 'study', 'other'];
  readonly priorities: (TaskPriority | 'all')[] = ['all', 'high', 'medium', 'low'];
  readonly sortFields: { value: TaskSortField; label: string }[] = [
    { value: 'order', label: 'Custom order' },
    { value: 'dueDate', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Created' },
  ];

  readonly filteredTasks$ = combineLatest([
    this.taskService.tasks$,
    toObservable(this.filter),
    toObservable(this.sortField),
    toObservable(this.sortDir),
  ]).pipe(
    map(([tasks, filter, sortField, sortDir]) =>
      this.taskService.filterAndSort(tasks, filter, sortField, sortDir),
    ),
  );

  openAddDialog(): void {
    this.openDialog();
  }

  openEditDialog(task: Task): void {
    this.openDialog({ task });
  }

  private openDialog(data?: TaskFormDialogData): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      maxWidth: 'min(520px, 95vw)',
      panelClass: 'task-form-dialog-panel',
      data: data ?? {},
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (data?.task) {
        this.taskService.updateTask(data.task.id, result);
      } else {
        this.taskService.addTask(result);
      }
    });
  }

  toggleComplete(task: Task): void {
    this.taskService.toggleComplete(task.id);
  }

  deleteTask(task: Task, event: Event): void {
    event.stopPropagation();
    this.taskService.deleteTask(task.id);
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    const list = [...event.container.data];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.taskService.reorderTasks(list.map((t) => t.id));
  }

  updateFilter<K extends keyof TaskFilter>(key: K, value: TaskFilter[K]): void {
    this.filter.update((f) => ({ ...f, [key]: value }));
  }

  toggleSortDir(): void {
    this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
  }
}
