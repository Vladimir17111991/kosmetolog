<template>
  <section class="studio content-section" aria-labelledby="studio-title">
    <div class="container">
      <div class="row align-items-center gy-4 gx-lg-5">
        <div v-if="siteImages.studio" class="col-lg-6">
          <figure class="studio__photo m-0 position-relative">
            <img
              :src="siteImages.studio.url"
              class="studio__image w-100 d-block"
              :width="siteImages.studio.width"
              :height="siteImages.studio.height"
              :alt="
                siteImages.studio.isDemo
                  ? 'Тестовая AI-визуализация светлого косметологического кабинета'
                  : 'Кабинет косметолога Ольги'
              "
              loading="lazy"
              decoding="async"
            />
            <figcaption v-if="siteImages.studio.isDemo" class="studio__badge">
              Пример интерьера · AI
            </figcaption>
          </figure>
        </div>
        <div :class="siteImages.studio ? 'col-lg-6' : 'col-lg-8'">
          <h2 id="studio-title" class="section-heading__title mb-3">
            Место, где можно<br /><em class="section-heading__accent">выдохнуть.</em>
          </h2>
          <p class="studio__text">
            Спокойное знакомство, внимание к вашим пожеланиям и понятные этапы ухода. Обсудим
            ощущения, ответим на вопросы и подберём комфортный темп.
          </p>
          <p v-if="siteImages.studio?.isDemo" class="studio__note">
            Сейчас здесь пример оформления. Фотографии своего кабинета Ольга добавит позже.
          </p>
          <SectionLink to="contacts" class="studio__link"
            >{{ practiceLocation.street }} · Как добраться
            <span aria-hidden="true">↗</span></SectionLink
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SectionLink } from '../../../shared/ui/index.ts';
import { practiceLocation } from '../../../entities/specialist/index.ts';
import { usePractice } from '../../../entities/practice/index.ts';
const { siteImages } = usePractice();
</script>

<style scoped>
.studio {
  background: #fff8f448;
}
.studio__photo {
  overflow: hidden;
  border-radius: 24px;
  border: 5px solid #fff8f2;
  box-shadow: var(--shadow-soft);
}
.studio__image {
  height: auto;
  image-orientation: from-image;
}
.studio__badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 5px 10px;
  background: #fffaf4ed;
  border-radius: 20px;
  font-size: 11px;
  color: #644452;
}
.studio__text {
  font-size: 16px;
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 12px;
}
.studio__note {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 20px;
}
.studio__link {
  color: var(--brand);
  font-size: 14px;
  text-underline-offset: 5px;
  line-height: 1.7;
}
</style>
