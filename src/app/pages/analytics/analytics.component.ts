import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { combineLatest } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TaskService } from '../../services/task.service';
import { SettingsService } from '../../services/settings.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  private readonly taskService = inject(TaskService);
  private readonly settingsService = inject(SettingsService);

  readonly weeklyChartRef = viewChild<ElementRef<HTMLCanvasElement>>('weeklyChart');
  readonly statusChartRef = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');
  readonly categoryChartRef = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');

  private charts: Chart[] = [];
  private sub?: { unsubscribe: () => void };

  ngAfterViewInit(): void {
    this.sub = {
      unsubscribe: combineLatest([
        this.taskService.tasks$,
        this.settingsService.settings$,
      ])
        .subscribe(([tasks]) => this.renderCharts(tasks))
        .unsubscribe,
    };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.charts.forEach((c) => c.destroy());
  }

  private renderCharts(tasks: ReturnType<TaskService['getTasks']>): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];

    const weekly = this.getWeeklyData(tasks);
    const weeklyEl = this.weeklyChartRef()?.nativeElement;
    if (weeklyEl) {
      this.charts.push(
        new Chart(weeklyEl, {
          type: 'bar',
          data: {
            labels: weekly.labels,
            datasets: [
              {
                label: 'Completed',
                data: weekly.completed,
                backgroundColor: '#10b981',
                borderRadius: 6,
              },
              {
                label: 'Created',
                data: weekly.created,
                backgroundColor: '#6366f1',
                borderRadius: 6,
              },
            ],
          },
          options: this.barOptions('Weekly Productivity'),
        }),
      );
    }

    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - completed;
    const statusEl = this.statusChartRef()?.nativeElement;
    if (statusEl) {
      this.charts.push(
        new Chart(statusEl, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'Pending'],
            datasets: [
              {
                data: [completed, pending],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0,
              },
            ],
          },
          options: this.doughnutOptions(),
        }),
      );
    }

    const categories = ['work', 'personal', 'study', 'other'] as const;
    const categoryCounts = categories.map(
      (c) => tasks.filter((t) => t.category === c).length,
    );
    const categoryEl = this.categoryChartRef()?.nativeElement;
    if (categoryEl) {
      this.charts.push(
        new Chart(categoryEl, {
          type: 'pie',
          data: {
            labels: categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [
              {
                data: categoryCounts,
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
                borderWidth: 0,
              },
            ],
          },
          options: this.doughnutOptions(),
        }),
      );
    }
  }

  private getWeeklyData(tasks: ReturnType<TaskService['getTasks']>) {
    const labels: string[] = [];
    const completed: number[] = [];
    const created: number[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      completed.push(
        tasks.filter(
          (t) => t.completed && t.updatedAt.startsWith(key),
        ).length,
      );
      created.push(tasks.filter((t) => t.createdAt.startsWith(key)).length);
    }
    return { labels, completed, created };
  }

  private isDarkTheme(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  private chartColors() {
    const dark = this.isDarkTheme();
    return {
      text: dark ? '#cbd5e1' : '#64748b',
      grid: dark ? '#475569' : '#e2e8f0',
      legend: dark ? '#e2e8f0' : '#475569',
    };
  }

  private barOptions(title: string): ChartConfiguration['options'] {
    const colors = this.chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title, color: colors.text },
        legend: {
          position: 'bottom',
          labels: { color: colors.legend },
        },
      },
      scales: {
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: colors.text },
          grid: { color: colors.grid },
        },
      },
    };
  }

  private doughnutOptions(): ChartConfiguration['options'] {
    const colors = this.chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: colors.legend },
        },
      },
    };
  }
}
