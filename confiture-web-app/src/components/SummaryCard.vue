<script setup lang="ts">
import { useSlots, computed } from "vue";
import StatDonut from "./StatDonut.vue";

defineProps<{
  title: string;
  description: string;
  value: number;
  total: number;
  unit?: string;
  danger?: boolean;
}>();

const slots = useSlots();
const showDetails = computed(() => slots.summary && slots.details);
</script>

<template>
  <div class="card">
    <div class="fr-p-3w card-main-content">
      <StatDonut :value="value" :total="total" :unit="unit" :danger="danger" />

      <div class="card-info">
        <p class="fr-h6 fr-mb-1v card-title">{{ title }}</p>
        <p class="fr-text--xs fr-mb-0 card-description">
          {{ description }}
        </p>
      </div>
    </div>

    <details v-if="showDetails" class="card-details">
      <summary class="fr-py-3v fr-px-3v">
        <span>
          <slot name="summary"></slot>
        </span>
        <span
          class="fr-icon-add-line fr-icon--sm summary-icon summary-icon-open"
          aria-hidden="true"
        />
        <span
          class="fr-icon-subtract-line fr-icon--sm summary-icon summary-icon-close"
          aria-hidden="true"
        />
      </summary>
      <div class="fr-py-3w fr-px-3v">
        <slot name="details"></slot>
      </div>
    </details>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--border-default-grey);
}

.card-main-content {
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

.card-details > summary {
  list-style: none;
  border-top: 1px solid var(--border-default-grey);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.card-details > :not(summary) {
  cursor: auto;
}

.card-details > summary:hover {
  background-color: var(--background-contrast-grey);
}

.summary-icon {
  display: none;
}
.card-details[open] .summary-icon-close {
  display: initial;
}
.card-details:not([open]) .summary-icon-open {
  display: initial;
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
