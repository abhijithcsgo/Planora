import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { todayLocalDateString } from '../../core/utils/date.util';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../services/task.service';
import { ReminderService } from '../../services/reminder.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TitlecasePipe } from '../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    StatCardComponent,
    PageHeaderComponent,
    TitlecasePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly taskService = inject(TaskService);
  private readonly reminderService = inject(ReminderService);

  readonly stats$ = this.taskService.stats$;
  readonly upcoming$ = this.reminderService.upcoming$;
  readonly todayTasks$ = this.taskService.tasks$.pipe(
    map((tasks) =>
      tasks.filter(
        (t) => !t.completed && t.dueDate === todayLocalDateString(),
      ),
    ),
  );
  readonly recentTasks$ = this.taskService.tasks$;
}
