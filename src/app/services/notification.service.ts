import { Injectable, inject } from '@angular/core';
import { ReminderItem } from '../models/reminder.model';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly settings = inject(SettingsService);
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    }
    return false;
  }

  showBrowserNotification(item: ReminderItem): void {
    if (!this.settings.settings.notificationsEnabled) {
      return;
    }
    if (this.permission !== 'granted' && Notification.permission !== 'granted') {
      return;
    }
    new Notification('Planora Reminder', {
      body: item.taskTitle,
      icon: '/icons/icon-192.png',
      tag: item.id,
    });
  }

  get isSupported(): boolean {
    return 'Notification' in window;
  }
}
