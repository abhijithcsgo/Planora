import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

/** Simple beep alert using Web Audio API */
@Injectable({ providedIn: 'root' })
export class AlertSoundService {
  private readonly settings = inject(SettingsService);

  playReminderAlert(): void {
    if (!this.settings.settings.reminderSound) {
      return;
    }
    try {
      const ctx = new AudioContext();
      const playBeep = (start: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
        osc.start(start);
        osc.stop(start + 0.25);
      };
      playBeep(ctx.currentTime, 880);
      playBeep(ctx.currentTime + 0.3, 1100);
      setTimeout(() => void ctx.close(), 800);
    } catch {
      // Audio not available — ignore
    }
  }
}
