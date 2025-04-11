<template>
  <div class="fr-px-4w fr-py-3w step-card">
    <slot />
  </div>
</template>

<style scoped>
.step-card {
  border: 1px solid var(--border-default-grey);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  flex-grow: 1;
  max-width: 49.5rem;
}
</style>
