<script setup lang="ts">
import { computed, useSlots } from "vue";

import { useUniqueId } from "../composables/useUniqueId";
import StatDonut, { StatDonutTheme } from "./StatDonut.vue";

defineProps<{
  title: string;
  description?: string;
  value: number;
  total: number;
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
  <div class="card">
    <div
      class="fr-p-3w card-main-content"
      :class="{ 'card-main-content-disabled': disabled }"
    >
      <StatDonut
        :value="value"
        :total="total"
        :unit="unit"
        :theme="theme"
        class="card-donut"
      />

      <div class="card-info">
        <p class="fr-h6 fr-mb-1v card-title" v-html="title" />
        <p v-if="description" class="fr-text--xs fr-mb-0 card-description">
          {{ description }}
        </p>
      </div>
    </div>

    <section v-if="showDetails" class="fr-accordion card-accordion">
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
  border: 1px solid var(--border-default-grey);
}

.card-main-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-main-content-disabled :deep(*:not(.card-accordion)) {
  color: var(--text-disabled-grey);
}

.card-title {
  color: var(--text-title-grey);
}

.card-info {
  flex-grow: 1;
}

.card-description {
  color: var(--text-mention-grey);
}

@media (width < 48rem) {
  .card-info {
    text-align: center;
  }
}
</style>
