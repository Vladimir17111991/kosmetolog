<template>
  <section
    id="contacts"
    class="contact-section content-section"
    tabindex="-1"
    aria-labelledby="contacts-title"
  >
    <div class="container">
      <div class="row align-items-center gy-3">
        <div class="col-lg-6">
          <h2 id="contacts-title" class="contact-section__title">
            Давайте <em class="contact-section__accent">познакомимся.</em>
          </h2>
          <p class="contact-section__intro">
            Напишите, какой уход вас интересует. Ольга лично согласует с вами время.
          </p>
        </div>
        <div class="col-lg-5 offset-lg-1">
          <ContactLink class="btn section-button contact-section__instagram w-100"
            >Написать в Instagram <ActionArrow
          /></ContactLink>
          <p class="contact-section__handle">{{ instagram.handle }}</p>
          <p v-if="!instagram.href" class="contact-section__demo-note">
            Тестовый контакт · пока откроется пример обращения.
          </p>
        </div>
      </div>
      <LocationCard />
    </div>
  </section>
</template>

<script setup lang="ts">
import { instagram } from '../../../entities/specialist/index.ts';
import { ContactLink } from '../../../features/contact-specialist/index.ts';
import { ActionArrow } from '../../../shared/ui/index.ts';
import LocationCard from './LocationCard.vue';
</script>

<style scoped>
.contact-section {
  background:
    radial-gradient(ellipse at 0 100%, #95685766, transparent 60%),
    linear-gradient(125deg, #432d3d, #654157 70%, #4b334c);
  color: #fff5ef;
}
.contact-section__title {
  font-family: var(--display);
  font-size: clamp(34px, 3.7vw, 50px);
  line-height: 1.22;
  font-weight: 400;
  letter-spacing: -0.035em;
  margin-bottom: 16px;
}
.contact-section__accent {
  color: #f3c4b2;
}
.contact-section__intro {
  color: #f0dfe4;
  font-size: 16px;
  line-height: 1.75;
  max-width: 450px;
  margin-bottom: 0;
}
.contact-section__instagram {
  --bs-btn-color: #4b3042;
  --bs-btn-bg: #fff1e8;
  --bs-btn-border-color: #fff1e8;
  --bs-btn-hover-bg: #f5dace;
  --bs-btn-hover-color: #4b3042;
  --bs-btn-hover-border-color: #f5dace;
  --bs-btn-active-bg: #f1d0c3;
  --bs-btn-active-color: #4b3042;
  --action-arrow-bg: #84556b14;
  box-shadow:
    0 4px 0 #c49caa,
    0 12px 28px #28172530;
}
.contact-section__handle {
  font-size: 14px;
  text-align: center;
  margin: 12px 0 0;
  overflow-wrap: anywhere;
  color: #f6d8dd;
}
.contact-section__demo-note {
  font-size: 12px;
  text-align: center;
  color: #dcc1cc;
  margin: 6px 0 0;
  line-height: 1.6;
}
</style>
