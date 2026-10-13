<template>
  <section aria-labelledby="site-images-title">
    <h2 id="site-images-title" class="display-subtitle">Фотографии сайта</h2>
    <p class="text-secondary mt-3 mb-4">
      Главный портрет и фото кабинета. Можно выбрать вертикальный или горизонтальный снимок прямо из
      галереи телефона — он будет виден целиком.
    </p>
    <div class="row g-4 align-items-start">
      <div class="col-md-6">
        <SiteImageEditor
          slot-name="hero"
          title="Главное фото"
          description="Портрет Ольги на первом экране."
        />
      </div>
      <div class="col-md-6">
        <SiteImageEditor
          slot-name="studio"
          title="Фото кабинета"
          description="Интерьер в разделе «Место, где можно выдохнуть»."
        />
      </div>
    </div>
    <p class="small text-secondary mt-4">
      В текущем прототипе изменения сохраняются до обновления вкладки.
    </p>
  </section>
</template>

<script setup lang="ts">
import SiteImageEditor from './SiteImageEditor.vue';
</script>
