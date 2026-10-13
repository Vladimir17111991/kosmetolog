import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findClientByPhone,
  matchesClient,
  prepareBooking,
  type PrepareBookingOptions,
  type Client,
  bookingsForClient,
  freeSlots,
} from '../src/entities/practice/index.ts';

const clients: Client[] = [
  {
    id: 'client-1',
    accountId: 'anna',
    name: 'Анна',
    phone: '+375 (00) 000-00-01',
    reminderChannel: 'telegram',
  },
  {
    id: 'client-2',
    accountId: 'maria',
    name: 'Мария',
    phone: '+375 (00) 000-00-02',
    reminderChannel: 'telegram',
  },
];
const base: PrepareBookingOptions = {
  actor: { id: 'olga', role: 'admin' },
  clients,
  bookings: [],
  service: {
    id: 1,
    name: 'Консультация',
    duration: 30,
    price: 50,
    category: 'Знакомство',
    categoryId: 1,
    description: 'Демо',
  },
  date: '2030-05-06',
  time: '11:00',
  daysOff: [],
  breaks: [],
  customer: { mode: 'existing', clientId: 'client-1' },
  reminder: true,
  now: new Date('2030-05-01T00:00:00Z'),
};

test('admin-created visit belongs to selected client and blocks the shared schedule', () => {
  const { booking, newClient } = prepareBooking(base);
  assert.equal(newClient, null);
  assert.equal(booking.clientId, 'client-1');
  assert.equal(booking.createdBy, 'olga');
  assert.equal(booking.source, 'admin');
  assert.equal(bookingsForClient([booking], 'client-1').length, 1);
  assert.equal(bookingsForClient([booking], 'client-2').length, 0);
  assert.ok(!freeSlots({ ...base, duration: 30, bookings: [booking] }).includes('11:00'));
  assert.throws(
    () =>
      prepareBooking({
        ...base,
        bookings: [booking],
        customer: { mode: 'existing', clientId: 'client-2' },
      }),
    /время уже недоступно/,
  );
});

test('new client receives a reusable card without account or unconnected reminder', () => {
  const { booking, newClient } = prepareBooking({
    ...base,
    customer: { mode: 'new', name: '  Елена  ', phone: '+375 (00) 000-00-03' },
  });
  assert.ok(newClient);
  assert.equal(newClient.name, 'Елена');
  assert.equal(newClient.phone, '+375000000003');
  assert.equal(newClient.accountId, null);
  assert.equal(booking.clientId, newClient.id);
  assert.equal(booking.reminder, false);
  const followUp = prepareBooking({
    ...base,
    clients: [...clients, newClient],
    bookings: [booking],
    time: '12:00',
    customer: { mode: 'existing', clientId: newClient.id },
  });
  assert.equal(followUp.newClient, null);
  assert.equal(followUp.booking.clientId, newClient.id);
});

test('same phone in different formats cannot create duplicate client', () => {
  assert.equal(findClientByPhone(clients, '375000000001')?.id, 'client-1');
  assert.throws(
    () =>
      prepareBooking({
        ...base,
        customer: { mode: 'new', name: 'Другое имя', phone: '+375-00-000-00-01' },
      }),
    /уже есть/,
  );
});

test('client actor cannot book on behalf of another person', () => {
  const { booking } = prepareBooking({ ...base, actor: { id: 'maria', role: 'client' } });
  assert.equal(booking.clientId, 'client-2');
  assert.equal(booking.name, 'Мария');
  assert.equal(booking.source, 'client');
  assert.throws(
    () => prepareBooking({ ...base, actor: { id: 'visitor', role: 'client' } }),
    /Профиль клиента не найден/,
  );
  assert.throws(
    () => prepareBooking({ ...base, actor: { id: 'visitor', role: 'guest' } }),
    /Войдите/,
  );
});

test('failed booking leaves client and appointment collections untouched', () => {
  const snapshot = JSON.stringify(base);
  assert.throws(
    () =>
      prepareBooking({
        ...base,
        daysOff: [1],
        customer: { mode: 'new', name: 'Елена', phone: '+375000000003' },
      }),
    /время уже недоступно/,
  );
  assert.equal(JSON.stringify(base), snapshot);
  assert.throws(
    () => prepareBooking({ ...base, breaks: [{ start: '2030-05-05', end: '2030-05-07' }] }),
    /время уже недоступно/,
  );
  assert.throws(() => prepareBooking({ ...base, time: '19:00' }), /время уже недоступно/);
});

test('missing client, name, wrong phone, past time and booking horizon are rejected', () => {
  assert.throws(
    () => prepareBooking({ ...base, customer: { mode: 'existing', clientId: 'missing' } }),
    /Выберите клиента/,
  );
  for (const name of ['', '  ', 'А'.repeat(61)]) {
    assert.throws(
      () => prepareBooking({ ...base, customer: { mode: 'new', name, phone: '+375000000003' } }),
      /имя клиента/,
    );
  }
  for (const phone of ['123', '+70000000003', '+375000000003text']) {
    assert.throws(
      () => prepareBooking({ ...base, customer: { mode: 'new', name: 'Елена', phone } }),
      /телефон/,
    );
  }
  assert.throws(
    () => prepareBooking({ ...base, now: new Date('2030-05-06T09:00:00Z') }),
    /время уже недоступно/,
  );
  assert.throws(() => prepareBooking({ ...base, date: '2030-08-01' }), /90 дней/);
});

test('search supports case-insensitive names and formatted phone fragments', () => {
  assert.ok(matchesClient(clients[0], ' АННА '));
  assert.ok(matchesClient(clients[1], '000-00-02'));
  assert.equal(matchesClient(clients[0], 'Елена'), false);
});
