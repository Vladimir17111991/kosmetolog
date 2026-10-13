<template>
  <figure class="hero-visual position-relative">
    <img
      class="hero-visual__image d-block w-100"
      :src="image.url"
      :alt="
        image.isDemo ? 'Тестовый AI-портрет: здесь будет настоящее фото Ольги' : 'Косметолог Ольга'
      "
      :width="image.width"
      :height="image.height"
      fetchpriority="high"
      decoding="async"
    />
    <figcaption v-if="image.isDemo" class="hero-visual__label">Фото для примера</figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { SiteImage } from '../../../entities/practice/index.ts';
defineProps<{ image: SiteImage }>();
</script>

<style scoped>
.hero-visual {
  width: min(100%, 460px);
  margin: 0 auto 14px;
  isolation: isolate;
}
.hero-visual::before {
  content: '';
  position: absolute;
  inset: 12px -3px -12px 5px;
  z-index: -1;
  border: 1px solid #fff2ee9c;
  border-radius: 28px;
  transform: rotate(3deg);
  background: linear-gradient(140deg, #d29da9, #a17a99 65%, #815c78);
  box-shadow: 0 20px 35px -22px #62405280;
}
.hero-visual__image {
  height: auto;
  image-orientation: from-image;
  border: 5px solid #fff9f3;
  border-radius: 28px;
  background: #dfc5c6;
  box-shadow: 0 18px 36px -24px #70425a85;
}
.hero-visual__label {
  position: absolute;
  bottom: 14px;
  left: 14px;
  font-size: 11px;
  color: #654a58;
  background: #fffaf3e8;
  padding: 6px 10px;
  border-radius: 20px;
}
@media (max-width: 991.98px) {
  .hero-visual__image {
    border-width: 3px;
    border-radius: 22px;
  }
  .hero-visual::before {
    border-radius: 22px;
  }
}
@media (max-width: 575.98px) {
  .hero-visual {
    width: min(100%, 300px);
  }
}
</style>
