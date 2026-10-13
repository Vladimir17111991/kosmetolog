<template>
  <div class="card p-4 align-self-start p-md-5" role="status">
    <span
      class="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success-emphasis flex-shrink-0 booking-confirmation__success-icon"
      aria-hidden="true"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
    </span>
    <h2 class="display-subtitle mb-4">{{ isAdmin ? 'Клиент записан' : 'Вы записаны' }}</h2>
    <p v-if="isAdmin">{{ booking.name }} · {{ booking.phone }}</p>
    <p v-else>{{ booking.name }}, запись появилась в вашем кабинете и в расписании Ольги.</p>
    <div class="my-4 d-flex flex-column gap-3 rounded-2 bg-light p-4">
      <strong>{{ booking.service.name }}</strong>
      <p>{{ fullDate(booking.date) }} · {{ booking.time }}</p>
      <p>{{ booking.reminder ? 'Напоминание за 24 часа выбрано.' : 'Без напоминания.' }}</p>
    </div>
    <p v-if="isAdmin" class="mb-3 small text-body-secondary">
      Время занято в вашем расписании. Карточка клиента сохранена без создания аккаунта.
    </p>
    <p class="mb-3 small text-body-secondary">В прототипе сообщения не отправляются.</p>
    <BaseButton @click="$emit('show')">{{
      isAdmin ? 'Посмотреть в расписании' : 'Перейти в мой кабинет'
    }}</BaseButton>
    <BaseButton v-if="isAdmin" variant="text" class="mt-3 d-block" @click="$emit('another')"
      >Записать ещё клиента</BaseButton
    >
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '../../../entities/practice/index.ts';
import { fullDate } from '../../../shared/lib/format/index.ts';
import { BaseButton } from '../../../shared/ui/index.ts';

defineProps<{ booking: Booking; isAdmin: boolean }>();
defineEmits<{ show: []; another: [] }>();
</script>

<style scoped>
.booking-confirmation__success-icon {
  width: 3.25rem;
  height: 3.25rem;
}
</style>
