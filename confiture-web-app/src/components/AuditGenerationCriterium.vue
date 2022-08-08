<script setup lang="ts">
import { marked } from "marked";

defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
  pageNumber: number;
}>();
</script>

<template>
  <li class="fr-p-2w criterium-container">
    <div class="fr-mb-2w criterium-main-section">
      <span class="fr-text--bold criterium-number">
        {{ topicNumber }}.{{ criterium.number }}
      </span>
      <div>
        <span
          class="fr-text--bold criterium-title"
          v-html="marked.parseInline(criterium.title)"
        />
      </div>
    </div>
    <div class="fr-accordion">
      <span class="fr-accordion__title">
        <button
          class="fr-accordion__btn"
          aria-expanded="false"
          :aria-controls="`tests-refs-${pageNumber}-${topicNumber}-${criterium.number}`"
        >
          Tests et références du test {{ topicNumber }}.{{ criterium.number }}
        </button>
      </span>
      <div
        :id="`tests-refs-${pageNumber}-${topicNumber}-${criterium.number}`"
        class="fr-collapse"
      >
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consectetur
        quos, est distinctio illum porro eligendi itaque iusto inventore eaque
        veniam optio laborum voluptas accusamus unde sed beatae? Aperiam,
        similique tempore.
      </div>
    </div>
  </li>
</template>

<style scoped>
.criterium-container {
  background: var(--background-alt-blue-france);
  border-radius: 0.25rem;
  list-style: none;
}

.criterium-container::marker {
  content: none;
}

.criterium-main-section {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
}

.criterium-number,
.criterium-title {
  color: var(--text-action-high-grey);
}
</style>
