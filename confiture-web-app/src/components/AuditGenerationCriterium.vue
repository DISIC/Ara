<script setup lang="ts">
import { marked } from "marked";
import { computed, ref, watch } from "vue";

import { updateResults } from "../api";
import { AuditPage, CriteriumResultStatus } from "../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";

// TODO: use a <RouterLink />
const renderer = {
  link(href: string, title: string, text: string) {
    return `<a href="/ressources/glossaire${href}">${text}</a>`;
  },
};

marked.use({ renderer });

const props = defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
  page: AuditPage;
  auditUniqueId: string;
}>();

const statuses = [
  { label: "Conforme", value: CriteriumResultStatus.COMPLIANT },
  { label: "Non conforme", value: CriteriumResultStatus.NOT_COMPLIANT },
  { label: "Non applicable", value: CriteriumResultStatus.NOT_APPLICABLE },
  { label: "Non testé", value: CriteriumResultStatus.NOT_TESTED },
];

const status = ref(CriteriumResultStatus.NOT_TESTED);
watch(status, async (newValue) => {
  console.log(
    "🚀 ~ file: AuditGenerationCriterium.vue ~ line 31 ~ watch ~ newValue",
    newValue
  );
  try {
    await updateResults(props.auditUniqueId, [
      {
        // ID
        topic: props.topicNumber,
        criterium: props.criterium.number,
        pageUrl: props.page.url,

        // DATA
        status: status.value,
        // compliantComment: string | null,
        // errorDescription: string | null,
        // userImpact: CriterionResultUserImpact | null,
        // recommandation: string | null,
        // notApplicableComment: string | null,
      },
    ]);
  } catch (error) {
    console.log(error);
  }
});

// Get a unique id for a criterium per page (e.g. 1-1-8)
const uniqueId = computed(() => {
  return `${props.page.id}-${props.topicNumber}-${props.criterium.number}`;
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
    <template v-for="s in statuses" :key="s.value">
      <label class="fr-mr-1w" :for="`status-${uniqueId}-${s.value}`">
        {{ s.label }}
      </label>
      <input
        :id="`status-${uniqueId}-${s.value}`"
        v-model="status"
        type="radio"
        name="status"
        :value="s.value"
        class="fr-mr-2w"
      />
    </template>

    <!-- FIXME: left/right arrow bug -->
    <!-- COMMENT / DESCRIPTION -->
    <CriteriumCompliantAccordion
      v-if="status === CriteriumResultStatus.COMPLIANT"
      :id="`compliant-accordion-${uniqueId}`"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="status === CriteriumResultStatus.NOT_APPLICABLE"
      :id="`not-applicable-accordion-${uniqueId}`"
    />

    <template v-else-if="status === CriteriumResultStatus.NOT_COMPLIANT">
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
