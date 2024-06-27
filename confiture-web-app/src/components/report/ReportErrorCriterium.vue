<script setup lang="ts">
import { marked } from "marked";
import { chunk } from "lodash-es";

import { formatStatus, formatUserImpact, getUploadUrl } from "../../utils";
import rgaa from "../../criteres.json";
import { CriterionResultUserImpact, ReportCriteriumResult } from "../../types";
import LazyAccordion from "../audit/LazyAccordion.vue";
import CriteriumTestsAccordion from "../audit/CriteriumTestsAccordion.vue";
import MarkdownRenderer from "../ui/MarkdownRenderer.vue";

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
    <p class="fr-text--lg fr-text--bold criterium-title">
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
      <MarkdownRenderer
        v-if="error.notCompliantComment"
        class="fr-mb-3w"
        :markdown="error.notCompliantComment"
      />
      <p
        v-if="chunk(error.exampleImages, 2).length"
        class="fr-text--xs fr-mb-1w error-accordion-subtitle"
      >
        Exemple(s) d’erreur(s)
      </p>
      <div class="fr-container--fluid">
        <div
          v-for="(line, k) in chunk(error.exampleImages, 2)"
          :key="k"
          class="fr-grid-row fr-grid-row--gutters"
        >
          <a
            v-for="example in line"
            :key="example.key"
            class="fr-col-md-6 fr-col-12 image-link"
            :href="getUploadUrl(example.key)"
            target="_blank"
          >
            <span class="sr-only">
              Ouvrir l’image dans une nouvelle fenêtre
            </span>
            <img style="width: 100%" :src="getUploadUrl(example.key)" alt="" />
          </a>
        </div>
      </div>
    </LazyAccordion>

    <!-- Tests -->
    <CriteriumTestsAccordion
      :topic-number="error.topic"
      :criterium="getCriterium(error.topic, error.criterium)"
    />
  </div>
</template>
