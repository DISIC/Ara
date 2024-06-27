<script setup lang="ts">
import { chunk, groupBy, mapValues, sortBy, uniqWith } from "lodash-es";
import { marked } from "marked";
import { computed, ref } from "vue";

import rgaa from "../../criteres.json";
import { useReportStore } from "../../store";
import {
  AuditReport,
  CriterionResultUserImpact,
  CriteriumResultStatus
} from "../../types";
import { formatStatus, formatUserImpact, getUploadUrl } from "../../utils";
import CriteriumTestsAccordion from "../audit/CriteriumTestsAccordion.vue";
import LazyAccordion from "../audit/LazyAccordion.vue";
import MarkdownRenderer from "../ui/MarkdownRenderer.vue";
import ReportCriteria from "./ReportCriteria.vue";

const report = useReportStore();

/*
[{
  pageUrl: "https://example.com",
  pageName: "Accueil"
  topics: [{
    topic: 2,
    name: "Cadres",
    errors: [{ ... }]
  }]
}]
*/

const errors = computed(() => {
  const resultsGroupedByPage = {
    // include pages with no errors
    ...report.data?.context.samples.reduce<Record<string, []>>((acc, val) => {
      acc[val.id] = [];
      return acc;
    }, {}),

    ...groupBy(
      report.data?.results
        .filter((r) => {
          return (
            r.status === CriteriumResultStatus.NOT_COMPLIANT &&
            !r.transverse &&
            userImpactFilters.value.includes(r.userImpact)
          );
        })
        .filter((r) => {
          return quickWinFilter.value ? r.quickWin : r;
        }),
      "pageId"
    )
  } as Record<number, AuditReport["results"]>;

  const data = sortBy(
    Object.entries(resultsGroupedByPage).map(([pageId, results]) => {
      return {
        id: Number(pageId),
        order: getPage(pageId).order,
        name: getPage(pageId).name,
        url: getPage(pageId).url,
        topics: sortBy(
          Object.values(
            mapValues(groupBy(results, "topic"), (results, topicNumber) => {
              return {
                topic: Number(topicNumber),
                name: getTopicName(Number(topicNumber)),
                errors: sortBy(
                  results.filter((r) => !r.transverse),
                  "criterium"
                )
              };
            })
          ),
          "topic"
        )
      };
    }),
    (el) => el.order
  );

  return data;
});

/**
 [{
    topic: 2,
    name: "Cadres",
    errors: [{ ... }]
  }]
 */
const transverseErrors = computed(() => {
  return Object.values(
    mapValues(
      groupBy(
        uniqWith(
          report.data?.results.filter((r) => {
            return (
              r.transverse &&
              r.status === CriteriumResultStatus.NOT_COMPLIANT &&
              userImpactFilters.value.includes(r.userImpact)
            );
          }),
          (a, b) => a.criterium === b.criterium && a.topic === b.topic
        ),
        "topic"
      ),
      (results, topicNumber) => {
        return {
          topic: topicNumber,
          name: getTopicName(Number(topicNumber)),
          errors: results
        };
      }
    )
  );
});

// Filters
const defaultUserImpactFillters = [
  CriterionResultUserImpact.MINOR,
  CriterionResultUserImpact.MAJOR,
  CriterionResultUserImpact.BLOCKING,
  null
];

const userImpactFilters = ref<Array<CriterionResultUserImpact | null>>(
  defaultUserImpactFillters
);

const disabledResetFilters = computed(
  () =>
    userImpactFilters.value.length === defaultUserImpactFillters.length &&
    !quickWinFilter.value
);

const minorUserImpactErrorCount = computed(
  () =>
    report.data?.results.filter(
      (r) =>
        r.status === CriteriumResultStatus.NOT_COMPLIANT &&
        r.userImpact === CriterionResultUserImpact.MINOR
    ).length
);

const majorUserImpactErrorCount = computed(
  () =>
    report.data?.results.filter(
      (r) =>
        r.status === CriteriumResultStatus.NOT_COMPLIANT &&
        r.userImpact === CriterionResultUserImpact.MAJOR
    ).length
);

const blockingUserImpactErrorCount = computed(
  () =>
    report.data?.results.filter(
      (r) =>
        r.status === CriteriumResultStatus.NOT_COMPLIANT &&
        r.userImpact === CriterionResultUserImpact.BLOCKING
    ).length
);

const unknownUserImpactErrorCount = computed(
  () =>
    report.data?.results.filter(
      (r) =>
        r.status === CriteriumResultStatus.NOT_COMPLIANT &&
        r.userImpact === null
    ).length
);

const quickWinFilter = ref(false);

function resetFilters() {
  userImpactFilters.value = defaultUserImpactFillters;
  quickWinFilter.value = false;
}

// Utility
function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}

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

/** Get a page by its id */
function getPage(pageId: number | string) {
  return report.data!.context.samples.find((p) => p.id === Number(pageId))!;
}
</script>

<template>
  <ReportCriteria
    v-if="report.data"
    :pages-data="errors"
    :transverse-data="transverseErrors"
    :show-filters="true"
  >
    <template #filter>
      <div class="fr-text--bold fr-text--xl fr-mb-2w filter-title">Filtres</div>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-right fr-mb-3w"
        :disabled="disabledResetFilters"
        @click="resetFilters"
      >
        Réinitialiser les filtres
      </button>
      <div class="fr-form-group">
        <fieldset class="fr-fieldset">
          <legend
            id="checkboxes-hint-element-legend"
            class="fr-fieldset__legend fr-text--regular fr-text--bold"
          >
            Impact de l’erreur
          </legend>
          <div class="fr-fieldset__content">
            <div class="fr-checkbox-group">
              <input
                id="user-impact-filter-minor"
                v-model="userImpactFilters"
                :value="CriterionResultUserImpact.MINOR"
                type="checkbox"
              />
              <label class="fr-label" for="user-impact-filter-minor">
                Mineur ({{ minorUserImpactErrorCount }})
                <span class="fr-hint-text">
                  Gêne dans l’utilisation du site
                </span>
              </label>
            </div>
            <div class="fr-checkbox-group">
              <input
                id="user-impact-filter-major"
                v-model="userImpactFilters"
                :value="CriterionResultUserImpact.MAJOR"
                type="checkbox"
              />
              <label class="fr-label" for="user-impact-filter-major">
                Majeur ({{ majorUserImpactErrorCount }})
                <span class="fr-hint-text">
                  Complexifie grandement l’utilisation du site
                </span>
              </label>
            </div>
            <div class="fr-checkbox-group">
              <input
                id="user-impact-filter-blocking"
                v-model="userImpactFilters"
                :value="CriterionResultUserImpact.BLOCKING"
                type="checkbox"
              />
              <label class="fr-label" for="user-impact-filter-blocking">
                Bloquant ({{ blockingUserImpactErrorCount }})
                <span class="fr-hint-text">
                  Empêche totalement l’utilisation du site
                </span>
              </label>
            </div>
            <div class="fr-checkbox-group">
              <input
                id="user-impact-filter-unknown"
                v-model="userImpactFilters"
                :value="null"
                type="checkbox"
              />
              <label class="fr-label" for="user-impact-filter-unknown">
                Impact non renseigné ({{ unknownUserImpactErrorCount }})
              </label>
            </div>
          </div>
        </fieldset>
      </div>
      <div class="fr-form-group">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend fr-text--regular fr-text--bold">
            Correction de l’erreur
          </legend>
          <div class="fr-fieldset__content">
            <div class="fr-checkbox-group">
              <input
                id="quick-win-filter"
                v-model="quickWinFilter"
                type="checkbox"
              />
              <label class="fr-label" for="quick-win-filter">
                Uniquement les erreurs faciles à corriger
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    </template>

    <template #transverse-data>
      <section v-if="transverseErrors.length" class="fr-mb-8w">
        <h2 id="all-pages" class="fr-h3 fr-mb-2w page-title">
          Toutes les pages
        </h2>

        <div
          v-for="(topic, i) in transverseErrors"
          :key="topic.topic"
          :class="{ 'fr-mt-9v': i !== 0 }"
        >
          <p class="fr-tag fr-tag--sm fr-mb-3w">
            {{ topic.topic }}.&nbsp;{{ topic.name }}
          </p>
          <template v-for="(error, j) in topic.errors" :key="j">
            <p
              :class="[
                'fr-text--lg fr-text--bold criterium-title',
                { 'fr-mt-9v': j !== 0 }
              ]"
            >
              {{ error.topic }}.{{ error.criterium }}&nbsp;
              <span v-html="getCriteriumTitle(error.topic, error.criterium)" />
            </p>

            <ul class="fr-badges-group fr-mb-2w">
              <li>
                <p
                  class="fr-badge fr-badge--sm fr-badge--error fr-badge--no-icon"
                >
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
                    <img
                      style="width: 100%"
                      :src="getUploadUrl(example.key)"
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </LazyAccordion>

            <!-- Tests -->
            <CriteriumTestsAccordion
              :topic-number="error.topic"
              :criterium="getCriterium(error.topic, error.criterium)"
            />
          </template>
        </div>
      </section>
    </template>

    <template #pages-data>
      <section v-for="page in errors" :key="page.id" class="fr-mb-8w">
        <h2 :id="`${page.id}`" class="fr-h3 fr-mb-2w page-title">
          {{ page.name }}
        </h2>
        <a
          :href="page.url"
          class="fr-link page-url"
          target="_blank"
          rel="noopener"
        >
          {{ page.url }} <span class="sr-only">(nouvelle fenêtre)</span>
        </a>

        <p v-if="page.topics.length === 0" class="fr-mt-4w">
          Aucune erreur d'accessibilité relevée sur cette page.
        </p>

        <div
          v-for="(topic, i) in page.topics"
          :key="topic.topic"
          :class="i === 0 ? 'fr-mt-4w' : 'fr-mt-9v'"
        >
          <p class="fr-tag fr-tag--sm fr-mb-3w">
            {{ topic.topic }}.&nbsp;{{ topic.name }}
          </p>
          <template v-for="(error, j) in topic.errors" :key="j">
            <p
              :class="[
                'fr-text--lg fr-text--bold criterium-title',
                { 'fr-mt-9v': j !== 0 }
              ]"
            >
              {{ error.topic }}.{{ error.criterium }}&nbsp;
              <span v-html="getCriteriumTitle(error.topic, error.criterium)" />
            </p>

            <ul class="fr-badges-group fr-mb-2w">
              <li>
                <p
                  class="fr-badge fr-badge--sm fr-badge--error fr-badge--no-icon"
                >
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
                    <img
                      style="width: 100%"
                      :src="getUploadUrl(example.key)"
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </LazyAccordion>

            <!-- Tests -->
            <CriteriumTestsAccordion
              :topic-number="error.topic"
              :criterium="getCriterium(error.topic, error.criterium)"
            />
          </template>
        </div>
      </section>
    </template>
  </ReportCriteria>
</template>
