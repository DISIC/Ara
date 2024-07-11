<script setup lang="ts">
defineProps<{
  target?: string;
}>();
</script>

<template>
  <a
    class="top-link fr-link fr-icon-arrow-up-fill fr-link--icon-left"
    :href="`#${target ?? 'header'}`"
  >
    Haut de page
  </a>
</template>

<style scoped>
.top-link {
  display: inline-block;
  margin-top: 2.5rem;
}
</style>
