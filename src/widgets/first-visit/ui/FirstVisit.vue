<template>
  <section class="first-visit content-section container" aria-labelledby="first-visit-title">
    <div class="row gy-4 gx-lg-5">
      <div class="col-lg-5">
        <h2 id="first-visit-title" class="section-heading__title mb-3">
          Первый раз<br /><em class="section-heading__accent">у косметолога?</em>
        </h2>
        <p class="first-visit__intro">
          Не нужно заранее разбираться во всех процедурах. Начните с вопроса — остальное обсудим
          вместе.
        </p>
        <ContactLink class="first-visit__link"
          >Задать вопрос в Instagram <span aria-hidden="true">↗</span></ContactLink
        >
      </div>
      <div class="col-lg-7">
        <details v-for="item in questions" :key="item.question" class="first-visit__item">
          <summary class="first-visit__question">
            {{ item.question }}<span class="first-visit__plus" aria-hidden="true">＋</span>
          </summary>
          <p class="first-visit__answer">{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ContactLink } from '../../../features/contact-specialist/index.ts';
const questions = [
  {
    question: 'Как выбрать процедуру?',
    answer:
      'Расскажите, что вас беспокоит и каким уходом пользуетесь. На первой встрече обсудим ваши пожелания, состояние кожи и возможные ограничения. Процедуру и её стоимость согласуем до начала.',
  },
  {
    question: 'Можно прийти только на консультацию?',
    answer:
      'Да. Можно начать со знакомства и обсуждения домашнего ухода, без процедуры в тот же день. Стоимость консультации указана в прайсе; условия её оплаты вместе с процедурой уточните в переписке.',
  },
  {
    question: 'Как подготовиться к первому визиту?',
    answer:
      'Подготовьте названия или фотографии средств, которыми пользуетесь. Сообщите о чувствительности кожи, аллергиях и недавних процедурах. Индивидуальные рекомендации по подготовке Ольга уточнит при записи.',
  },
  {
    question: 'Как записаться или перенести визит?',
    answer:
      'Напишите Ольге в Instagram и предложите удобные дни. Запись считается согласованной после личного подтверждения времени. Если планы изменятся, сообщите об этом в той же переписке заранее.',
  },
];
</script>

<style scoped>
.first-visit__intro {
  color: var(--muted);
  line-height: 1.8;
  font-size: 16px;
  max-width: 380px;
}
.first-visit__link {
  color: var(--brand);
  background: none;
  border: 0;
  padding: 10px 0;
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 5px;
}
.first-visit__item {
  border-bottom: 1px solid #b78d9d55;
}
.first-visit__item:first-child {
  border-top: 1px solid #b78d9d55;
}
.first-visit__question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  padding: 20px 0;
  list-style: none;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
}
.first-visit__question::-webkit-details-marker {
  display: none;
}
.first-visit__plus {
  color: var(--accent);
  font-size: 23px;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.first-visit__item[open] .first-visit__plus {
  transform: rotate(45deg);
}
.first-visit__answer {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.85;
  color: var(--muted);
}
</style>
