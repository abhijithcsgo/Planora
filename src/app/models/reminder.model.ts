export interface ReminderItem {
  id: string;
  taskId: string;
  taskTitle: string;
  reminderDateTime: string;
  dismissed: boolean;
  notified: boolean;
}
