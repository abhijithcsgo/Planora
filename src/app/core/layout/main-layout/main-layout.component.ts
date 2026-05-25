import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SettingsService } from '../../../services/settings.service';
import { ReminderService } from '../../../services/reminder.service';
import { NotificationService } from '../../../services/notification.service';
import { AlertSoundService } from '../../../services/alert-sound.service';
import { ReminderItem } from '../../../models/reminder.model';
import { ReminderPopupComponent } from '../../../components/reminder-popup/reminder-popup.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSidenavModule,
    ReminderPopupComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly reminderService = inject(ReminderService);
  private readonly notificationService = inject(NotificationService);
  private readonly alertSound = inject(AlertSoundService);

  readonly settingsService = inject(SettingsService);
  readonly badgeCount$ = this.reminderService.badgeCount$;
  readonly sidebarOpen = signal(false);
  readonly activeReminder = signal<ReminderItem | null>(null);

  private stopPolling?: () => void;

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'task_alt' },
    { path: '/calendar', label: 'Calendar', icon: 'calendar_month' },
    { path: '/reminders', label: 'Reminders', icon: 'notifications_active' },
    { path: '/notes', label: 'Notes', icon: 'sticky_note_2' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  ngOnInit(): void {
    void this.notificationService.requestPermission();
    this.stopPolling = this.reminderService.startPolling((item) => {
      this.activeReminder.set(item);
      this.alertSound.playReminderAlert();
      this.notificationService.showBrowserNotification(item);
    });
  }

  ngOnDestroy(): void {
    this.stopPolling?.();
  }

  toggleTheme(): void {
    this.settingsService.toggleDarkMode();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  dismissReminder(): void {
    const item = this.activeReminder();
    if (item) {
      this.reminderService.dismiss(item.id);
    }
    this.activeReminder.set(null);
  }
}
