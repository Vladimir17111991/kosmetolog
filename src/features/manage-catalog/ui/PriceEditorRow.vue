<template>
  <div class="card p-4">
    <form @submit.prevent="save" @input="saved = false">
      <h3 class="mb-3 fs-5 fw-semibold">{{ service?.name ?? 'Новая процедура' }}</h3>
      <label :for="`service-name-${fieldId}`" class="form-label mt-4 mb-2 d-block small fw-semibold"
        >Название процедуры</label
      ><input
        :id="`service-name-${fieldId}`"
        v-model="name"
        class="form-control"
        required
        maxlength="80"
      />
      <label
        :for="`service-category-${fieldId}`"
        class="form-label mt-4 mb-2 d-block small fw-semibold"
        >Категория</label
      ><select
        :id="`service-category-${fieldId}`"
        v-model="categoryId"
        class="form-select"
        required
      >
        <option value="" disabled>Выберите категорию</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <label :for="`description-${fieldId}`" class="form-label mt-4 mb-2 d-block small fw-semibold"
        >Описание</label
      ><textarea
        :id="`description-${fieldId}`"
        v-model="description"
        maxlength="400"
        rows="2"
        class="w-100 rounded-2 border bg-white p-3 small form-control"
      ></textarea>
      <details class="mt-3">
        <summary class="small fw-semibold">Подробности для посетителей</summary>
        <div v-for="field in detailFields" :key="field.key" class="mt-3">
          <label :for="'detail-' + field.key + '-' + fieldId" class="form-label small">{{
            field.label
          }}</label>
          <textarea
            :id="'detail-' + field.key + '-' + fieldId"
            v-model="details[field.key]"
            class="form-control"
            rows="3"
            maxlength="500"
          ></textarea>
        </div>
      </details>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label :for="`price-${fieldId}`" class="form-label mt-4 mb-2 d-block small fw-semibold"
            >Цена, BYN</label
          ><input
            :id="`price-${fieldId}`"
            v-model="price"
            class="form-control"
            type="number"
            min="0"
            max="10000"
            step="0.01"
            required
          />
        </div>
        <div>
          <label :for="`duration-${fieldId}`" class="form-label mt-4 mb-2 d-block small fw-semibold"
            >Время, мин</label
          ><input
            :id="`duration-${fieldId}`"
            v-model="duration"
            class="form-control"
            type="number"
            min="15"
            max="480"
            step="15"
            required
          />
        </div>
      </div>
      <div class="mt-4 d-flex flex-wrap align-items-center gap-3">
        <BaseButton type="submit" :disabled="!categories.length">{{
          service ? 'Сохранить процедуру' : 'Добавить процедуру'
        }}</BaseButton
        ><BaseButton
          v-if="service"
          variant="text"
          :aria-label="`Удалить процедуру: ${service.name}`"
          @click="
            removing = !removing;
            error = '';
          "
          >Удалить</BaseButton
        ><span v-if="saved" role="status" class="small text-secondary">Прайс обновлён</span>
      </div>
    </form>
    <div v-if="removing && service" class="mt-3 rounded-3 bg-light p-3">
      <p class="small">
        Удалить «{{ service.name }}» из прайса и новой записи? История существующих визитов
        сохранится.
      </p>
      <template v-if="photoCount"
        ><p class="mt-2 small text-body-secondary">
          Связанных фото: {{ photoCount }}. Их нужно перенести к другой процедуре.
        </p>
        <label
          :for="`move-photos-${service.id}`"
          class="form-label mt-4 mb-2 d-block small fw-semibold"
          >Перенести фото к процедуре</label
        ><select :id="`move-photos-${service.id}`" v-model="photoDestination" class="form-select">
          <option value="" disabled>Выберите процедуру</option>
          <option v-for="item in otherServices" :key="item.id" :value="item.id">
            {{ item.category }} · {{ item.name }}
          </option>
        </select>
        <p v-if="!otherServices.length" class="mt-3 small">
          Сначала добавьте другую процедуру или уберите эти фото через «Фото работ».
        </p></template
      >
      <div class="mt-3 d-flex flex-wrap gap-2">
        <BaseButton
          variant="danger"
          :disabled="photoCount > 0 && !photoDestination"
          :aria-label="`Подтвердить удаление процедуры: ${service.name}`"
          @click="remove"
          >Удалить из прайса</BaseButton
        ><BaseButton variant="text" @click="removing = false">Оставить</BaseButton>
      </div>
    </div>
    <p v-if="error" class="alert alert-warning mt-3 small" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type Service, usePractice } from '../../../entities/practice/index.ts';

import { BaseButton } from '../../../shared/ui/index.ts';
const props = defineProps<{ service?: Service }>();
const emit = defineEmits<{ added: [] }>();
const { categories, services, photos, addService, editService, removeService } = usePractice();
const fieldId = computed(() => props.service?.id ?? 'new');
const name = ref(props.service?.name ?? '');
const description = ref(props.service?.description ?? '');
const details = ref({ forWhom: '', includes: '', preparation: '', ...props.service?.details });
const detailFields = [
  { key: 'forWhom', label: 'Когда выбрать' },
  { key: 'includes', label: 'Что входит' },
  { key: 'preparation', label: 'Перед визитом' },
] as const;
const categoryId = ref<number | ''>(props.service?.categoryId ?? categories.value[0]?.id ?? '');
const price = ref<number | string>(props.service?.price ?? '');
const duration = ref<number | string>(props.service?.duration ?? 60);
const error = ref('');
const saved = ref(false);
const removing = ref(false);
const photoDestination = ref<number | ''>('');
const photoCount = computed(
  () => photos.value.filter((item) => item.serviceId === props.service?.id).length,
);
const otherServices = computed(() =>
  services.value.filter((item) => item.id !== props.service?.id),
);
watch(
  () => props.service?.categoryId,
  (value) => {
    if (value !== undefined) categoryId.value = value;
  },
);
watch(categories, (list) => {
  if (!list.some((item) => item.id === categoryId.value)) categoryId.value = list[0]?.id ?? '';
});
function save() {
  error.value = '';
  saved.value = false;
  try {
    if (!String(price.value).trim() || !String(duration.value).trim())
      throw new Error('Заполните цену и длительность.');
    const draft = {
      name: name.value,
      description: description.value,
      details: { ...details.value },
      categoryId: Number(categoryId.value),
      price: Number(price.value),
      duration: Number(duration.value),
    };
    if (props.service) {
      editService(props.service.id, draft);
      saved.value = true;
    } else {
      addService(draft);
      emit('added');
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось сохранить.';
  }
}
function remove() {
  if (!props.service) return;
  error.value = '';
  try {
    removeService(props.service.id, photoDestination.value || undefined);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось удалить.';
  }
}
</script>
