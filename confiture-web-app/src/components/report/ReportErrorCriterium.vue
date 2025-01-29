<script setup lang="ts">
import { marked } from "marked";

import rgaa from "../../criteres.json";
import { CriterionResultUserImpact, ReportCriteriumResult } from "../../types";
import { formatStatus, formatUserImpact } from "../../utils";
import CriteriumTestsAccordion from "../audit/CriteriumTestsAccordion.vue";
import LazyAccordion from "../audit/LazyAccordion.vue";
import Tiptap from "../ui/Tiptap.vue";

defineProps<{
  error: ReportCriteriumResult;
}>();

function getCriterium(topicNumber: number, criteriumNumber: number) {
  // FIXME: "any everywhere" : The criteria properties of each topic do not have the same signature. See: https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
  const criterium = (rgaa.topics as any)
    .find((t: any) => t.number === topicNumber)
    ?.criteria.find((c: any) => c.criterium.number === criteriumNumber)
    .criterium;

  return criterium;
}

function getCriteriumTitle(topicNumber: number, criteriumNumber: number) {
  return marked.parseInline(getCriterium(topicNumber, criteriumNumber).title);
}
</script>

<template>
  <div>
    <p class="fr-text--lg fr-text--bold criterium-title fr-mb-3v">
      {{ error.topic }}.{{ error.criterium }}&nbsp;
      <span v-html="getCriteriumTitle(error.topic, error.criterium)" />
    </p>

    <ul class="fr-badges-group fr-mb-2w">
      <li>
        <p class="fr-badge fr-badge--sm fr-badge--error fr-badge--no-icon">
          {{ formatStatus(error.status) }}
        </p>
      </li>
      <li v-if="error.userImpact">
        <p
          class="fr-badge fr-badge--sm"
          :class="{
            'fr-badge--yellow-moutarde':
              error.userImpact === CriterionResultUserImpact.MAJOR,
            'fr-badge--error fr-badge--no-icon':
              error.userImpact === CriterionResultUserImpact.BLOCKING
          }"
        >
          Impact {{ formatUserImpact(error.userImpact) }}
        </p>
      </li>
      <li v-if="error.quickWin">
        <p class="fr-badge fr-badge--sm">Facile à corriger</p>
      </li>
    </ul>

    <!-- Error -->
    <LazyAccordion
      v-if="error.notCompliantComment || error.exampleImages.length > 0"
      title="Erreur et recommandation"
      data-accordion
    >
      <tiptap
        v-if="error.notCompliantComment"
        :content="error.notCompliantComment"
        :editable="false"
        class="fr-mb-3w"
      />
    </LazyAccordion>

    <!-- Tests -->
    <CriteriumTestsAccordion
      :topic-number="error.topic"
      :criterium="getCriterium(error.topic, error.criterium)"
    />
  </div>
</template>
