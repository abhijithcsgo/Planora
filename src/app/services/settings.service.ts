import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppSettings, DEFAULT_SETTINGS } from '../models/settings.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'taskflow_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly settingsSubject = new BehaviorSubject<AppSettings>(DEFAULT_SETTINGS);

  readonly settings$ = this.settingsSubject.asObservable();

  constructor() {
    const saved = this.storage.get<AppSettings>(STORAGE_KEY);
    if (saved) {
      this.settingsSubject.next({ ...DEFAULT_SETTINGS, ...saved });
    }
    this.applyTheme(this.settingsSubject.value.darkMode);
  }

  get settings(): AppSettings {
    return this.settingsSubject.value;
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settingsSubject.value, ...partial };
    this.storage.set(STORAGE_KEY, next);
    this.settingsSubject.next(next);
    if (partial.darkMode !== undefined) {
      this.applyTheme(partial.darkMode);
    }
  }

  toggleDarkMode(): void {
    this.update({ darkMode: !this.settings.darkMode });
  }

  private applyTheme(dark: boolean): void {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
  }

  reset(): void {
    this.storage.set(STORAGE_KEY, DEFAULT_SETTINGS);
    this.settingsSubject.next(DEFAULT_SETTINGS);
    this.applyTheme(false);
  }
}
