<script setup lang="ts">
import { computed } from "vue";
import { useResultsStore } from "../store";
const results = useResultsStore();

const progressPercentage = computed(() => {
  const percentage = results.auditProgress * 100;
  const rounded = Math.round(percentage);

  // Only return 100% when the progress is actually 100%, 99.99% would return 99%
  if (rounded === 100 && percentage !== 100) {
    return 99;
  }

  return rounded;
});
const progressBarValue = computed(() => results.auditProgress * 100 + "%");
</script>

<template>
  <div class="fr-py-1v fr-px-1w audit-progress">
    <span class="audit-progress-label">Progression de l’audit</span>
    <span
      class="fr-text--xs fr-text--action-high-grey fr-m-0 audit-progress-percentage"
    >
      {{ progressPercentage }}%
    </span>
    <div class="audit-progress-bar" />
  </div>
</template>

<style scoped>
.audit-progress-bar {
  background-color: var(--background-contrast-grey);
  position: relative;
  grid-column: 1 / -1;
}

.audit-progress {
  background: none;
  display: grid;
  gap: 0.25rem 0;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 0.25rem;
  min-width: 18rem;
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

.audit-progress-label {
  font-weight: 500;
}

.audit-progress-percentage {
  color: var(--text-mention-grey);
}
</style>
