<script setup lang="ts">
import { computed, useSlots } from "vue";

import { useUniqueId } from "../composables/useUniqueId";
import { StatDonutTheme } from "./StatDonut.vue";

defineProps<{
  title: string;
  description: string;
  value: number;
  unit?: string;
  theme?: StatDonutTheme;
  disabled?: boolean;
}>();

const slots = useSlots();
const showDetails = computed(
  () => slots["accordion-title"] && slots["accordion-content"]
);
const uniqueId = useUniqueId();
</script>

<template>
  <div :class="['card', { 'card--disabled': disabled }]">
    <p
      :class="`fr-m-0 card-metric card-metric--${theme}`"
      :aria-hidden="disabled ? true : undefined"
    >
      <template v-if="disabled">–</template>
      <span v-else>
        {{ value }}<span v-if="unit" class="card-unit">{{ unit }}</span>
      </span>
    </p>
    <div class="card-info">
      <p class="fr-text--bold fr-mb-1w card-title">{{ title }}</p>
      <p class="fr-text--xs fr-m-0 card-description">
        {{ description }}
      </p>
    </div>
    <section v-if="showDetails" class="fr-accordion card-details">
      <div class="fr-accordion__title">
        <button
          class="fr-accordion__btn"
          aria-expanded="false"
          :aria-controls="`accordion-${uniqueId}`"
        >
          <slot name="accordion-title"></slot>
        </button>
      </div>
      <div :id="`accordion-${uniqueId}`" class="fr-collapse">
        <slot name="accordion-content" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 7.5rem auto;
  border: 1px solid var(--border-default-grey);
}

.card--disabled {
  .card-metric {
    --card-metric-color: var(--text-disabled-grey);
    --card-metric-bg-color: var(--background-disabled-grey);
  }

  .card-title {
    color: var(--text-disabled-grey);
  }
}

.card-metric {
  background-color: var(--card-metric-bg-color);
  color: var(--card-metric-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.375rem;
  font-weight: bold;

  @media (width < 62rem) {
    font-size: 2.5rem;
  }
}

.card-metric--green {
  --card-metric-color: var(--text-default-success);
  --card-metric-bg-color: var(--background-contrast-green-emeraude);
}

.card-metric--blue {
  --card-metric-color: var(--text-active-blue-france);
  --card-metric-bg-color: var(--background-contrast-blue-france);
}

.card-metric--red {
  --card-metric-color: var(--text-default-error);
  --card-metric-bg-color: var(--background-contrast-error);
}

.card-unit {
  font-size: 1.5rem;
}

.card-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0.75rem 2rem 1.5rem;

  @media (width < 62rem) {
    padding: 0.75rem 1rem;
  }
}

.card-title {
  font-size: 1.25rem;
  line-height: 1.3;

  @media (width < 62rem) {
    font-size: 1.125rem;
  }
}

.card-description {
  color: var(--text-mention-grey);
}

.card-details {
  grid-column: 1 / span 2;
}
</style>
