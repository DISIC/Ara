<script setup lang="ts">
import { marked } from "marked";
import { computed, watch, reactive } from "vue";
import { debounce } from "lodash-es";

import { AuditPage, CriteriumResult, CriteriumResultStatus } from "../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import Radio, { RadioColor } from "./Radio.vue";
import { useResultsStore } from "../store";
import { useNotifications } from "../composables/useNotifications";

const store = useResultsStore();

const props = defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
  page: AuditPage;
  auditUniqueId: string;
}>();

const statuses: Array<{
  label: string;
  value: CriteriumResultStatus;
  color?: RadioColor;
}> = [
  {
    label: "Conforme",
    value: CriteriumResultStatus.COMPLIANT,
    color: "green",
  },
  {
    label: "Non conforme",
    value: CriteriumResultStatus.NOT_COMPLIANT,
    color: "red",
  },
  {
    label: "Non applicable",
    value: CriteriumResultStatus.NOT_APPLICABLE,
    color: "grey",
  },
  {
    label: "Non testé",
    value: CriteriumResultStatus.NOT_TESTED,
  },
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

const notify = useNotifications();

watch(
  result,
  // Wait 500ms since the last modification before sending the PATCH request
  debounce(async () => {
    try {
      await store.updateResults(props.auditUniqueId, [result]);
    } catch (error) {
      console.log(error);
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
    }
  }, 500)
);

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
    <fieldset
      class="fr-mb-2w fr-ml-5w fr-mx-0 fr-p-0 criterium-radios-container"
    >
      <legend class="sr-only">Statut du critère</legend>
      <Radio
        v-for="s in statuses"
        :id="`status-${uniqueId}-${s.value}`"
        :key="s.value"
        v-model="result.status"
        :label="s.label"
        :name="`status-${uniqueId}`"
        :value="s.value"
        :color="s.color"
      />
    </fieldset>

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
        v-model:user-impact="result.userImpact"
      />
      <!-- RECOMMENDATION -->
      <CriteriumRecommendationAccordion
        :id="`recommendation-${uniqueId}`"
        v-model:comment="result.recommandation"
      />
    </template>

    <!-- TESTS + METHODO -->
    <CriteriumTestsAccordion
      :topic-number="topicNumber"
      :criterium="criterium"
    />
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

.criterium-radios-container {
  border: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
