<script setup lang="ts">
withDefaults(defineProps<{
  target?: string;
  topMargin?: string;
}>(), {
  target: "header",
  topMargin: "3rem"
});
</script>

<template>
  <RouterLink
    :to="`#${target}`"
    class="top-link fr-link fr-icon-arrow-up-fill fr-link--icon-left"
  >
    Haut de page
  </RouterLink>
</template>

<style scoped>
.top-link {
  display: inline-block;
  margin-top: v-bind(topMargin);
}
</style>
