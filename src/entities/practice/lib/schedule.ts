import type { Booking, BookingStatus, ClosedPeriod } from '../model/types.ts';

export type ScheduleBooking = Pick<Booking, 'date' | 'time' | 'clientId' | 'status'> & {
  service: { duration: number };
};
export type DateRange = Pick<ClosedPeriod, 'start' | 'end'>;
export interface AvailabilityOptions {
  date: string;
  duration: number;
  bookings: readonly ScheduleBooking[];
  daysOff: readonly number[];
  breaks: readonly DateRange[];
  now?: Date;
}

export const HOURS = { start: 600, end: 1140, step: 30 };
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Minsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(key: string, amount: number): string {
  const value = new Date(`${key}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
export const weekday = (key: string): number => new Date(`${key}T12:00:00Z`).getUTCDay();
export const minutes = (time: string): number =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const formatTime = (value: number): string =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const isClosed = (
  date: string,
  daysOff: readonly number[],
  breaks: readonly DateRange[],
): boolean =>
  daysOff.includes(weekday(date)) || breaks.some((item) => item.start <= date && date <= item.end);
export const activeBookings = <T extends { status: BookingStatus }>(bookings: readonly T[]): T[] =>
  bookings.filter((item) => item.status === 'confirmed');
export const bookingsForClient = <T extends { clientId: string }>(
  bookings: readonly T[],
  clientId: string | undefined,
): T[] => bookings.filter((item) => item.clientId === clientId);
export function freeSlots({
  date,
  duration,
  bookings,
  daysOff,
  breaks,
  now = new Date(),
}: AvailabilityOptions): string[] {
  if (!date || !Number.isFinite(duration) || duration <= 0 || isClosed(date, daysOff, breaks))
    return [];
  const occupied = bookings.filter((item) => item.status !== 'cancelled' && item.date === date);
  const slots = [];
  for (let start = HOURS.start; start + duration <= HOURS.end; start += HOURS.step) {
    const time = formatTime(start);
    if (new Date(`${date}T${time}:00+03:00`) <= now) continue;
    if (
      occupied.some(
        (item) =>
          start < minutes(item.time) + item.service.duration &&
          start + duration > minutes(item.time),
      )
    )
      continue;
    slots.push(time);
  }
  return slots;
}
// A closure never silently removes an already confirmed appointment.
export function closureConflicts<T extends { date: string; status: BookingStatus }>(
  bookings: readonly T[],
  predicate: (date: string) => boolean,
  today: string,
): T[] {
  return activeBookings(bookings).filter((item) => item.date >= today && predicate(item.date));
}
