<template>
  <div :class="{ 'booking-summary--admin': isAdmin }">
    <BaseButton v-if="isAdmin" variant="text" class="mb-4 ps-0" @click="$emit('back')"
      >Вернуться в расписание</BaseButton
    >
    <p v-if="!isAdmin" class="section-heading__kicker">ОНЛАЙН-ЗАПИСЬ</p>
    <h1 v-if="isAdmin" class="display-subtitle mb-3">Новая запись</h1>
    <h1 v-else class="display-title mb-4">
      Время<br /><em class="text-secondary">для вашей кожи.</em>
    </h1>
    <p class="text-body-secondary booking-summary__intro">
      {{
        isAdmin
          ? 'Выберите клиента или добавьте нового. Показываем свободное время из общего расписания.'
          : 'Показываем только свободное время, которого хватит на выбранную процедуру.'
      }}
    </p>
    <div
      class="mt-4 rounded-3 border p-4 booking-summary__details"
      :class="{ 'd-none d-md-block': isAdmin }"
    >
      <small class="small booking-summary__label">ПРОЦЕДУРА</small>
      <h2 class="my-3 fs-4 fw-semibold">{{ service.name }}</h2>
      <p class="mb-3">{{ service.duration }} минут</p>
      <strong class="fs-4">{{ money(service.price) }}</strong>
    </div>
    <p class="mt-3 small text-body-secondary" :class="{ 'd-none d-md-block': isAdmin }">
      Все даты и время — по Минску.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '../../../entities/practice/index.ts';
import { money } from '../../../shared/lib/format/index.ts';
import { BaseButton } from '../../../shared/ui/index.ts';

defineProps<{ service: Service; isAdmin: boolean }>();
defineEmits<{ back: [] }>();
</script>

<style scoped>
.booking-summary__intro {
  max-width: 300px;
}
@media (min-width: 768px) {
  .booking-summary__details {
    max-width: 330px;
  }
}
.booking-summary__label {
  letter-spacing: 0.2em;
}
.booking-summary--admin .booking-summary__intro {
  max-width: 420px;
  font-size: 14px;
}
</style>
