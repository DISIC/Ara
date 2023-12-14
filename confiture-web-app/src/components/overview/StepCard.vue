<script setup lang="ts">
defineProps<{
  checked?: boolean;
  id: string;
}>();
</script>

<template>
  <li class="step-card-wrapper">
    <span
      :id="id"
      :class="[
        'fr-icon--lg fr-icon-checkbox-circle-fill step-card-check',
        { 'step-card-check--success': checked }
      ]"
      aria-hidden="true"
    >
      <span class="sr-only">{{
        checked ? "Étape terminée" : "Étape à réaliser"
      }}</span>
    </span>

    <div class="fr-px-4w fr-py-3w step-card">
      <slot />
    </div>
  </li>
</template>

<style scoped>
.step-card-wrapper {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  max-width: 49.5rem;
}

.step-card {
  border: 1px solid var(--border-default-grey);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
  flex-grow: 1;
}

.step-card-check {
  color: var(--border-default-grey);
  margin: 0 auto;
}

.step-card-check--success {
  color: var(--text-default-success);
}

@media (max-width: 48rem) {
  .step-card-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
