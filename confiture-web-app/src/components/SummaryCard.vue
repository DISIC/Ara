<script setup lang="ts">
import { useSlots, computed } from "vue";
import { useUniqueId } from "../composables/useUniqueId";
import StatDonut from "./StatDonut.vue";

defineProps<{
  title: string;
  description: string;
  value: number;
  total: number;
  unit?: string;
  theme?: string;
}>();

const slots = useSlots();
const showDetails = computed(
  () => slots["accordion-title"] && slots["accordion-content"]
);
const uniqueId = useUniqueId();
</script>

<template>
  <div class="card">
    <div class="fr-p-3w card-main-content">
      <StatDonut :value="value" :total="total" :unit="unit" :theme="theme" />

      <div class="card-info">
        <p class="fr-h6 fr-mb-1v card-title">{{ title }}</p>
        <p class="fr-text--xs fr-mb-0 card-description">
          {{ description }}
        </p>
      </div>
    </div>

    <section v-if="showDetails" class="fr-accordion">
      <h3 class="fr-accordion__title">
        <button
          class="fr-accordion__btn"
          aria-expanded="false"
          :aria-controls="`accordion-${uniqueId}`"
        >
          <slot name="accordion-title"></slot>
        </button>
      </h3>
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
