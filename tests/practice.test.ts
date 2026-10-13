import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, nextTick } from 'vue';
import {
  createPracticeStore,
  addDays,
  freeSlots,
  weekday,
  services,
} from '../src/entities/practice/index.ts';
import { useBookingForm } from '../src/features/book-appointment/model.ts';

function setup() {
  const store = createPracticeStore();
  store.switchProfile('anna');
  const date = addDays(store.today.value, 8 - weekday(store.today.value));
  return { store, date, draft: { service: services[1], date, time: '11:00', reminder: true } };
}

test('store preserves shared availability, ownership and cancellation after switching profiles', () => {
  const { store, draft, date } = setup();
  store.switchProfile('olga');
  const booking = store.book({ ...draft, customer: { mode: 'existing', clientId: 'anna' } });
  store.switchProfile('maria');
  assert.equal(store.visibleBookings.value.length, 0);
  store.cancelBooking(booking.id);
  assert.equal(store.bookings.value[0].status, 'confirmed');
  store.toggleDayOff(1);
  assert.deepEqual([...store.daysOff.value], [0]);
  store.addBreak({ start: date, end: date, kind: 'Отпуск' });
  assert.equal(store.breaks.value.length, 0);
  store.switchProfile('anna');
  assert.equal(store.visibleBookings.value[0].id, booking.id);
  store.cancelBooking(booking.id);
  assert.equal(store.activeCount.value, 0);
  assert.ok(
    freeSlots({
      ...draft,
      duration: 60,
      bookings: store.bookings.value,
      daysOff: store.daysOff.value,
      breaks: store.breaks.value,
    }).includes('11:00'),
  );
});

test('closures retain confirmed visits and apply after their cancellation', () => {
  const { store, draft, date } = setup();
  const booking = store.book(draft);
  store.switchProfile('olga');
  store.addBreak({ start: date, end: date, kind: 'Отпуск' });
  assert.equal(store.breaks.value.length, 0);
  assert.equal(store.conflicts.value[0].id, booking.id);
  store.cancelBooking(booking.id);
  store.addBreak({ start: date, end: date, kind: 'Отпуск' });
  assert.equal(store.breaks.value.length, 1);
  assert.equal(store.closureError.value, '');
  store.removeBreak(store.breaks.value[0].id);
  assert.equal(store.breaks.value.length, 0);
});

test('booking form reacts to new busy intervals and changed procedure duration', async () => {
  const { store, draft, date } = setup();
  const scope = effectScope();
  try {
    const form = scope.run(() => useBookingForm(store));
    assert.ok(form);
    form.selectDate(date);
    form.time.value = '11:00';
    store.book(draft);
    await nextTick();
    assert.equal(form.time.value, '');
    assert.ok(!form.availableTimes.value.includes('11:00'));
    form.time.value = '18:00';
    store.selectService(services[2]);
    await nextTick();
    assert.equal(form.time.value, '');
    assert.ok(!form.availableTimes.value.includes('18:00'));
  } finally {
    scope.stop();
  }
});

test('new-client form resets between bookings and stores only a valid card', async () => {
  const { store, date } = setup();
  store.switchProfile('olga');
  const scope = effectScope();
  try {
    const form = scope.run(() => useBookingForm(store));
    assert.ok(form);
    form.customer.value = { mode: 'new', name: 'Елена', phone: '+375000000003' };
    form.selectDate(date);
    form.time.value = '10:00';
    form.submit();
    await nextTick();
    assert.ok(form.success.value);
    assert.equal(store.clients.value.length, 3);
    assert.equal(form.success.value.reminder, false);
    form.reset();
    await nextTick();
    assert.equal(form.success.value, null);
    assert.equal(form.time.value, '');
    assert.deepEqual(form.customer.value, { mode: 'existing', clientId: '' });
    assert.equal(form.canSubmit.value, false);
    assert.equal(createPracticeStore().clients.value.length, 2);
  } finally {
    scope.stop();
  }
});
