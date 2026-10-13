<template>
  <div class="location-card row g-0 overflow-hidden" aria-labelledby="location-title">
    <div class="col-lg-4 location-card__copy">
      <h3 id="location-title" class="location-card__title">Как нас найти</h3>
      <address class="location-card__address d-flex flex-column">
        <span class="location-card__city">{{ location.country }}, {{ location.city }}</span>
        <strong class="location-card__street fw-medium">{{ location.street }}</strong>
      </address>
      <p class="location-card__note">
        Приём по предварительной записи. Детали входа Ольга подскажет в Instagram.
      </p>
      <a
        :href="location.routeHref"
        target="_blank"
        rel="noopener noreferrer"
        class="btn location-card__route"
        >Построить маршрут <span class="location-card__arrow" aria-hidden="true">↗</span></a
      >
      <a
        :href="location.mapHref"
        target="_blank"
        rel="noopener noreferrer"
        class="location-card__map-link d-block"
        >Открыть в Яндекс Картах</a
      >
    </div>
    <div class="col-lg-8 location-card__map">
      <iframe
        class="location-card__iframe d-block w-100 h-100"
        :src="location.embedHref"
        title="Яндекс Карта: Солигорск, Кольцевая улица, 5"
        loading="lazy"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { practiceLocation as location } from '../../../entities/specialist/index.ts';
</script>

<style scoped>
.location-card {
  margin-top: 28px;
  border: 1px solid #ebc4d14a;
  border-radius: 24px;
  background: #fff6f00a;
}
.location-card__copy {
  padding: 28px;
}
.location-card__title {
  margin: 0 0 23px;
  font-family: var(--display);
  font-size: 30px;
}
.location-card__address {
  gap: 10px;
  margin: 0 0 18px;
  font-style: normal;
}
.location-card__city {
  color: #e4cfd2;
  font-size: 15px;
}
.location-card__street {
  font-size: 22px;
}
.location-card__note {
  color: #e4cfd2;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 24px;
}
.location-card__route {
  --bs-btn-color: #fff5ef;
  --bs-btn-border-color: #c19aa9;
  --bs-btn-hover-color: #432d3d;
  --bs-btn-hover-bg: #fff5ef;
  --bs-btn-hover-border-color: #fff5ef;
  --bs-btn-active-color: #432d3d;
  --bs-btn-active-bg: #f3dfdf;
  padding: 13px 20px;
}
.location-card__arrow {
  margin-left: 12px;
}
.location-card__map-link {
  width: fit-content;
  padding: 12px 0;
  margin-top: 6px;
  color: #f3c4b2;
  font-size: 14px;
  text-underline-offset: 4px;
}
.location-card__map-link:hover {
  color: #fff5ef;
}
.location-card__map {
  min-height: 300px;
  background: #ece6e6;
}
.location-card__iframe {
  min-height: 300px;
  border: 0;
}
@media (max-width: 767.98px) {
  .location-card__copy {
    padding: 26px 23px;
  }
  .location-card__map {
    min-height: 240px;
  }
  .location-card__iframe {
    min-height: 240px;
  }
}
</style>
