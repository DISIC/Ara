<script setup lang="ts">
import StatDonut from "./StatDonut.vue";

defineProps<{
  title: string;
  description: string;
  value: number;
  total: number;
  unit?: string;
  danger?: boolean;
}>();
</script>

<template>
  <div class="fr-p-3w card">
    <StatDonut :value="value" :total="total" :unit="unit" :danger="danger" />

    <div class="card-info">
      <p class="fr-h6 fr-mb-1v card-title">{{ title }}</p>
      <p class="fr-text--xs fr-mb-0 card-description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--border-default-grey);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-value,
.card-title {
  color: var(--text-title-grey);
}

.card-info {
  flex-grow: 1;
}

.card-description {
  color: var(--text-mention-grey);
}

@media (max-width: 992px) {
  .card {
    flex-direction: column;
  }

  .card-info {
    text-align: center;
  }
}
</style>
