<template>
  <section v-if="!service" class="card p-4 mt-5">
    <h1 class="display-subtitle">В прайсе пока нет процедур</h1>
    <p class="my-3 text-body-secondary">
      {{
        isAdmin
          ? 'Сначала добавьте категорию и процедуру в разделе «Прайс» кабинета.'
          : 'Ольга обновляет список процедур. Загляните позже.'
      }}
    </p>
    <BaseButton @click="emit('back')">
      {{ isAdmin ? 'В кабинет' : 'К прайсу' }}
    </BaseButton>
  </section>
  <section v-else class="grid align-items-start gap-4 pt-4 booking-view__layout">
    <BookingSummary :service="service" :is-admin="isAdmin" @back="emit('back')" />
    <BookingConfirmation
      v-if="success"
      :booking="success"
      :is-admin="isAdmin"
      @show="emit('show', success)"
      @another="reset"
    />
    <form v-else class="card p-4 p-md-5 booking-view__form" @submit.prevent="submit">
      <h2 class="display-subtitle mb-4">
        {{ isAdmin ? 'Записать клиента' : 'Запись на процедуру' }}
      </h2>
      <ClientPicker v-if="isAdmin" v-model="customer" :clients="clients" />
      <div v-else class="d-flex align-items-center gap-3 rounded-2 bg-light p-3">
        <span
          class="grid flex-shrink-0 align-items-center justify-content-center rounded-pill bg-primary-subtle fs-5 booking-view__avatar"
        >
          {{ currentUser.name[0] }}
        </span>
        <div>
          <strong>{{ currentUser.name }}</strong>
          <small class="mt-1 d-block small text-body-secondary">
            {{ currentClient?.phone }} · демо-профиль
          </small>
        </div>
      </div>
      <label for="service" class="form-label mt-4 mb-2 d-block small fw-semibold">Процедура</label>
      <select id="service" v-model="service" class="form-select">
        <option v-for="item in services" :key="item.id" :value="item">
          {{ item.name }} · {{ money(item.price) }}
        </option>
      </select>
      <p v-if="prefillNotice" role="status" class="alert practice-notice mt-3">
        {{ prefillNotice }}
      </p>
      <AvailabilityPicker
        :date="date"
        :time="time"
        :days="visibleDays"
        :slots="availableTimes"
        :day-count="availableDays.length"
        :page="dayPage"
        @date="selectDate"
        @time="time = $event"
        @page="changeDatePage"
      />
      <label class="mt-4 d-flex align-items-start gap-2 small lh-base">
        <input
          v-model="reminder"
          class="mt-1 form-check-input flex-shrink-0"
          type="checkbox"
          :disabled="!canRemind"
        />
        Напомнить за 24 часа (демонстрация)
      </label>
      <p v-if="isAdmin && !canRemind" class="mt-3 small text-body-secondary">
        {{
          customer.mode === 'existing' && !bookingClient
            ? 'Выберите клиента, чтобы проверить возможность напоминания.'
            : 'Канал напоминаний не подключён. Сам телефон не даёт боту возможности написать клиенту.'
        }}
      </p>
      <p v-if="error" class="alert alert-warning mt-3 small" role="alert">
        {{ error }}
      </p>
      <BaseButton type="submit" class="mt-3 w-100" :disabled="!canSubmit">
        {{ isAdmin ? 'Подтвердить запись клиента' : 'Подтвердить демо-запись' }}
      </BaseButton>
      <p class="mt-3 text-center small text-body-secondary">
        {{
          isAdmin
            ? 'Запись занимает время в общем расписании.'
            : `Демо-профиль для записи: ${currentUser.name}.`
        }}
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePractice, type Booking } from '../../../entities/practice/index.ts';
import { useBookingForm } from '../model/useBookingForm.ts';
import { money } from '../../../shared/lib/format/index.ts';
import { BaseButton } from '../../../shared/ui/index.ts';
import ClientPicker from './ClientPicker.vue';
import AvailabilityPicker from './AvailabilityPicker.vue';
import BookingSummary from './BookingSummary.vue';
import BookingConfirmation from './BookingConfirmation.vue';

const store = usePractice();
const props = defineProps<{ initial?: { clientId?: string; date?: string } }>();
const emit = defineEmits<{ back: []; show: [booking: Booking] }>();
const { services, isAdmin, currentUser, currentClient, clients, selectedService } = store;
const {
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
} = useBookingForm(store, props.initial);
const service = computed({ get: () => selectedService.value, set: store.selectService });
</script>

<style scoped>
@media (min-width: 768px) {
  .booking-view__layout {
    grid-template-columns: 0.9fr 1.2fr;
    padding-top: 3.5rem;
  }
}
@media (min-width: 992px) {
  .booking-view__layout {
    gap: 4.25rem;
  }
}
.booking-view__form {
  min-width: 0;
}
.booking-view__avatar {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
