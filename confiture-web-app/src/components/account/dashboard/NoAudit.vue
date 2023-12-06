<script lang="ts" setup>
defineProps<{ label: string }>();
</script>

<template>
  <p class="fr-pt-2w fr-pb-3w fr-px-2w wrapper">
    <span class="fr-text--md fr-text--bold fr-mb-1v">{{ label }}</span>

    <RouterLink :to="{ name: 'missing-audit' }" class="fr-text--sm fr-mb-0">
      Vous ne retrouvez pas un audit ?
    </RouterLink>
  </p>
</template>

<style scoped>
.wrapper {
  background: var(--background-alt-blue-france);
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>
