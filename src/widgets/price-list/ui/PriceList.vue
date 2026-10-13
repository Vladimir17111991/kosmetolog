<template>
  <section
    id="price-list"
    class="content-section price-list container"
    tabindex="-1"
    aria-labelledby="price-title"
  >
    <div class="section-heading row align-items-end gy-3">
      <div class="col-md-7">
        <h2 id="price-title" class="section-heading__title">
          Что нужно <em class="section-heading__accent">вашей коже?</em>
        </h2>
      </div>
      <div class="col-md-5">
        <p class="section-heading__intro">
          Процедуры и стоимость. Подробности помогут выбрать, с чего начать.
        </p>
      </div>
    </div>
    <div class="price-list__table">
      <p v-if="!services.length" class="price-list__empty">
        Ольга обновляет прайс. Процедуры появятся здесь позже.
      </p>
      <TransitionGroup name="list" tag="div" class="d-grid gap-3">
        <article
          v-for="(service, index) in services"
          :key="service.id"
          class="price-list__row row g-0 align-items-center"
        >
          <div class="col-auto price-list__number display-number" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </div>
          <div class="col price-list__info">
            <p class="price-list__meta d-flex align-items-center flex-wrap">
              <span class="price-list__category fw-semibold">{{ service.category }}</span>
              <span class="price-list__duration">{{ service.duration }} мин</span>
            </p>
            <h3 class="price-list__service-title fw-normal m-0">{{ service.name }}</h3>
            <p class="price-list__description">{{ service.description }}</p>
            <details
              v-if="service.details && Object.values(service.details).some(Boolean)"
              class="price-list__details"
            >
              <summary class="price-list__details-toggle">
                Что входит и как подготовиться
                <span class="price-list__details-icon" aria-hidden="true">＋</span>
              </summary>
              <dl class="price-list__detail-list mb-0">
                <template v-for="field in detailFields" :key="field.key">
                  <dt v-if="service.details[field.key]" class="price-list__detail-label">
                    {{ field.label }}
                  </dt>
                  <dd v-if="service.details[field.key]" class="price-list__detail-text">
                    {{ service.details[field.key] }}
                  </dd>
                </template>
              </dl>
            </details>
          </div>
          <div class="col-auto price-list__value fw-semibold text-nowrap">
            {{ money(service.price) }}
          </div>
          <div class="col-auto">
            <ContactLink
              :service-name="service.name"
              class="btn btn-primary section-button price-list__contact text-nowrap"
              :aria-label="`Узнать свободное время: ${service.name}`"
            >
              Узнать время
              <ActionArrow />
            </ContactLink>
          </div>
        </article>
      </TransitionGroup>
    </div>
    <div class="price-list__footnote d-flex flex-wrap justify-content-between gap-2">
      <p class="price-list__footnote-text m-0">
        Не знаете, с чего начать?
        <ContactLink class="price-list__link p-0">Обсудите это с Ольгой.</ContactLink>
      </p>
      <p class="price-list__footnote-text m-0">Цены и описания — пример для согласования · BYN</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePractice } from '../../../entities/practice/index.ts';
import { money } from '../../../shared/lib/format/index.ts';
import { ContactLink } from '../../../features/contact-specialist/index.ts';
import { ActionArrow } from '../../../shared/ui/index.ts';
const { services } = usePractice();
const detailFields = [
  { key: 'forWhom', label: 'Когда выбрать' },
  { key: 'includes', label: 'Что входит' },
  { key: 'preparation', label: 'Перед визитом' },
] as const;
</script>

<style scoped>
.price-list__details {
  margin-top: 12px;
}
.price-list__details-toggle {
  color: var(--brand);
  font-size: 14px;
  min-height: 44px;
  align-items: center;
  line-height: 1.6;
  padding: 6px 0;
  cursor: pointer;
  list-style: none;
  display: flex;
  gap: 8px;
}
.price-list__details-toggle::-webkit-details-marker {
  display: none;
}
.price-list__details-icon {
  flex-shrink: 0;
  transition: transform 180ms ease;
}
.price-list__details[open] .price-list__details-icon {
  transform: rotate(45deg);
}
.price-list__detail-list {
  padding: 8px 0;
}
.price-list__detail-label {
  font-size: 14px;
  margin: 12px 0 4px;
  font-weight: 600;
}
.price-list__detail-text {
  font-size: 14px;
  line-height: 1.75;
  color: var(--muted);
  margin-bottom: 0;
}
.list-enter-active {
  transition: opacity 0.18s ease;
}
.list-leave-active {
  transition: opacity 0.18s ease;
  position: absolute;
  visibility: hidden;
}
.list-enter-from {
  opacity: 0;
}
.list-leave-to {
  opacity: 0;
}
.price-list__row {
  padding: 23px;
  border: 1px solid #fff9f2b3;
  border-radius: 24px;
  background: linear-gradient(115deg, #fffaf5b3, #f9eef5a6);
  box-shadow:
    0 8px 24px -16px #71445938,
    inset 0 1px 0 #ffffff70;
}
.price-list__number {
  color: #70415a;
  font-size: 48px;
  line-height: 1;
  width: 80px;
}
.price-list__info {
  padding-right: 28px;
  min-width: 0;
}
.price-list__meta {
  gap: 10px;
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
}
.price-list__category {
  padding: 5px 10px;
  border-radius: 7px;
  color: #613e52;
  background: #e7ccda99;
  overflow-wrap: anywhere;
}
.price-list__duration {
  color: var(--muted);
}
.price-list__service-title {
  font-family: var(--display);
  font-size: 29px;
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
}
.price-list__description {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.8;
  margin: 10px 0 0;
  max-width: 670px;
  overflow-wrap: anywhere;
}
.price-list__value {
  font-size: 20px;
  margin-right: 24px;
}
.price-list__footnote {
  margin-top: 25px;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.8;
}
.price-list__link {
  border: 0;
  background: transparent;
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.price-list__empty {
  padding: 40px 0;
  font-size: 16px;
  color: var(--muted);
}
@media (max-width: 991.98px) {
  .price-list__number {
    width: 74px;
    font-size: 40px;
  }
}
@media (max-width: 767.98px) {
  .price-list__row {
    padding: 20px 18px;
    border-radius: 20px;
    gap: 14px 12px;
  }
  .price-list__number {
    display: none;
  }
  .price-list__info {
    flex: 0 0 100%;
    padding-right: 0;
  }
  .price-list__service-title {
    font-size: 27px;
  }
  .price-list__description {
    font-size: 15px;
  }
  .price-list__value {
    margin-right: auto;
    font-size: 20px;
  }
  .price-list__contact {
    min-height: 50px;
    padding: 8px 10px 8px 14px;
    gap: 10px;
    font-size: 14px;
  }
  .price-list__footnote {
    font-size: 14px;
  }
}
</style>
