import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppSettings } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { TaskService } from '../../services/task.service';
import { NoteService } from '../../services/note.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    PageHeaderComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly taskService = inject(TaskService);
  private readonly noteService = inject(NoteService);
  private readonly pdfExport = inject(PdfExportService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly settings$ = this.settingsService.settings$;

  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settingsService.update({ [key]: value });
  }

  exportPdf(): void {
    this.pdfExport.exportTasks();
  }

  async requestNotifications(): Promise<void> {
    await this.notificationService.requestPermission();
  }

  resetSampleData(): void {
    this.confirmDialog
      .open({
        title: 'Load sample data?',
        message: 'This will replace your current tasks with demo tasks.',
        confirmText: 'Load sample',
      })
      .subscribe((ok) => {
        if (ok) {
          this.taskService.resetToSample();
        }
      });
  }

  clearAllTasks(): void {
    this.confirmDialog
      .open({
        title: 'Clear all tasks?',
        message: 'All tasks will be permanently deleted. This cannot be undone.',
        confirmText: 'Clear tasks',
        warn: true,
      })
      .subscribe((ok) => {
        if (ok) {
          this.taskService.clearAll();
        }
      });
  }

  clearAllNotes(): void {
    this.confirmDialog
      .open({
        title: 'Clear all notes?',
        message: 'All notes will be permanently deleted. This cannot be undone.',
        confirmText: 'Clear notes',
        warn: true,
      })
      .subscribe((ok) => {
        if (ok) {
          this.noteService.clearAll();
        }
      });
  }

  clearAllData(): void {
    this.confirmDialog
      .open({
        title: 'Clear all app data?',
        message:
          'All tasks and notes will be permanently deleted. This cannot be undone.',
        confirmText: 'Clear everything',
        warn: true,
      })
      .subscribe((ok) => {
        if (ok) {
          this.taskService.clearAll();
          this.noteService.clearAll();
        }
      });
  }

  resetSettings(): void {
    this.confirmDialog
      .open({
        title: 'Reset settings?',
        message: 'All preferences will be restored to default values.',
        confirmText: 'Reset',
      })
      .subscribe((ok) => {
        if (ok) {
          this.settingsService.reset();
        }
      });
  }
}
