<script setup lang="ts">
import { computed } from "vue";

import { useUniqueId } from "../../composables/useUniqueId";

const props = defineProps<{
  value: number;
  label: string;
  size: number; // value in px
  inline?: boolean;
  tooltipLabel?: string;
}>();

const uniqueId = useUniqueId();

const progressPercentage = computed(() => {
  const percentage = props.value * 100;
  const rounded = Math.round(percentage);

  // Only return 100% when the progress is actually 100%, 99.99% would return 99%
  if (rounded === 100 && percentage !== 100) {
    return 99;
  }

  return rounded;
});
const progressBarValue = computed(() => props.value * 100 + "%");
const progressBarSize = computed(() => `${props.size / 16}rem`);
</script>

<template>
  <div
    :class="[
      'audit-progress',
      {
        'audit-progress--inline': inline,
        'audit-progress--with-tooltip':
          tooltipLabel && $slots['tooltip-content']
      }
    ]"
  >
    <span :class="['audit-progress-label', { 'fr-sr-only': inline }]">
      {{ label }}
    </span>
    <template v-if="tooltipLabel && $slots['tooltip-content']">
      <button
        class="fr-btn--tooltip fr-btn"
        type="button"
        :aria-describedby="`progress-bar-tooltip-${uniqueId}`"
      >
        {{ tooltipLabel }}
      </button>
      <span
        :id="`progress-bar-tooltip-${uniqueId}`"
        class="fr-tooltip fr-placement fr-text--sm"
        role="tooltip"
        aria-hidden="true"
      >
        <slot name="tooltip-content" />
      </span>
    </template>
    <span
      :class="[
        ' fr-text--action-high-grey fr-mb-0 audit-progress-percentage',
        {
          'fr-text--xs': !inline
        }
      ]"
    >
      {{ progressPercentage }} %
    </span>
    <div class="audit-progress-bar" />
  </div>
</template>

<style scoped>
.audit-progress {
  background: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  gap: v-bind(progressBarSize) 0.125rem;
}

.audit-progress--inline {
  gap: 0.5rem;
  flex-direction: row-reverse;
  flex-wrap: nowrap;

  .audit-progress-bar {
    height: v-bind(progressBarSize);
  }
}
.audit-progress-label {
  font-weight: 500;
}

.audit-progress-percentage {
  color: var(--text-mention-grey);
  margin-inline-start: auto;
}

.audit-progress-bar {
  background-color: var(--background-contrast-grey);
  position: relative;
  height: v-bind(progressBarSize);
  flex-basis: 100%;
}

.audit-progress-bar::after {
  background-color: var(--background-flat-success);
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 1s ease;
  width: v-bind(progressBarValue);
}
</style>
