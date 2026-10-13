<template>
  <Transition name="mobile-contact">
    <div v-if="visible" class="mobile-contact" aria-label="Быстрая связь">
      <div class="container d-flex align-items-center gap-2">
        <ContactLink class="btn btn-primary section-button flex-grow-1 mobile-contact__button">
          Написать в Instagram <ActionArrow />
        </ContactLink>
        <button
          class="mobile-contact__top flex-shrink-0"
          type="button"
          aria-label="Наверх страницы"
          @click="goToTop"
        >
          ↑
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ActionArrow } from '../../../shared/ui/index.ts';
import ContactLink from './ContactLink.vue';
const visible = ref(false);
let frame = 0;
function update() {
  frame = 0;
  const anchor = document.getElementById('hero-contact');
  visible.value = !!anchor && anchor.getBoundingClientRect().bottom < 82;
}
function queueUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}
function goToTop() {
  document.getElementById('home')?.focus({ preventScroll: true });
  window.scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}
onMounted(() => {
  update();
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
});
onUnmounted(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('scroll', queueUpdate);
  window.removeEventListener('resize', queueUpdate);
});
</script>

<style scoped>
.mobile-contact {
  display: none;
}
@media (max-width: 767.98px) {
  .mobile-contact {
    display: block;
    position: fixed;
    inset: auto 0 0;
    z-index: 1020;
    padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
    border-top: 1px solid #fff8f2;
    background: #fff7f2ed;
    backdrop-filter: blur(18px);
    box-shadow: 0 -6px 30px #51344616;
  }
  .mobile-contact__button {
    min-height: 50px;
    gap: 10px;
    font-size: 14px;
    padding: 7px 12px;
  }
  .mobile-contact__top {
    width: 44px;
    height: 48px;
    border: 1px solid #dac0cc;
    border-radius: 16px;
    color: var(--brand);
    background: #fcf1ed;
    font-size: 24px;
  }
  .mobile-contact-enter-active,
  .mobile-contact-leave-active {
    transition:
      opacity 0.22s,
      transform 0.22s;
  }
  .mobile-contact-enter-from,
  .mobile-contact-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
