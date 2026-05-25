/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString()) */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalDateString(): string {
  return toLocalDateString(new Date());
}

/** Combine local date + HH:mm into ISO string for storage */
export function combineLocalDateAndTime(date: Date | null, time: string): string {
  if (!date) {
    return '';
  }
  const [hours, minutes] = (time || '09:00').split(':').map((n) => parseInt(n, 10) || 0);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export function parseReminderToForm(iso: string): { date: Date | null; time: string } {
  if (!iso) {
    return { date: null, time: '09:00' };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: null, time: '09:00' };
  }
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date: d, time };
}
