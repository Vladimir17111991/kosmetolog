<template>
  <div class="services-page position-relative">
    <ScrollAtmosphere />
    <section id="home" class="hero" tabindex="-1" aria-labelledby="home-title">
      <div
        class="container hero__layout"
        :class="{ 'hero__layout--without-photo': !siteImages.hero }"
      >
        <div class="hero__heading">
          <h1 id="home-title" class="hero__title fw-normal">
            Косметолог Ольга<br /><em class="hero__accent">в Солигорске.</em>
          </h1>
        </div>
        <div v-if="siteImages.hero" class="hero__visual">
          <HeroVisual :image="siteImages.hero" />
        </div>
        <div class="hero__copy">
          <p class="hero__description">
            Уход, очищение и массаж лица. Начнём со знакомства с вашей кожей и вместе выберем
            подходящую процедуру.
          </p>
          <div id="hero-contact" class="hero__actions">
            <ContactLink class="btn btn-primary section-button hero__action"
              >Написать в Instagram <ActionArrow
            /></ContactLink>
            <p class="hero__hint">Подберём процедуру и удобное время в переписке.</p>
          </div>
          <SectionLink to="contacts" class="hero__address"
            >{{ practiceLocation.city }} · {{ practiceLocation.street }}
            <span aria-hidden="true">↗</span></SectionLink
          >
        </div>
      </div>
    </section>
    <div class="section-reveal"><PriceList /></div>
    <div class="section-reveal"><WorkGallery /></div>
    <div class="section-reveal"><StudioSection /></div>
    <div class="section-reveal"><FirstVisit /></div>
    <div class="section-reveal"><ContactSection /></div>
    <MobileContactBar />
  </div>
</template>

<script setup lang="ts">
import { PriceList } from '../../../widgets/price-list/index.ts';
import { WorkGallery } from '../../../widgets/work-gallery/index.ts';
import { ContactSection } from '../../../widgets/contacts/index.ts';
import { FirstVisit } from '../../../widgets/first-visit/index.ts';
import { StudioSection } from '../../../widgets/studio/index.ts';
import HeroVisual from './HeroVisual.vue';
import { ContactLink, MobileContactBar } from '../../../features/contact-specialist/index.ts';
import { SectionLink, ActionArrow } from '../../../shared/ui/index.ts';
import { practiceLocation } from '../../../entities/specialist/index.ts';
import { usePractice } from '../../../entities/practice/index.ts';
import ScrollAtmosphere from './ScrollAtmosphere.vue';
import { useReveal } from '../../../shared/lib/reveal/index.ts';
useReveal();
const { siteImages } = usePractice();
</script>

<style scoped>
.services-page {
  isolation: isolate;
}
.section-reveal {
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}
.section-reveal--pending {
  opacity: 0;
  transform: translateY(24px);
}
.hero {
  position: relative;
  overflow: clip;
  background: radial-gradient(ellipse at 85% 20%, #f4d9de60, transparent 65%);
}
.hero__layout {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  grid-template-areas: 'heading visual' 'copy visual';
  align-items: center;
  column-gap: 64px;
  padding-block: 52px 64px;
}
.hero__heading {
  grid-area: heading;
  align-self: end;
}
.hero__title {
  font-family: var(--display);
  font-size: clamp(44px, 4.5vw, 66px);
  line-height: 1.15;
  letter-spacing: -0.045em;
  margin: 0 0 24px;
}
.hero__accent {
  color: var(--accent);
}
.hero__visual {
  grid-area: visual;
  min-width: 0;
}
.hero__copy {
  grid-area: copy;
  align-self: start;
}
.hero__description {
  max-width: 470px;
  font-size: 17px;
  line-height: 1.8;
  color: var(--muted);
  margin: 0 0 24px;
}
.hero__action {
  min-height: 56px;
}
.hero__hint {
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
  margin: 12px 0 24px;
}
.hero__address {
  display: inline-block;
  font-size: 14px;
  color: var(--brand);
  text-underline-offset: 5px;
  text-decoration-color: #b18798;
  line-height: 1.6;
}
@media (max-width: 991.98px) {
  .hero__layout {
    column-gap: 32px;
  }
  .hero__title {
    font-size: clamp(30px, 4.4vw, 42px);
  }
  .hero__description {
    font-size: 16px;
  }
  .hero__action {
    font-size: 14px;
    gap: 10px;
    padding-left: 16px;
  }
}
@media (max-width: 767.98px) {
  .services-page {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
  .hero__layout {
    column-gap: 26px;
    padding-block: 32px 40px;
  }
}
@media (max-width: 575.98px) {
  .hero__layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'heading' 'visual' 'copy';
    gap: 20px;
    padding-block: 26px 32px;
  }
  .hero__title {
    font-size: clamp(31px, 9vw, 44px);
    margin: 0;
    line-height: 1.16;
  }
  .hero__description {
    font-size: 16px;
    line-height: 1.65;
    margin-bottom: 18px;
  }
  .hero__action {
    width: 100%;
  }
  .hero__hint {
    font-size: 12px;
    margin: 10px 0 16px;
  }
  .hero__address {
    font-size: 13px;
  }
}
.hero__layout--without-photo {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'heading' 'copy';
  max-width: 760px;
}
@media (prefers-reduced-motion: reduce) {
  .section-reveal--pending {
    opacity: 1;
    transform: none;
  }
}
</style>
