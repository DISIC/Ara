<script setup lang="ts">
import { marked } from "marked";
import { computed, ref, watch } from "vue";

import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";

const props = defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
  pageNumber: number;
}>();

const status = ref("nt");
watch(status, (newValue) => {
  console.log("[PATCH] Update status: " + newValue);
});

// Get a unique id for a criterium per page (e.g. 1-1-8)
const uniqueId = computed(() => {
  return `${props.pageNumber}-${props.topicNumber}-${props.criterium.number}`;
});
</script>

<template>
  <li class="fr-p-2w criterium-container">
    <div class="fr-mb-2w criterium-main-section">
      <span class="fr-text--bold criterium-number">
        {{ topicNumber }}.{{ criterium.number }}
      </span>
      <div
        class="fr-text--bold criterium-title"
        v-html="marked.parseInline(criterium.title)"
      />
    </div>

    <!-- STATUS -->
    <!-- TODO: temp status radios -->
    <label class="fr-mr-1w" :for="`status-${uniqueId}-c`">Conforme</label>
    <input
      :id="`status-${uniqueId}-c`"
      v-model="status"
      type="radio"
      name="status"
      value="c"
      class="fr-mr-2w"
    />
    <label class="fr-mr-1w" :for="`status-${uniqueId}-nc`">Non-conforme</label>
    <input
      :id="`status-${uniqueId}-nc`"
      v-model="status"
      type="radio"
      name="status"
      value="nc"
      class="fr-mr-2w"
    />
    <label class="fr-mr-1w" :for="`status-${uniqueId}-na`"
      >Non-applicable</label
    >
    <input
      :id="`status-${uniqueId}-na`"
      v-model="status"
      type="radio"
      name="status"
      value="na"
      class="fr-mr-2w"
    />
    <label class="fr-mr-1w" :for="`status-${uniqueId}-nt`">Non-testé</label>
    <input
      :id="`status-${uniqueId}-nt`"
      v-model="status"
      type="radio"
      name="status"
      value="nt"
      class="fr-mr-2w fr-mb-2w"
    />

    <!-- COMMENT / DESCRIPTION -->
    <CriteriumCompliantAccordion
      v-if="status === 'c'"
      :id="`compliant-accordion-${uniqueId}`"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="status === 'na'"
      :id="`not-applicable-accordion-${uniqueId}`"
    />

    <template v-else-if="status === 'nc'">
      <CriteriumNotCompliantAccordion
        :id="`not-compliant-accordion-${uniqueId}`"
      />
      <!-- RECOMMENDATION -->
      <CriteriumRecommendationAccordion :id="`recommendation-${uniqueId}`" />
    </template>

    <!-- TESTS + REFS -->
    <div class="fr-accordion">
      <span class="fr-accordion__title">
        <button
          class="fr-accordion__btn"
          aria-expanded="false"
          :aria-controls="`tests-refs-${uniqueId}`"
        >
          Tests et références du test {{ topicNumber }}.{{ criterium.number }}
        </button>
      </span>
      <div :id="`tests-refs-${uniqueId}`" class="fr-collapse">
        <!-- TODO: update content -->
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

.status-radios {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
