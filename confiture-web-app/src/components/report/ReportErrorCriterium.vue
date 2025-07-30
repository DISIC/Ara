<script setup lang="ts">
import { chunk } from "lodash-es";
import { marked } from "marked";

import rgaa from "../../criteres.json";
import { CriterionResultUserImpact, ReportCriteriumResult } from "../../types";
import {
  formatStatus,
  formatUserImpact,
  getUploadUrl,
  isTiptapDocumentEmpty
} from "../../utils";
import TiptapRenderer from "../tiptap/TiptapRenderer.vue";

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
    <TiptapRenderer
      v-if="
        error.notCompliantComment &&
          !isTiptapDocumentEmpty(error.notCompliantComment)
      "
      :key="error.topic + '.' + error.criterium"
      :document="error.notCompliantComment"
    />

    <p v-else>
      Aucune description de l’erreur ou recommandation de correction.
    </p>

    <template v-if="chunk(error.exampleImages, 2).length">
      <p class="fr-text--xs fr-mb-1w error-accordion-subtitle">
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
            <span class="fr-sr-only">
              Ouvrir l’image dans une nouvelle fenêtre
            </span>
            <img
              class="example-image"
              :src="getUploadUrl(example.key)"
              alt=""
            />
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.example-image {
  max-height: 12.5rem;
  max-width: calc(100% - 1.5rem); /* Full width minus externa icon size */
  width: auto;
}
</style>
