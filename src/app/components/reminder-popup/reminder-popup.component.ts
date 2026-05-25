import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReminderItem } from '../../models/reminder.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reminder-popup',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './reminder-popup.component.html',
  styleUrl: './reminder-popup.component.scss',
})
export class ReminderPopupComponent {
  readonly reminder = input.required<ReminderItem>();
  readonly dismiss = output<void>();
}
