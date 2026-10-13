<template>
  <section
    id="work-gallery"
    ref="gallery"
    class="work-gallery content-section"
    tabindex="-1"
    aria-labelledby="works-title"
  >
    <div class="container">
      <div class="section-heading row align-items-end gy-3">
        <div class="col-12">
          <h2 id="works-title" class="section-heading__title">
            До <em class="section-heading__accent">и после.</em>
          </h2>
        </div>
      </div>
      <div class="work-gallery__layout d-grid align-items-start">
        <GalleryFilters
          :model-value="category"
          :categories="categories"
          @update:model-value="changeCategory"
        />
        <div
          ref="content"
          class="work-gallery__content"
          :style="{ minHeight: heldHeight === undefined ? undefined : `${heldHeight}px` }"
        >
          <Transition name="work-gallery__results" mode="out-in" @after-enter="finishTransition">
            <div :key="category" class="work-gallery__results" :data-category="category">
              <div v-if="works.length" id="gallery-photo-grid" class="row g-4">
                <figure
                  v-for="photo in visibleWorks"
                  :key="photo.id"
                  class="col-md-6 mb-0 work-gallery__photo"
                  tabindex="-1"
                >
                  <div class="work-card h-100 overflow-hidden">
                    <button
                      type="button"
                      class="work-card__preview d-block w-100"
                      :aria-label="`Рассмотреть: ${photo.title}`"
                      @click="selectedId = photo.id"
                    >
                      <PhotoPair
                        :src="photo.url"
                        :before-src="photo.beforeUrl"
                        :title="photo.title"
                        :demo-diptych="photo.demoDiptych"
                      />
                      <span class="work-card__zoom"
                        >Рассмотреть <span aria-hidden="true">↗</span></span
                      >
                    </button>
                    <figcaption class="work-card__caption">
                      <p class="work-card__category">
                        {{ photo.service?.category }} · {{ photo.service?.name }}
                      </p>
                      <h3 class="work-card__title fw-normal">{{ photo.title }}</h3>
                      <p v-if="photo.comparisonNote" class="work-card__note">
                        {{ photo.comparisonNote }}
                      </p>
                      <p v-if="photo.isDemo" class="work-card__demo-label mb-0">
                        {{
                          photo.demoDiptych ? 'AI-пример · не результат процедуры' : 'Пример фото'
                        }}
                      </p>
                    </figcaption>
                  </div>
                </figure>
              </div>
              <div v-if="hasMore" class="work-gallery__more justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary work-gallery__more-button"
                  aria-controls="gallery-photo-grid"
                  @click="showMore"
                >
                  Посмотреть ещё
                  <span class="work-gallery__more-icon d-inline-block" aria-hidden="true">↓</span>
                </button>
              </div>
              <p v-if="works.some((photo) => photo.isDemo)" class="work-gallery__credits">
                Примеры оформления: AI-сравнения и фотографии
                <a
                  class="work-gallery__credit-link"
                  href="https://www.pexels.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Pexels</a
                >. В готовой галерее здесь будут работы Ольги.
              </p>
              <div
                v-if="!works.length"
                class="gallery-empty row g-0 align-items-center overflow-hidden"
              >
                <div
                  class="col-md-5 gallery-empty__art d-flex flex-column justify-content-center align-items-center overflow-hidden"
                  aria-hidden="true"
                >
                  <div class="gallery-empty__orbit position-absolute"></div>
                  <span class="gallery-empty__monogram fst-italic position-relative">О.</span
                  ><small class="gallery-empty__label position-relative text-center"
                    >ЗАБОТА В КАЖДОМ ПРИКОСНОВЕНИИ</small
                  >
                </div>
                <div class="col-md-7 gallery-empty__copy">
                  <p class="section-heading__kicker gallery-empty__kicker">
                    {{ category === 0 ? 'ГАЛЕРЕЯ ГОТОВИТСЯ' : categoryName }}
                  </p>
                  <h3 class="gallery-empty__title fw-normal">
                    Настоящие работы.<br /><em class="gallery-empty__accent fw-normal"
                      >Именно Ольги.</em
                    >
                  </h3>
                  <p class="gallery-empty__text">
                    {{
                      category === 0
                        ? 'Здесь появятся фотографии процедур, которые Ольга добавит в своё портфолио.'
                        : 'В этой категории пока нет фотографий. Они появятся, когда Ольга добавит свои работы.'
                    }}
                  </p>
                  <span class="gallery-empty__soon d-inline-block">Первые фотографии — скоро</span>
                </div>
              </div>
            </div>
          </Transition>
          <p class="visually-hidden" role="status">{{ announcement }}</p>
        </div>
      </div>
    </div>
    <MediaDialog
      :open="!!selectedPhoto"
      :title="selectedPhoto?.title ?? 'Просмотр фото'"
      @close="selectedId = null"
    >
      <template v-if="selectedPhoto">
        <PhotoPair
          :src="selectedPhoto.url"
          :before-src="selectedPhoto.beforeUrl"
          :title="selectedPhoto.title"
          :demo-diptych="selectedPhoto.demoDiptych"
          expanded
        />
        <p v-if="selectedPhoto.comparisonNote" class="mt-3 mb-0">
          {{ selectedPhoto.comparisonNote }}
        </p>
        <p v-if="selectedPhoto.isDemo" class="work-card__note mt-3 mb-0">
          {{
            selectedPhoto.demoDiptych
              ? 'Вымышленные изображения, созданные с помощью AI для проверки оформления. Это не реальные клиенты и не результат процедуры.'
              : 'Тестовая фотография для примера оформления. Ольга заменит её своей работой.'
          }}
        </p>
      </template>
    </MediaDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useCategoryFilter } from '../model/useCategoryFilter.ts';
import { usePractice } from '../../../entities/practice/index.ts';
import GalleryFilters from './GalleryFilters.vue';
import { scrollToElement } from '../../../shared/lib/scroll/index.ts';
import { MediaDialog, PhotoPair } from '../../../shared/ui/index.ts';
const { services, photos } = usePractice();
const { category, categories, categoryName } = useCategoryFilter();
const gallery = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const heldHeight = ref<number>();
const pageSize = 2;
const visibleCount = ref(pageSize);
const announcement = ref('');
const selectedId = ref<string | null>(null);
let scrollController: AbortController | undefined;
let scrolling = false;
let transitioning = false;

function releaseHeight() {
  if (!scrolling && !transitioning) heldHeight.value = undefined;
}
async function returnToGallery() {
  scrollController?.abort();
  const controller = new AbortController();
  scrollController = controller;
  scrolling = true;
  await nextTick();
  if (gallery.value) await scrollToElement(gallery.value, controller.signal);
  if (controller !== scrollController) return;
  scrolling = false;
  releaseHeight();
}
function changeCategory(id: number) {
  if (id === category.value) void returnToGallery();
  else category.value = id;
}
watch(
  category,
  () => {
    // Keep the page tall enough for an uninterrupted return from the bottom of a long category.
    heldHeight.value = content.value?.getBoundingClientRect().height;
    visibleCount.value = pageSize;
    selectedId.value = null;
    announcement.value = '';
    transitioning = true;
    void returnToGallery();
  },
  { flush: 'sync' },
);
function finishTransition(element: Element) {
  if (element.getAttribute('data-category') !== String(category.value)) return;
  transitioning = false;
  releaseHeight();
}
onUnmounted(() => scrollController?.abort());
const works = computed(() =>
  photos.value
    .map((photo) => ({
      ...photo,
      service: services.value.find((item) => item.id === photo.serviceId),
    }))
    .filter((photo) => category.value === 0 || photo.service?.categoryId === category.value),
);
const visibleWorks = computed(() => works.value.slice(0, visibleCount.value));
const selectedPhoto = computed(() => works.value.find((photo) => photo.id === selectedId.value));
const hasMore = computed(() => visibleCount.value < works.value.length);
async function showMore() {
  const firstNewIndex = visibleWorks.value.length;
  visibleCount.value += pageSize;
  await nextTick();
  content.value
    ?.querySelectorAll<HTMLElement>('.work-gallery__photo')
    [firstNewIndex]?.focus({ preventScroll: true });
  announcement.value = 'Добавлены новые фотографии.';
}
</script>

<style scoped>
.gallery-empty__accent {
  color: var(--accent);
}
.work-card__category {
  color: var(--accent);
  font-size: 14px;
  letter-spacing: 0.035em;
  margin: 0 0 10px;
  line-height: 1.6;
}
.work-gallery {
  background:
    radial-gradient(ellipse at 100% 0%, #efdeed30, transparent 60%),
    linear-gradient(120deg, #faf0e840, #f4e9e920);
  border-top: 1px solid #eadcda70;
}
.gallery-empty {
  background: #fffbf6b3;
  border: 1px solid #fff8f4;
  border-radius: 25px;
  box-shadow: 0 20px 60px -35px #8b5d7859;
}
.gallery-empty__art {
  position: relative;
  min-height: 375px;
  background:
    radial-gradient(ellipse at 20% 5%, #eec3a9, transparent 65%),
    linear-gradient(140deg, #c89097, #8e6986 80%);
}
.gallery-empty__art::after {
  content: '';
  position: absolute;
  inset: 14px;
  border: 1px solid #ffede442;
  border-radius: 50% 50% 12px 12px;
}
.gallery-empty__monogram {
  font-family: var(--display);
  font-size: 120px;
  color: #fff4e7;
  text-shadow: 0 10px 40px #71465c30;
}
.gallery-empty__label {
  font-size: 10px;
  letter-spacing: 0.12em;
  margin-top: 14px;
  color: #fff4e7;
  padding: 0 20px;
}
.gallery-empty__orbit {
  width: 290px;
  height: 370px;
  border: 1px solid #fff2d980;
  border-radius: 50%;
  transform: rotate(-35deg);
}
.gallery-empty__orbit::after {
  content: '';
  position: absolute;
  inset: 28px -32px;
  border: 1px solid #fff2d950;
  border-radius: 50%;
  transform: rotate(45deg);
}
.gallery-empty__copy {
  padding: 48px 55px;
}
.gallery-empty__kicker {
  margin-bottom: 16px;
}
.gallery-empty__title {
  font-family: var(--display);
  font-size: 39px;
  line-height: 1.3;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}
.gallery-empty__text {
  font-size: 16px;
  line-height: 1.85;
  color: var(--muted);
  max-width: 440px;
}
.gallery-empty__soon {
  font-size: 12px;
  margin-top: 8px;
  padding: 9px 15px;
  border: 1px solid #dfc6cb;
  border-radius: 100px;
  color: #865d6b;
}
.work-card {
  background: var(--surface-raised);
  border: 1px solid #ffffffa0;
  border-radius: 20px;
  box-shadow:
    var(--shadow-soft),
    inset 0 -3px 0 #e8d0d05c;
  transition:
    box-shadow 0.3s,
    transform 0.3s;
  padding: 8px;
}
.work-card:hover {
  box-shadow:
    var(--shadow-raised),
    inset 0 -3px 0 #e8d0d05c;
  transform: translateY(-5px);
}
.work-card__preview {
  border: 0;
  padding: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--brand);
  cursor: zoom-in;
}
.work-card__zoom {
  display: flex;
  justify-content: space-between;
  padding: 12px 10px 2px;
  font-size: 14px;
}
.work-card__demo-label {
  color: #624251;
  font-size: 12px;
}
.work-card__note {
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}
.work-gallery__credits {
  margin: 24px 0 0;
  font-size: 14px;
  line-height: 1.6;
  max-width: 600px;
  color: #604257;
}
.work-gallery__credit-link {
  color: inherit;
  text-underline-offset: 3px;
}
.work-card__caption {
  padding: 18px 12px 14px;
}
.work-card__title {
  font-family: var(--display);
  overflow-wrap: anywhere;
  font-size: 27px;
}
.work-gallery__layout {
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 40px;
}
@media (max-width: 1199.98px) {
  .work-gallery__layout {
    grid-template-columns: 205px minmax(0, 1fr);
    gap: 28px;
  }
  .work-card__title {
    font-size: 24px;
  }
}
@media (max-width: 991.98px) {
  .gallery-empty__copy {
    padding: 32px;
  }
  .gallery-empty__title {
    font-size: 33px;
  }
  .work-gallery__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
}
@media (max-width: 767.98px) {
  .work-card__category {
    font-size: 14px;
  }
  .gallery-empty__art {
    min-height: 250px;
  }
  .gallery-empty__monogram {
    font-size: 96px;
  }
  .gallery-empty__label {
    margin-top: 0;
  }
  .gallery-empty__copy {
    padding: 28px 23px;
  }
  .gallery-empty__title {
    font-size: 31px;
  }
  .gallery-empty__text {
    font-size: 15px;
  }
}
.work-gallery__content {
  min-width: 0;
  overflow-anchor: none;
}
.work-gallery__photo {
  animation: gallery-photo-appear 340ms ease both;
}
.work-gallery__photo:focus {
  outline: none;
}
.work-gallery__more {
  display: flex;
  margin-top: 30px;
}
.work-gallery__more-button {
  min-width: 220px;
  background-color: #fffaf680;
}
.work-gallery__more-button:hover {
  background-color: var(--brand);
}
.work-gallery__more-icon {
  margin-left: 16px;
  transition: transform 300ms ease;
}
.work-gallery__more-button:hover .work-gallery__more-icon {
  transform: translateY(3px);
}
@keyframes gallery-photo-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.work-gallery__results-enter-active {
  transition:
    opacity 280ms ease,
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.work-gallery__results-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.work-gallery__results-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.work-gallery__results-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
