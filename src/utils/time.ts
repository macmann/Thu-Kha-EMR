export function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

export function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToHHMM(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}`;
}

export function dayOfWeekUTC(date: Date): number {
  return date.getUTCDay();
}

export function composeDateTime(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
