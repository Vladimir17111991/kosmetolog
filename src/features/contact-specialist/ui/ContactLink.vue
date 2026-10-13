<template>
  <a v-if="instagram.href" :href="instagram.href" target="_blank" rel="noopener noreferrer"
    ><slot
  /></a>
  <button v-else type="button" @click="open(serviceName)"><slot /></button>
</template>

<script setup lang="ts">
import { instagram } from '../../../entities/specialist/index.ts';
import { useContactRequest } from '../model/useContactRequest.ts';
defineProps<{ serviceName?: string }>();
const open = useContactRequest();
</script>
