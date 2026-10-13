import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope, nextTick } from 'vue';
import { createPracticeStore, freeSlots } from '../src/entities/practice/index.ts';
import { useBookingForm } from '../src/features/book-appointment/model.ts';

function setup() {
  let instant = new Date('2030-01-08T06:00:00Z');
  const store = createPracticeStore(() => instant);
  store.switchProfile('olga');
  const draft = {
    service: { ...store.services.value[1] },
    date: '2030-01-08',
    time: '10:00',
    reminder: false,
    customer: { mode: 'existing' as const, clientId: 'anna' },
  };
  return {
    store,
    draft,
    at(value: string) {
      instant = new Date(value);
      store.refreshClock();
    },
  };
}

test('category and service changes keep photo links and historical appointment snapshots', () => {
  const { store, draft } = setup();
  const booking = store.book(draft);
  store.addPhoto({ serviceId: 2, title: 'Работа', url: 'blob:fixture' });
  const category = store.addCategory(' Пилинги ');
  assert.throws(() => store.addCategory('пилинги'), /уже есть/);
  store.renameCategory(2, 'Уход за кожей');
  assert.equal(store.services.value.find((item) => item.id === 2)?.category, 'Уход за кожей');
  const snapshot = JSON.stringify({ services: store.services.value, photos: store.photos.value });
  assert.throws(() => store.removeCategory(2, 2), /другую категорию/);
  assert.equal(
    JSON.stringify({ services: store.services.value, photos: store.photos.value }),
    snapshot,
  );
  store.removeCategory(2, category.id);
  assert.equal(store.services.value.find((item) => item.id === 2)?.categoryId, category.id);
  assert.equal(store.photos.value[0].serviceId, 2);
  const service = store.addService({
    name: 'Новая процедура',
    categoryId: category.id,
    description: 'Описание',
    duration: 45,
    price: 75,
  });
  store.editService(service.id, {
    ...service,
    name: 'Обновлённая процедура',
    price: 80,
    duration: 60,
  });
  assert.throws(() => store.removeService(2), /есть фото/);
  store.removeService(2, service.id);
  assert.equal(store.photos.value[0].serviceId, service.id);
  assert.equal(booking.service.name, 'Уход за лицом');
  assert.equal(booking.service.category, 'Уход');
  assert.equal(booking.service.price, 110);
  assert.throws(() => store.book({ ...draft, time: '12:00' }), /больше не доступна/);
  assert.ok(
    !freeSlots({
      date: draft.date,
      duration: 30,
      bookings: store.bookings.value,
      daysOff: [],
      breaks: [],
      now: new Date('2030-01-08T06:00:00Z'),
    }).includes('10:30'),
  );
});

test('empty catalogue invalidates the open booking form and supports rebuilding without reused IDs', async () => {
  const { store } = setup();
  const scope = effectScope();
  const selection = () => store.selectedService.value;
  try {
    const form = scope.run(() => useBookingForm(store));
    assert.ok(form);
    form.customer.value = { mode: 'existing', clientId: 'anna' };
    form.time.value = '10:00';
    for (const service of store.services.value) store.removeService(service.id);
    for (const category of store.categories.value) store.removeCategory(category.id);
    await nextTick();
    assert.equal(selection(), null);
    assert.equal(form.availableDays.value.length, 0);
    assert.equal(form.canSubmit.value, false);
    form.submit();
    assert.match(form.error.value, /нет процедур/);
    const category = store.addCategory('Новая категория');
    const service = store.addService({
      categoryId: category.id,
      name: 'Новый уход',
      description: '',
      price: 50,
      duration: 30,
    });
    await nextTick();
    assert.ok(category.id > 4 && service.id > 4);
    assert.equal(selection()?.id, service.id);
    assert.ok(form.availableDays.value.length > 0);
    assert.equal(form.time.value, '');
  } finally {
    scope.stop();
  }
});

test('service details update independently from historical bookings and validate atomically', () => {
  const { store, draft } = setup();
  const booking = store.book(draft);
  const originalDetails = { ...booking.service.details };
  const details = {
    forWhom: ' Новым клиентам ',
    includes: ' Знакомство и уход ',
    preparation: ' Обсудим при записи ',
  };
  store.editService(2, { ...draft.service, details });
  assert.deepEqual(store.services.value[1].details, {
    forWhom: 'Новым клиентам',
    includes: 'Знакомство и уход',
    preparation: 'Обсудим при записи',
  });
  assert.deepEqual(booking.service.details, originalDetails);
  details.includes = 'Изменённый внешний черновик';
  assert.equal(store.services.value[1].details?.includes, 'Знакомство и уход');
  const snapshot = JSON.stringify(store.services.value);
  assert.throws(
    () =>
      store.editService(2, {
        ...draft.service,
        details: { ...details, includes: 'x'.repeat(501) },
      }),
    /до 500/,
  );
  assert.equal(JSON.stringify(store.services.value), snapshot);
  store.updateService(2, 125, 75);
  assert.equal(store.services.value[1].details?.includes, 'Знакомство и уход');
});

test('before/after pairs survive catalogue moves and release both image URLs on removal', (context) => {
  const revoked: string[] = [];
  context.mock.method(URL, 'revokeObjectURL', (url: string) => revoked.push(url));
  const { store } = setup();
  const pair = {
    serviceId: 2,
    title: ' Сравнение ',
    url: 'blob:after',
    beforeUrl: 'blob:before',
    comparisonNote: ' 3 визита ',
  };
  store.addPhoto(pair);
  const id = store.photos.value[0].id;
  assert.equal(store.photos.value[0].comparisonNote, '3 визита');
  store.removeCategory(2, 3);
  store.removeService(2, 3);
  assert.equal(store.photos.value[0].serviceId, 3);
  assert.equal(store.photos.value[0].beforeUrl, 'blob:before');
  assert.equal(store.photos.value[0].url, 'blob:after');
  assert.deepEqual(revoked, []);
  store.removePhoto(id);
  assert.deepEqual(revoked.sort(), ['blob:after', 'blob:before']);
  store.dispose();
  assert.equal(revoked.length, 2);
});

test('pair validation cannot leave an incomplete gallery item and disposal releases owned photos', (context) => {
  const revoked: string[] = [];
  context.mock.method(URL, 'revokeObjectURL', (url: string) => revoked.push(url));
  const { store } = setup();
  const pair = { serviceId: 2, title: 'Сравнение', url: 'blob:after', beforeUrl: 'blob:before' };
  assert.throws(
    () => store.addPhoto({ ...pair, beforeUrl: 'https://example.com/photo.jpg' }),
    /с устройства/,
  );
  assert.throws(() => store.addPhoto({ ...pair, comparisonNote: 'x'.repeat(181) }), /до 180/);
  assert.equal(store.photos.value.length, 0);
  store.addPhoto(pair);
  store.dispose();
  assert.deepEqual(revoked.sort(), ['blob:after', 'blob:before']);
});

test('visit counters exclude future/cancelled bookings, prevent double counting and support corrections', () => {
  const { store, draft, at } = setup();
  store.setPreviousVisits('anna', 4);
  const first = store.book(draft);
  const cancelled = store.book({ ...draft, time: '11:00' });
  assert.equal(store.visitsForClient('anna'), 4);
  assert.equal(store.numberForVisit(first), 5);
  assert.throws(() => store.completeBooking(first.id), /время начала/);
  store.cancelBooking(cancelled.id);
  assert.equal(store.visitsForClient('anna'), 4);
  at('2030-01-08T07:05:00Z');
  store.completeBooking(first.id);
  assert.equal(store.visitsForClient('anna'), 5);
  assert.equal(store.numberForVisit(first), 5);
  assert.equal(store.activeCount.value, 0);
  assert.throws(() => store.completeBooking(first.id));
  assert.throws(() => store.completeBooking(cancelled.id));
  store.cancelBooking(first.id);
  assert.equal(first.status, 'completed');
  assert.ok(
    !freeSlots({
      date: draft.date,
      duration: 30,
      bookings: store.bookings.value,
      daysOff: [],
      breaks: [],
      now: store.clock.value,
    }).includes('10:30'),
  );
  const next = store.book({ ...draft, time: '12:00' });
  assert.equal(store.numberForVisit(next), 6);
  store.undoCompletion(first.id);
  assert.equal(store.visitsForClient('anna'), 4);
  assert.equal(store.numberForVisit(next), 5);
  assert.throws(() => store.setPreviousVisits('anna', -1));
  assert.throws(() => store.setPreviousVisits('anna', 1.5));
});

test('clients and guests cannot edit categories, services or visit counts', () => {
  const { store, draft, at } = setup();
  const booking = store.book(draft);
  at('2030-01-08T07:05:00Z');
  for (const actor of ['anna', 'guest']) {
    store.switchProfile(actor);
    const actions = [
      () => store.addCategory('Чужая'),
      () => store.renameCategory(1, 'Чужая'),
      () => store.removeCategory(1, 2),
      () => store.removeService(1),
      () => store.addService({ ...draft.service, categoryId: 1 }),
      () => store.editService(1, { ...draft.service, categoryId: 1 }),
      () => store.setPreviousVisits('anna', 999),
      () => store.completeBooking(booking.id),
      () => store.undoCompletion(booking.id),
    ];
    for (const action of actions) assert.throws(action, /только Ольге/);
  }
  assert.equal(store.visitsForClient('anna'), 0);
  assert.equal(store.categories.value.length, 4);
});
