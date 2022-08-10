<script lang="ts">
import { marked } from "marked";

// TODO: use a <RouterLink />
const renderer = {
  link(href: string, title: string, text: string) {
    return `<a href="/ressources/glossaire${href}">${text}</a>`;
  },
};

marked.use({ renderer });
</script>

<script setup lang="ts">
import { computed, watch, reactive } from "vue";
import { debounce } from "lodash-es";

import { AuditPage, CriteriumResult, CriteriumResultStatus } from "../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";
import { useResultsStore } from "../store";

const store = useResultsStore();

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

const result = reactive<CriteriumResult>({
  // This component should not be rendered before the audit results are fetched
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ...store.getCriteriumResult(
    props.page.url,
    props.topicNumber,
    props.criterium.number
  )!,
});

watch(
  result,
  // Wait 500ms since the last modification before sending the PATCH request
  debounce(async () => {
    try {
      await store.updateResults(props.auditUniqueId, [result]);
    } catch (error) {
      console.log(error);
    }
  }, 500)
);

// Get a unique id for a criterium per page (e.g. 1-1-8)
const uniqueId = computed(() => {
  return `${props.page.id}-${props.topicNumber}-${props.criterium.number}`;
});

const testsHtml = Object.values(
  props.criterium.tests as Record<string, string | string[]>
).map((test) =>
  marked.parse(
    Array.isArray(test)
      ? test.map((line, i) => (i === 0 ? line : `- ${line}`)).join("\n")
      : test
  )
);
console.log(
  "🚀 ~ file: AuditGenerationCriterium.vue ~ line 74 ~ testsHtml",
  testsHtml
);
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
    <div class="fr-mb-2w">
      <template v-for="s in statuses" :key="s.value">
        <input
          :id="`status-${uniqueId}-${s.value}`"
          v-model="result.status"
          type="radio"
          :name="`status-${uniqueId}`"
          :value="s.value"
          class="fr-mr-1w"
        />
        <label class="fr-mr-2w" :for="`status-${uniqueId}-${s.value}`">
          {{ s.label }}
        </label>
      </template>
    </div>

    <!-- FIXME: left/right arrow bug -->
    <!-- COMMENT / DESCRIPTION -->
    <CriteriumCompliantAccordion
      v-if="result.status === CriteriumResultStatus.COMPLIANT"
      :id="`compliant-accordion-${uniqueId}`"
      v-model:comment="result.compliantComment"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="result.status === CriteriumResultStatus.NOT_APPLICABLE"
      :id="`not-applicable-accordion-${uniqueId}`"
      v-model:comment="result.notApplicableComment"
    />

    <template v-else-if="result.status === CriteriumResultStatus.NOT_COMPLIANT">
      <CriteriumNotCompliantAccordion
        :id="`not-compliant-accordion-${uniqueId}`"
        v-model:comment="result.errorDescription"
      />
      <!-- RECOMMENDATION -->
      <CriteriumRecommendationAccordion
        :id="`recommendation-${uniqueId}`"
        v-model:comment="result.recommandation"
      />
    </template>

    <!-- TESTS + REFS -->
    <div class="fr-accordion">
      <span class="fr-accordion__title">
        <button
          class="fr-accordion__btn"
          aria-expanded="false"
          :aria-controls="`tests-refs-${uniqueId}`"
        >
          Tests et références du critère {{ topicNumber }}.{{
            criterium.number
          }}
        </button>
      </span>
      <div :id="`tests-refs-${uniqueId}`" class="fr-collapse">
        <template v-for="(test, i) in testsHtml" :key="i">
          <div class="criterium-test">
            <div>{{ topicNumber }}.{{ criterium.number }}.{{ i + 1 }}</div>
            <div v-html="test" />
          </div>

          <div
            class="fr-accordion"
            :class="{ 'fr-mb-4w': i !== testsHtml.length - 1 }"
          >
            <span class="fr-accordion__title">
              <button
                class="fr-accordion__btn"
                aria-expanded="false"
                :aria-controls="`tests-method-${uniqueId}-${i}`"
              >
                Méthodologie du test {{ topicNumber }}.{{ criterium.number }}.{{
                  i + 1
                }}
              </button>
            </span>
            <div :id="`tests-method-${uniqueId}-${i}`" class="fr-collapse">
              <!-- TODO: update content -->
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Consectetur quos, est distinctio illum porro eligendi itaque iusto
              inventore eaque veniam optio laborum voluptas accusamus unde sed
              beatae? Aperiam, similique tempore.
            </div>
          </div>
        </template>
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

.criterium-test {
  display: grid;
  grid-template-columns: 3rem 1fr;
}
</style>
