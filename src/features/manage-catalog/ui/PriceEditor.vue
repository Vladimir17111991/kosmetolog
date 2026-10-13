<template>
  <section>
    <h2 class="display-subtitle">Ваш прайс-лист</h2>
    <p class="mt-3 mb-4 small text-body-secondary">
      Изменения сразу видны на сайте. Стоимость уже созданных записей сохраняется.
    </p>
    <CategoryManager />
    <div class="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
      <h3 class="fs-5 fw-semibold">Процедуры · {{ services.length }}</h3>
      <BaseButton :disabled="!categories.length" @click="adding = !adding">{{
        adding ? 'Закрыть форму' : 'Новая процедура'
      }}</BaseButton>
    </div>
    <PriceEditorRow v-if="adding && categories.length" class="mb-4" @added="adding = false" />
    <p v-if="!services.length" class="mb-4 small text-body-secondary">
      Процедур пока нет. Пустой прайс не позволяет создать запись.
    </p>
    <div class="grid align-items-start gap-3 grid-cols-md-2">
      <PriceEditorRow v-for="service in services" :key="service.id" :service="service" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePractice } from '../../../entities/practice/index.ts';
import PriceEditorRow from './PriceEditorRow.vue';
import CategoryManager from './CategoryManager.vue';
import { BaseButton } from '../../../shared/ui/index.ts';
const { services, categories } = usePractice();
const adding = ref(false);
</script>
