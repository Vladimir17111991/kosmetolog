<template>
  <div class="row gy-4 align-items-start">
    <div class="col-lg-5">
      <section v-if="!services.length" class="card p-4">
        <h2 class="display-subtitle">Сначала добавьте процедуру</h2>
        <p class="my-3 small text-body-secondary">Фото привязывается к процедуре из прайса.</p>
        <BaseButton @click="emit('openPrice')">Открыть редактор прайса</BaseButton>
      </section>
      <form v-else ref="form" class="card p-4" @submit.prevent="publish">
        <h2 class="display-subtitle">Добавить работу</h2>
        <label for="photo-service" class="form-label mt-4">Процедура из прайса</label>
        <select id="photo-service" v-model="serviceId" class="form-select">
          <option v-for="service in services" :key="service.id" :value="service.id">
            {{ service.category }} · {{ service.name }}
          </option>
        </select>
        <fieldset class="mt-4">
          <legend class="fs-6">Формат работы</legend>
          <div class="d-flex flex-wrap gap-3">
            <label class="form-check"
              ><input
                v-model="mode"
                class="form-check-input"
                type="radio"
                value="pair"
                name="photo-mode"
              />
              Два фото: до / после</label
            >
            <label class="form-check"
              ><input
                v-model="mode"
                class="form-check-input"
                type="radio"
                value="single"
                name="photo-mode"
              />
              Одно фото / коллаж</label
            >
          </div>
        </fieldset>
        <template v-if="mode === 'pair'">
          <label for="photo-before" class="form-label mt-3">До — первый визит</label>
          <input
            id="photo-before"
            type="file"
            accept="image/*"
            class="form-control"
            @change="before.select"
          />
        </template>
        <label for="photo-after" class="form-label mt-3">{{
          mode === 'pair' ? 'После — последний визит' : 'Фотография или коллаж'
        }}</label>
        <input
          id="photo-after"
          type="file"
          accept="image/*"
          class="form-control"
          @change="after.select"
        />
        <p class="small text-secondary mt-2">
          Выберите фото из галереи телефона или с компьютера, до 20 МБ. Снимки показываются целиком.
          Для сравнения выбирайте одинаковые ракурс и освещение.
        </p>
        <PhotoPair
          v-if="ready"
          class="mt-3"
          :src="after.url.value"
          :before-src="mode === 'pair' ? before.url.value : undefined"
          title="Предпросмотр работы"
        />
        <label for="photo-title" class="form-label mt-3">Название работы</label>
        <input
          id="photo-title"
          v-model="title"
          class="form-control"
          required
          maxlength="100"
          placeholder="Например, уход за кожей"
        />
        <label for="photo-note" class="form-label mt-3">Посещения и срок съёмки</label>
        <input
          id="photo-note"
          v-model="comparisonNote"
          class="form-control"
          maxlength="180"
          placeholder="Например: 3 визита · фото через 2 недели"
        />
        <p
          v-if="error || before.error.value || after.error.value"
          class="alert alert-warning mt-3"
          role="alert"
        >
          {{ error || before.error.value || after.error.value }}
        </p>
        <p v-if="message" class="small text-secondary mt-3" role="status">{{ message }}</p>
        <BaseButton type="submit" class="mt-4 w-100" :disabled="!ready"
          >Добавить в галерею</BaseButton
        >
        <p class="small text-secondary mt-3 mb-0">
          Фото сохраняются в этой вкладке до обновления. Добавляйте работы с разрешения клиента.
        </p>
      </form>
    </div>
    <section class="col-lg-7">
      <h2 class="display-subtitle mb-4">Работы на сайте</h2>
      <p v-if="!photos.length" class="text-secondary">Добавьте первую работу через форму слева.</p>
      <div class="row g-3">
        <div v-for="photo in photos" :key="photo.id" class="col-md-6">
          <article class="card p-3 h-100">
            <PhotoPair
              :src="photo.url"
              :before-src="photo.beforeUrl"
              :demo-diptych="photo.demoDiptych"
              :title="photo.title"
            />
            <p v-if="photo.isDemo" class="small text-secondary mt-3 mb-1">
              Пример оформления · не результат процедуры
            </p>
            <p class="small text-secondary mt-3 mb-1">
              {{ services.find((item) => item.id === photo.serviceId)?.name }}
            </p>
            <h3 class="fs-6">{{ photo.title }}</h3>
            <p v-if="photo.comparisonNote" class="small text-secondary">
              {{ photo.comparisonNote }}
            </p>
            <BaseButton
              variant="text"
              class="mt-auto"
              :aria-label="'Убрать фото: ' + photo.title"
              @click="removePhoto(photo.id)"
              >Убрать из галереи</BaseButton
            >
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePractice } from '../../../entities/practice/index.ts';
import { BaseButton, PhotoPair } from '../../../shared/ui/index.ts';
import { usePhotoUpload } from '../../../shared/lib/image-upload/index.ts';
const emit = defineEmits<{ openPrice: [] }>();
const { services, photos, addPhoto, removePhoto } = usePractice();
const serviceId = ref(services.value[0]?.id ?? 0);
const mode = ref<'pair' | 'single'>('pair');
const before = usePhotoUpload();
const after = usePhotoUpload();
const title = ref('');
const comparisonNote = ref('');
const error = ref('');
const message = ref('');
const form = ref<HTMLFormElement | null>(null);
const ready = computed(() => after.ready.value && (mode.value === 'single' || before.ready.value));
watch(
  () => services.value.map((item) => item.id),
  (ids) => {
    if (!ids.includes(serviceId.value)) serviceId.value = ids[0] ?? 0;
  },
);
watch(mode, () => {
  before.release();
  before.error.value = '';
  error.value = '';
});
function publish() {
  error.value = '';
  message.value = '';
  if (!ready.value) return;
  try {
    addPhoto({
      serviceId: serviceId.value,
      title: title.value,
      url: after.url.value,
      beforeUrl: mode.value === 'pair' ? before.url.value : undefined,
      comparisonNote: comparisonNote.value,
    });
    before.take();
    after.take();
    title.value = '';
    comparisonNote.value = '';
    form.value?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
      input.value = '';
    });
    message.value = 'Работа добавлена. Откройте «Результаты», чтобы увидеть её на сайте.';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось добавить работу.';
  }
}
</script>
