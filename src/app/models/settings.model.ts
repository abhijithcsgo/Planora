export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  defaultCalendarView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  weekStartsOn: 0 | 1;
  reminderSound: boolean;
  autoSave: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  notificationsEnabled: true,
  defaultCalendarView: 'dayGridMonth',
  weekStartsOn: 0,
  reminderSound: true,
  autoSave: true,
};
