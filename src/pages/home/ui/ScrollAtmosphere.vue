<template>
  <div ref="background" class="scroll-atmosphere overflow-hidden" aria-hidden="true">
    <span
      v-for="(palette, index) in palettes"
      :key="palette"
      class="scroll-atmosphere__layer position-absolute"
      :class="`scroll-atmosphere__layer--${palette}`"
      :style="{ opacity: Math.min(1, Math.max(0, phase - index + 1)) }"
    ></span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const background = ref<HTMLElement | null>(null);
const phase = ref(0);
const palettes = ['peach', 'rose', 'lilac', 'plum'];
let frame = 0;
let resizeObserver: ResizeObserver | undefined;
let motion: MediaQueryList | undefined;
let stops: number[] = [];

function update() {
  frame = 0;
  if (motion?.matches || stops.length < 2) {
    phase.value = 0;
    return;
  }
  const position = window.scrollY;
  let next = stops.findIndex((stop) => stop > position);
  if (next < 0) next = stops.length - 1;
  if (next === 0) {
    phase.value = 0;
    return;
  }
  const start = stops[next - 1] ?? 0;
  const end = stops[next] ?? start;
  const progress = Math.min(1, Math.max(0, (position - start) / Math.max(1, end - start)));
  phase.value = next - 1 + progress;
}
function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(update);
}
function measure() {
  const parent = background.value?.parentElement;
  stops = ['home', 'price-list', 'work-gallery', 'contacts'].map((id, index) => {
    const section = parent?.querySelector<HTMLElement>(`#${id}`);
    return index === 0
      ? 0
      : Math.max(0, (section?.getBoundingClientRect().top ?? 0) + window.scrollY - 120);
  });
  scheduleUpdate();
}
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  motion.addEventListener('change', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', measure);
  if (background.value?.parentElement) {
    resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(background.value.parentElement);
  }
  measure();
});
onUnmounted(() => {
  window.cancelAnimationFrame(frame);
  window.removeEventListener('scroll', scheduleUpdate);
  window.removeEventListener('resize', measure);
  motion?.removeEventListener('change', scheduleUpdate);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.scroll-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: #fffaf6;
}
.scroll-atmosphere__layer {
  inset: 0;
  will-change: opacity;
}
.scroll-atmosphere__layer--peach {
  background:
    radial-gradient(ellipse at 90% 10%, #d9abc8 0%, transparent 70%),
    radial-gradient(ellipse at 0% 95%, #ecaf87 0%, transparent 70%), #fff3e7;
}
.scroll-atmosphere__layer--rose {
  background:
    radial-gradient(ellipse at 12% 25%, #dda2b3 0%, transparent 73%),
    radial-gradient(ellipse at 95% 85%, #eebb99 0%, transparent 70%), #fff0e7;
}
.scroll-atmosphere__layer--lilac {
  background:
    radial-gradient(ellipse at 90% 15%, #bca0d1 0%, transparent 76%),
    radial-gradient(ellipse at 0% 85%, #e7b59f 0%, transparent 73%), #f3e2ed;
}
.scroll-atmosphere__layer--plum {
  background:
    radial-gradient(ellipse at 10% 15%, #c98da9 0%, transparent 75%),
    radial-gradient(ellipse at 100% 85%, #b3a1d0 0%, transparent 72%), #efdae3;
}
</style>
