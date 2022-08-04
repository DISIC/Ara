<script setup lang="ts">
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";
defineProps<{
  page: string;
}>();
</script>

<template>
  <h3>1 Images</h3>
  <AuditGenerationCriterium v-for="i in 4" :key="i" />
  <h3>2 Cadres</h3>
  <AuditGenerationCriterium v-for="i in 2" :key="i" />
  <h3>3 Couleurs</h3>
  <AuditGenerationCriterium v-for="i in 8" :key="i" />
</template>
