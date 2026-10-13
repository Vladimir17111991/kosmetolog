import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeStore, addDays, weekday } from '../src/entities/practice/index.ts';

function draft(store: ReturnType<typeof createPracticeStore>) {
  const date = addDays(store.today.value, 8 - weekday(store.today.value));
  return { service: store.services.value[1], date, time: '11:00', reminder: false };
}

test('visitors cannot book, create clients or change public content', () => {
  const store = createPracticeStore();
  assert.equal(store.isGuest.value, true);
  assert.throws(() => store.book(draft(store)), /Войдите/);
  for (const profile of ['guest', 'anna']) {
    store.switchProfile(profile);
    assert.throws(() => store.addClient('Елена', '+375000000003'), /только Ольге/);
    assert.throws(() => store.enableClientAccess('anna'), /только Ольге/);
    assert.throws(() => store.updateService(2, 120, 60), /только Ольге/);
    assert.throws(
      () => store.addPhoto({ serviceId: 2, title: 'Работа', url: 'blob:test' }),
      /только Ольге/,
    );
    assert.throws(() => store.removePhoto('missing'), /только Ольге/);
  }
  assert.equal(store.clients.value.length, 2);
  assert.equal(store.photos.value.length, 0);
});

test('Olga adds client cards without creating visitor accounts', () => {
  const store = createPracticeStore();
  store.switchProfile('olga');
  const client = store.addClient(' Елена ', '+375 (00) 000-00-03');
  assert.equal(store.bookings.value.length, 0);
  assert.throws(() => store.addClient('Повтор', '+375000000003'), /уже есть/);
  assert.equal(store.clients.value.length, 3);
  assert.equal(client.accountId, null);
  assert.equal(store.profiles.value.filter((item) => item.id === client.id).length, 0);
  const booking = store.book({
    ...draft(store),
    customer: { mode: 'existing', clientId: client.id },
  });
  assert.equal(booking.clientId, client.id);
  store.switchProfile('maria');
  assert.equal(store.visibleBookings.value.length, 0);
  assert.throws(() => store.book(draft(store)), /недоступно/);
});

test('price changes affect new bookings while preserving existing appointment prices', () => {
  const store = createPracticeStore();
  store.switchProfile('anna');
  const original = { ...draft(store), service: { ...store.services.value[1] } };
  const booking = store.book(original);
  store.switchProfile('olga');
  assert.throws(() => store.updateService(2, Number.NaN, 60));
  assert.throws(() => store.updateService(2, 120, 0));
  store.updateService(2, 125, 75);
  assert.equal(booking.service.price, 110);
  store.switchProfile('anna');
  const next = store.book({ ...original, time: '14:00' });
  assert.equal(next.service.price, 125);
  assert.equal(next.service.duration, 75);
});

test('portfolio items must reference a price-list procedure and remain removable', () => {
  const store = createPracticeStore();
  store.switchProfile('olga');
  assert.throws(() => store.addPhoto({ serviceId: 99, title: 'Фото', url: 'blob:demo' }), /прайса/);
  assert.throws(() => store.addPhoto({ serviceId: 2, title: ' ', url: 'blob:demo' }), /подпись/);
  store.addPhoto({ serviceId: 2, title: ' Пример ухода ', url: 'blob:demo' });
  const photo = store.photos.value[0];
  assert.equal(store.services.value.find((item) => item.id === photo.serviceId)?.category, 'Уход');
  assert.equal(photo.title, 'Пример ухода');
  store.removePhoto(photo.id);
  assert.equal(store.photos.value.length, 0);
});
