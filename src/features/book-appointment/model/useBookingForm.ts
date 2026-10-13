import { computed, ref, watch } from 'vue';
import {
  findClientByPhone,
  addDays,
  freeSlots,
  type PracticeStore,
  type Booking,
  type CustomerSelection,
} from '../../../entities/practice/index.ts';

export function useBookingForm(
  store: PracticeStore,
  initial: { clientId?: string; date?: string } = {},
) {
  const customer = ref<CustomerSelection>({
    mode: 'existing',
    clientId:
      store.isAdmin.value && store.clients.value.some((client) => client.id === initial.clientId)
        ? initial.clientId!
        : '',
  });
  const date = ref(initial.date ?? '');
  const time = ref('');
  const dayPage = ref(0);
  const reminder = ref(false);
  const error = ref('');
  const success = ref<Booking | null>(null);

  const bookingClient = computed(() => {
    const selection = customer.value;
    return store.isAdmin.value
      ? selection.mode === 'existing'
        ? store.clients.value.find((client) => client.id === selection.clientId)
        : undefined
      : store.currentClient.value;
  });
  const duplicateClient = computed(() =>
    customer.value.mode === 'new'
      ? findClientByPhone(store.clients.value, customer.value.phone)
      : undefined,
  );
  const canRemind = computed(() => Boolean(bookingClient.value?.reminderChannel));
  const canSubmit = computed(
    () =>
      !!date.value &&
      !!time.value &&
      !!store.selectedService.value &&
      (!store.isAdmin.value ||
        (customer.value.mode === 'existing' ? !!bookingClient.value : !duplicateClient.value)),
  );

  function slotsFor(key: string): string[] {
    return freeSlots({
      date: key,
      duration: store.selectedService.value?.duration ?? 0,
      bookings: store.bookings.value,
      daysOff: store.daysOff.value,
      breaks: store.breaks.value,
      now: store.clock.value,
    });
  }
  const availableDays = computed(() =>
    Array.from({ length: 90 }, (_, i) => addDays(store.today.value, i)).filter(
      (key) => slotsFor(key).length,
    ),
  );
  const visibleDays = computed(() =>
    availableDays.value.slice(dayPage.value * 7, dayPage.value * 7 + 7),
  );
  const availableTimes = computed(() => slotsFor(date.value));

  watch(
    availableDays,
    (list) => {
      if (!list.includes(date.value)) {
        date.value = list[0] || '';
        time.value = '';
      }
      dayPage.value = Math.max(0, Math.floor(list.indexOf(date.value) / 7));
    },
    { immediate: true },
  );
  dayPage.value = Math.max(0, Math.floor(availableDays.value.indexOf(date.value) / 7));
  const prefillNotice = ref(
    initial.date && initial.date !== date.value
      ? 'На выбранную дату нет доступного времени для этой процедуры. Выберите другую дату ниже.'
      : '',
  );
  watch(availableTimes, (list) => {
    if (!list.includes(time.value)) time.value = '';
  });
  watch(
    canRemind,
    (value) => {
      reminder.value = value;
    },
    { immediate: true },
  );
  watch(customer, () => {
    error.value = '';
  });
  watch(store.selectedService, () => {
    if (!availableDays.value.includes(date.value)) date.value = availableDays.value[0] || '';
    dayPage.value = Math.max(0, Math.floor(availableDays.value.indexOf(date.value) / 7));
    time.value = '';
    error.value = '';
  });

  function resetSlots() {
    dayPage.value = 0;
    date.value = availableDays.value[0] || '';
    time.value = '';
    error.value = '';
  }
  function changeDatePage(delta: number) {
    const next = dayPage.value + delta;
    if (next < 0 || next * 7 >= availableDays.value.length) return;
    dayPage.value = next;
    selectDate(visibleDays.value[0] || '');
  }
  function selectDate(key: string) {
    date.value = key;
    time.value = '';
  }
  function submit() {
    error.value = '';
    try {
      if (!store.selectedService.value) throw new Error('В прайсе пока нет процедур.');
      success.value = store.book({
        service: store.selectedService.value,
        date: date.value,
        time: time.value,
        reminder: reminder.value,
        customer: customer.value,
      });
      time.value = '';
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не удалось создать запись.';
      store.refreshClock();
    }
  }
  function reset() {
    prefillNotice.value = '';
    success.value = null;
    customer.value = { mode: 'existing', clientId: '' };
    reminder.value = !store.isAdmin.value && Boolean(store.currentClient.value?.reminderChannel);
    resetSlots();
  }

  return {
    prefillNotice,
    customer,
    date,
    time,
    dayPage,
    reminder,
    error,
    success,
    bookingClient,
    canRemind,
    canSubmit,
    availableDays,
    visibleDays,
    availableTimes,
    changeDatePage,
    selectDate,
    submit,
    reset,
  };
}
