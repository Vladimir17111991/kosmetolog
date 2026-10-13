import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, nextTick } from 'vue';
import {
  monthDates,
  weekDates,
  adjacentMonth,
  createPracticeStore,
} from '../src/entities/practice/index.ts';
import { createNavigation } from '../src/app/model/navigation.ts';
import { useBookingForm } from '../src/features/book-appointment/model.ts';

test('calendar handles Sunday, year boundaries, and leap February without timezone drift', () => {
  assert.deepEqual(weekDates('2026-01-04'), [
    '2025-12-29',
    '2025-12-30',
    '2025-12-31',
    '2026-01-01',
    '2026-01-02',
    '2026-01-03',
    '2026-01-04',
  ]);
  const february = monthDates('2028-02-29');
  assert.equal(february.length, 42);
  assert.equal(new Set(february).size, 42);
  assert.equal(february[0], '2028-01-31');
  assert.equal(february.filter((date) => date.startsWith('2028-02')).length, 29);
  assert.equal(adjacentMonth('2026-01-31', 1), '2026-02-01');
  assert.equal(adjacentMonth('2026-01-31', -1), '2025-12-01');
});

test('client shortcut preselects a visible available day, keeps it on service change, and resets the next form', async () => {
  const store = createPracticeStore(() => new Date('2030-01-08T06:00:00Z'));
  store.switchProfile('olga');
  const navigation = createNavigation(() => store.isGuest.value);
  navigation.navigate('booking', {
    reset: true,
    booking: { clientId: 'anna', date: '2030-02-01' },
  });
  const scope = effectScope();
  try {
    const form = scope.run(() => useBookingForm(store, navigation.bookingPrefill.value))!;
    assert.equal(form.bookingClient.value?.id, 'anna');
    assert.equal(form.date.value, '2030-02-01');
    assert.ok(form.visibleDays.value.includes(form.date.value));
    store.selectService(store.services.value[2]);
    await nextTick();
    assert.equal(form.date.value, '2030-02-01');
    form.time.value = '11:00';
    form.submit();
    assert.equal(form.success.value?.clientId, 'anna');
    assert.equal(form.success.value?.date, '2030-02-01');
    navigation.navigate('booking', { reset: true });
    assert.deepEqual(navigation.bookingPrefill.value, {});
    store.switchProfile('guest');
    navigation.navigate('booking', { reset: true, booking: { clientId: 'maria' } });
    assert.deepEqual(navigation.bookingPrefill.value, {});
  } finally {
    scope.stop();
  }
});

test('closed or out-of-range prefilled dates and missing clients cannot bypass booking rules', () => {
  const store = createPracticeStore(() => new Date('2030-01-08T06:00:00Z'));
  store.switchProfile('olga');
  const scope = effectScope();
  try {
    for (const date of ['2030-01-13', '2029-12-31', '2031-01-08']) {
      const form = scope.run(() => useBookingForm(store, { clientId: 'missing', date }))!;
      assert.notEqual(form.date.value, date);
      assert.ok(form.visibleDays.value.includes(form.date.value));
      assert.equal(form.bookingClient.value, undefined);
      assert.equal(form.canSubmit.value, false);
    }
  } finally {
    scope.stop();
  }
});
