<script setup lang="ts">
import { marked } from "marked";

defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
}>();
</script>

<template>
  <li class="fr-p-2w criterium-container">
    <span class="fr-text--bold criterium-number"
      >{{ topicNumber }}.{{ criterium.number }}</span
    >
    <div>
      <span
        class="fr-text--bold criterium-title"
        v-html="marked.parseInline(criterium.title)"
      />
    </div>
  </li>
</template>

<style scoped>
.criterium-container {
  background: var(--background-alt-blue-france);
  border-radius: 0.25rem;
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  list-style: none;
}

.criterium-container::marker {
  content: none;
}

.criterium-number,
.criterium-title {
  color: var(--text-action-high-grey);
}
</style>
