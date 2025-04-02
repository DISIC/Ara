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

  &:deep(.step-card-heading) {
    align-items: center;
    display: flex;
    gap: 1rem;
    grid-column: 1 / -1;
    flex-wrap: wrap;

    @media (width < 36rem) {
      flex-direction: column;
      align-items: start;
    }
  }

  &:deep(.step-card-title) {
    /* FIXME: DSFR default badges dont align. Those with icons does. */
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;

    @media (width < 36rem) {
      flex-direction: column;
      align-items: start;
    }
  }

  &:deep(.step-card-check) {
    color: var(--text-default-success);
  }

  &:deep(.step-card-settings-link) {
    margin-inline-start: auto;

    @media (width < 36rem) {
      margin-inline-start: initial;
    }
  }
}
</style>
