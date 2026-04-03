<script setup lang="ts">
import { chunk } from "lodash-es";
import { marked } from "marked";

import { computed } from "vue";
import rgaa from "../../criteres.json";
import { CriterionResultUserImpact, ReportCriteriumResult } from "../../types";
import {
  formatStatus,
  formatUserImpact,
  getUploadUrl,
  isTiptapDocumentEmpty
} from "../../utils";
import TiptapRenderer from "../tiptap/TiptapRenderer.vue";

const { error } = defineProps<{
  error: ReportCriteriumResult;
}>();

function getCriterium(topicNumber: number, criteriumNumber: number) {
  // FIXME: "any everywhere" : The criteria properties of each topic do not have the same signature. See: https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
  const criterium = (rgaa.topics as any)
    .find((t: any) => t.number === topicNumber)
    ?.criteria.find(
      (c: any) => c.criterium.number === criteriumNumber
    ).criterium;

  return criterium;
}

function getCriteriumTitle(topicNumber: number, criteriumNumber: number) {
  return marked.parseInline(getCriterium(topicNumber, criteriumNumber).title);
}

const sectionId = computed(() => `${error.pageId}_${error.topic}_${error.criterium}`);

const countNotCompliantItemsRecommandations = computed(() => {
  return error.notCompliantItems
    .filter(x => x.comment || x.quickWin === true || x.title || x.userImpact)
    .length;
});
</script>

<template>
  <div>
    <p :id="sectionId" class="fr-text--lg fr-text--bold criterium-title fr-h3 fr-mb-2w">
      {{ error.topic }}.{{ error.criterium }}&nbsp;–
      <span v-html="getCriteriumTitle(error.topic, error.criterium)" />
      <a :href="'#' + sectionId" class="fr-btn fr-icon-links-line fr-btn--tertiary-no-outline fr-btn--sm">
        <span class="fr-sr-only">ancre vers le critère {{ error.topic }}.{{ error.criterium }}</span>
      </a>
    </p>

    <p class="fr-badge fr-badge--sm fr-badge--error fr-badge--no-icon fr-mb-3w">
      {{ formatStatus(error.status) }} ({{ countNotCompliantItemsRecommandations }})
    </p>

    <div role="list">
      <div
        v-for="(notCompliantItem, index) in error.notCompliantItems
          .filter((x) =>
            x.comment || x.quickWin === true || x.title || x.userImpact)"
        :key="index"
        role="listitem"
        class="criterium-not-compliant-item"
      >
        <div class="criterium-not-compliant-item-header">
          <ul class="fr-badges-group fr-mb-3w">
            <li v-if="notCompliantItem.userImpact">
              <p
                class="fr-badge fr-badge--sm fr-m-1-5v"
                :class="{
                  'fr-badge--yellow-moutarde':
                    notCompliantItem.userImpact
                    === CriterionResultUserImpact.MAJOR,
                  'fr-badge--error fr-badge--no-icon':
                    notCompliantItem.userImpact
                    === CriterionResultUserImpact.BLOCKING
                }"
              >
                Impact {{ formatUserImpact(notCompliantItem.userImpact) }}
              </p>
            </li>
            <li v-if="notCompliantItem.quickWin">
              <p class="fr-badge fr-badge--sm fr-m-1-5v">Facile à corriger</p>
            </li>
          </ul>

          <a :href="`#${sectionId}_erreur_${index + 1}`" class="fr-btn fr-icon-links-line fr-btn--tertiary-no-outline fr-btn--sm">
            <span class="fr-sr-only">ancre vers l'erreur {{ index + 1 }} du critère {{ error.topic }}.{{ error.criterium }}</span>
          </a>
        </div>

        <h3 v-if="notCompliantItem.title" class="fr-h4">{{ notCompliantItem.title }}</h3>

        <!-- Error -->
        <TiptapRenderer
          v-if="
            notCompliantItem.comment &&
              !isTiptapDocumentEmpty(notCompliantItem.comment)
          "
          :key="error.topic + '.' + error.criterium"
          :document="notCompliantItem.comment"
        />
        <p v-else class="criterium-not-compliant-item-no-erreur">
          Aucune description de l’erreur ou recommandation ajoutée par l’auditrice ou l’auditeur.
        </p>

      </div>

    </div>

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

<style scoped>
.example-image {
  max-height: 12.5rem;
  max-width: calc(100% - 1.5rem); /* Full width minus externa icon size */
  width: auto;
}

.criterium-title {
  scroll-margin: 4rem;
}

.criterium-not-compliant-item {
  border: 1px solid var(--border-default-grey);
  padding: 1rem;
  margin-bottom: 2rem;
}

.criterium-not-compliant-item-header {
  display: flex;
  justify-content: space-between;
}

.criterium-not-compliant-item-no-erreur {
  font-style: italic;
  color: var(--text-mention-grey);
  text-align: center;
}
</style>

<style>
.criterium-not-compliant-item h4 {
  font-size: 1.375rem;
}

.criterium-not-compliant-item h5 {
  font-size: 1.25rem;
}

.criterium-not-compliant-item h6 {
  font-size: 1.125rem;
}
</style>
