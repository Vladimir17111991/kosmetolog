import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  freeSlots,
  closureConflicts,
  weekday,
  bookingsForClient,
  addDays,
  type AvailabilityOptions,
  type ScheduleBooking,
} from '../src/entities/practice/index.ts';

const booking: ScheduleBooking & { id: string } = {
  id: 'one',
  clientId: 'anna',
  date: '2030-05-06',
  time: '11:00',
  service: { duration: 90 },
  status: 'confirmed',
};
const base: AvailabilityOptions = {
  date: '2030-05-06',
  duration: 60,
  bookings: [booking],
  daysOff: [],
  breaks: [],
  now: new Date('2030-05-01T00:00:00Z'),
};
test('shared occupied intervals block overlaps but allow adjacent visits', () => {
  const slots = freeSlots(base);
  assert.ok(slots.includes('10:00'));
  for (const time of ['10:30', '11:00', '11:30', '12:00']) assert.ok(!slots.includes(time));
  assert.ok(slots.includes('12:30'));
});
test('entire procedure fits into working hours', () => {
  assert.equal(freeSlots({ ...base, duration: 90 }).at(-1), '17:30');
  assert.equal(freeSlots({ ...base, duration: 30 }).at(-1), '18:30');
});
test('holidays include boundaries and recurring days off are closed', () => {
  const breaks = [{ start: '2030-05-06', end: '2030-05-08' }];
  for (const date of ['2030-05-06', '2030-05-07', '2030-05-08'])
    assert.deepEqual(freeSlots({ ...base, date, breaks }), []);
  assert.ok(freeSlots({ ...base, date: '2030-05-09', breaks }).length);
  assert.deepEqual(freeSlots({ ...base, daysOff: [weekday(base.date)] }), []);
});
test('cancellation returns time to availability', () => {
  assert.ok(
    freeSlots({ ...base, bookings: [{ ...booking, status: 'cancelled' }] }).includes('11:00'),
  );
});
test('holiday overlapping active appointment requires resolution', () => {
  assert.equal(
    closureConflicts([booking], (date) => date === booking.date, '2030-05-01').length,
    1,
  );
  assert.equal(
    closureConflicts([{ ...booking, status: 'cancelled' }], () => true, '2030-05-01').length,
    0,
  );
});
test('client cabinet only lists its owner’s records', () => {
  const records = [booking, { ...booking, id: 'two', clientId: 'maria' }];
  assert.deepEqual(
    bookingsForClient(records, 'anna').map((item) => item.id),
    ['one'],
  );
  assert.deepEqual(bookingsForClient(records, 'unknown'), []);
});
test('past times unavailable in Minsk time and dates cross months', () => {
  assert.equal(
    freeSlots({ ...base, bookings: [], now: new Date('2030-05-06T08:01:00Z') })[0],
    '11:30',
  );
  assert.equal(addDays('2030-01-31', 1), '2030-02-01');
});
