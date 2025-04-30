<script setup lang="ts">
defineProps<{
  target?: string;
}>();
</script>

<template>
  <RouterLink
    :to="`#${target ?? 'header'}`"
    class="top-link fr-link fr-icon-arrow-up-fill fr-link--icon-left"
  >
    Haut de page
  </RouterLink>
</template>

<style scoped>
.top-link {
  display: inline-block;
  margin-top: 2.5rem;
}
</style>
