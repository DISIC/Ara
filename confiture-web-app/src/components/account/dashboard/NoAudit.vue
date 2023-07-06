<script lang="ts" setup>
defineProps<{ label: string }>();
</script>

<template>
  <div class="fr-py-3w fr-px-2w wrapper">
    <RouterLink :to="{ name: 'missing-audit' }">{{ label }}</RouterLink>
  </div>
</template>

<style scoped>
.wrapper {
  background: var(--background-alt-blue-france);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
