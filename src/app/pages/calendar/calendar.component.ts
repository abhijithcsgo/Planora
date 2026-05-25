import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TaskService } from '../../services/task.service';
import { SettingsService } from '../../services/settings.service';
import { Task } from '../../models/task.model';
import { toLocalDateString } from '../../core/utils/date.util';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  TaskFormDialogComponent,
  TaskFormDialogData,
} from '../../shared/components/task-form-dialog/task-form-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatButtonToggleModule, PageHeaderComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly taskService = inject(TaskService);
  private readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog);

  readonly calendarRef = viewChild(FullCalendarComponent);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    editable: true,
    droppable: true,
    selectable: true,
    height: '100%',
    expandRows: true,
    handleWindowResize: true,
    events: [],
    dateClick: (arg) => this.onDateClick(arg),
    eventClick: (arg) => this.onEventClick(arg),
    eventDrop: (arg) => this.onEventDrop(arg),
    eventColor: '#6366f1',
  };

  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.settingsService.settings$.subscribe((s) => {
      this.calendarOptions = {
        ...this.calendarOptions,
        initialView: s.defaultCalendarView,
      };
    });
    this.taskService.tasks$.subscribe((tasks) => {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: tasks.flatMap((t) => {
          const event = this.taskToEvent(t);
          return event ? [event] : [];
        }),
      };
      this.calendarRef()?.getApi()?.refetchEvents();
      this.updateCalendarSize();
    });
  }

  ngAfterViewInit(): void {
    this.updateCalendarSize();
    const el = this.calendarRef()?.getApi()?.el;
    if (el && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateCalendarSize());
      this.resizeObserver.observe(el.parentElement ?? el);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private updateCalendarSize(): void {
    requestAnimationFrame(() => {
      this.calendarRef()?.getApi()?.updateSize();
    });
  }

  private taskToEvent(task: Task) {
    if (!task.dueDate) {
      return null;
    }
    const start = task.dueTime
      ? `${task.dueDate}T${task.dueTime}`
      : task.dueDate;
    return {
      id: task.id,
      title: task.title,
      start,
      allDay: !task.dueTime,
      backgroundColor: task.completed ? '#94a3b8' : this.colorByPriority(task.priority),
      borderColor: 'transparent',
      extendedProps: { task },
    };
  }

  private colorByPriority(priority: string): string {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority] ?? '#6366f1';
  }

  onDateClick(arg: DateClickArg): void {
    const date = arg.dateStr.split('T')[0];
    this.openTaskDialog({ presetDate: date });
  }

  onEventClick(arg: EventClickArg): void {
    const task = arg.event.extendedProps['task'] as Task;
    if (task) {
      this.openTaskDialog({ task });
    }
  }

  onEventDrop(arg: EventDropArg): void {
    const task = arg.event.extendedProps['task'] as Task;
    if (!task) return;
    const start = arg.event.start;
    const newDate = start ? toLocalDateString(start) : task.dueDate;
    const newTime =
      start && !arg.event.allDay
        ? `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
        : task.dueTime;
    this.taskService.updateTask(task.id, { dueDate: newDate, dueTime: newTime ?? task.dueTime });
  }

  setView(view: string): void {
    this.calendarRef()?.getApi()?.changeView(view);
    this.settingsService.update({
      defaultCalendarView: view as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay',
    });
  }

  private openTaskDialog(data: TaskFormDialogData): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      maxWidth: 'min(520px, 95vw)',
      panelClass: 'task-form-dialog-panel',
      data,
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (data.task) {
        this.taskService.updateTask(data.task.id, result);
      } else {
        this.taskService.addTask(result);
      }
    });
  }
}
