<template>
  <article
    class="appointment-card card mt-3"
    :class="{ 'appointment-card--cancelled': booking.status === 'cancelled' }"
  >
    <div class="appointment-card__body">
      <div class="appointment-card__time">
        <strong class="appointment-card__start">{{ booking.time }}</strong>
        <span class="appointment-card__end">{{ endTime }}</span>
        <small class="appointment-card__date">{{ shortDate(booking.date) }}</small>
      </div>
      <div class="appointment-card__details">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h3 class="fs-5 fw-semibold mb-0 text-break">
            {{ isAdmin ? booking.name : booking.service.name }}
          </h3>
          <span
            class="appointment-card__status"
            :class="'appointment-card__status--' + booking.status"
            >{{ statusLabel }}</span
          >
        </div>
        <p v-if="isAdmin" class="mb-1">{{ booking.service.name }}</p>
        <p class="small text-muted mb-2">
          {{ booking.service.duration }} мин · {{ money(booking.service.price) }}
        </p>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <span v-if="isAdmin && booking.status !== 'cancelled'" class="appointment-card__visit"
            >Посещение №{{ visitNumber }}</span
          >
          <a
            v-if="isAdmin"
            :href="'tel:' + booking.phone.replace(/[^+\d]/g, '')"
            class="appointment-card__phone"
            >{{ booking.phone }}</a
          >
        </div>
        <p v-if="booking.reminder" class="small text-muted mt-2 mb-0">
          Напоминание за 24 часа · демо
        </p>
      </div>
    </div>
    <div v-if="booking.status !== 'cancelled'" class="appointment-card__actions">
      <BaseButton
        v-if="isAdmin && booking.status === 'confirmed'"
        class="appointment-card__action"
        variant="secondary"
        :disabled="!canComplete"
        :title="
          canComplete
            ? 'Добавить визит в счётчик посещений'
            : 'Доступно после наступления времени визита'
        "
        @click="$emit('complete')"
        >Визит состоялся</BaseButton
      >
      <BaseButton
        v-if="isAdmin && booking.status === 'completed'"
        class="appointment-card__action"
        variant="text"
        @click="$emit('undo')"
        >Снять отметку</BaseButton
      >
      <BaseButton
        v-if="booking.status === 'confirmed' && !confirming"
        class="appointment-card__action"
        variant="text"
        @click="$emit('requestCancel')"
        >Отменить запись</BaseButton
      >
    </div>
    <div v-if="confirming" class="border-top p-3" role="group" aria-label="Подтверждение отмены">
      <p class="mb-3 small">
        Отменить запись {{ booking.name }} на {{ shortDate(booking.date) }} в {{ booking.time }}?
      </p>
      <div class="d-flex flex-wrap gap-2">
        <BaseButton variant="danger" @click="$emit('cancel')">Да, отменить</BaseButton>
        <BaseButton variant="text" @click="$emit('keep')">Оставить запись</BaseButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Booking } from '../../../entities/practice/index.ts';
import { money, shortDate } from '../../../shared/lib/format/index.ts';
import { BaseButton } from '../../../shared/ui/index.ts';
const props = defineProps<{
  booking: Booking;
  isAdmin: boolean;
  confirming: boolean;
  visitNumber: number;
  canComplete: boolean;
}>();
defineEmits<{ requestCancel: []; cancel: []; keep: []; complete: []; undo: [] }>();
const statusLabel = computed(
  () =>
    ({ confirmed: 'Ожидается', completed: 'Состоялся', cancelled: 'Отменена' })[
      props.booking.status
    ],
);
const endTime = computed(() => {
  const [hour = 0, minute = 0] = props.booking.time.split(':').map(Number);
  const end = hour * 60 + minute + props.booking.service.duration;
  return String(Math.floor(end / 60)).padStart(2, '0') + ':' + String(end % 60).padStart(2, '0');
});
</script>

<style scoped>
.appointment-card {
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 5px 20px #78475608;
}
.appointment-card--cancelled {
  background: #f5f2f0;
}
.appointment-card__body {
  display: flex;
  gap: 20px;
  padding: 22px;
}
.appointment-card__time {
  flex-shrink: 0;
  width: 64px;
  border-right: 1px solid var(--line);
  color: var(--brand);
}
.appointment-card__start {
  display: block;
  font-size: 21px;
}
.appointment-card__end {
  display: block;
  font-size: 13px;
  color: var(--muted);
  margin: 4px 0 10px;
}
.appointment-card__date {
  font-size: 10px;
}
.appointment-card__details {
  min-width: 0;
}
.appointment-card__status {
  padding: 5px 9px;
  border-radius: 7px;
  font-size: 10px;
}
.appointment-card__status--confirmed {
  color: #75552b;
  background: #faf0de;
}
.appointment-card__status--completed {
  color: #39664d;
  background: #e9f1e8;
}
.appointment-card__status--cancelled {
  color: #6a5d65;
  background: #e7e2e5;
}
.appointment-card__visit {
  padding: 5px 9px;
  border-radius: 8px;
  font-size: 12px;
  background: #f5e8ef;
  color: var(--brand);
}
.appointment-card__phone {
  font-size: 12px;
  text-underline-offset: 4px;
  padding: 8px 0;
}
.appointment-card__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  background: #fffcfa;
}
.appointment-card__action {
  font-size: 12px;
  min-height: 44px;
  padding: 10px 14px;
}
@media (max-width: 575.98px) {
  .appointment-card__body {
    padding: 16px 12px;
    gap: 12px;
  }
  .appointment-card__time {
    width: 56px;
  }
  .appointment-card__actions {
    padding: 12px;
    gap: 8px;
  }
  .appointment-card__action {
    flex: 1;
  }
}
</style>
