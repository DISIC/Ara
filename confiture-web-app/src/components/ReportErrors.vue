<script setup lang="ts">
import { groupBy, mapValues } from "lodash";
import { marked } from "marked";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import rgaa from "../criteres.json";
import { useReportStore } from "../store";
import { CriterionResultUserImpact, CriteriumResultStatus } from "../types";
import { formatStatus, formatUserImpact, slugify } from "../utils";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import LazyAccordion from "./LazyAccordion.vue";

const report = useReportStore();
const router = useRouter();

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
  // TODO: make more legible
  const data = Object.values(
    mapValues(
      groupBy(
        report.data?.results.filter((r) => {
          return (
            r.status === CriteriumResultStatus.NOT_COMPLIANT &&
            userImpactFilters.value.includes(r.userImpact)
          );
        }),
        "pageUrl"
      ),
      (results, pageUrl) => {
        return {
          pageUrl,
          pageName: getPageName(pageUrl),
          topics: Object.values(
            mapValues(groupBy(results, "topic"), (results, topicNumber) => {
              return {
                topic: topicNumber,
                name: getTopicName(Number(topicNumber)),
                errors: results,
              };
            })
          ),
        };
      }
    )
  );

  return data;
});

const defaultUserImpactFillters = [
  CriterionResultUserImpact.MINOR,
  CriterionResultUserImpact.MAJOR,
  CriterionResultUserImpact.BLOCKING,
  null,
];

const userImpactFilters = ref<Array<CriterionResultUserImpact | null>>(
  defaultUserImpactFillters
);

const disabledResetFilters = computed(
  () => userImpactFilters.value.length === defaultUserImpactFillters.length
);

function expandAll() {
  console.log("expandAll");
}

function resetFilters() {
  userImpactFilters.value = defaultUserImpactFillters;
}

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}

function getCriterium(topicNumber: number, criteriumNumber: number) {
  const criterium = rgaa.topics
    .find((t) => t.number === topicNumber)
    // @ts-expect-error The criteria properties of each topic do not have the same signature. See: https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
    ?.criteria.find((c) => c.criterium.number === criteriumNumber).criterium;

  return criterium;
}

function getCriteriumTitle(topicNumber: number, criteriumNumber: number) {
  return marked.parseInline(getCriterium(topicNumber, criteriumNumber).title);
}

function getPageName(pageUrl: string) {
  return report.data!.context.samples.find((p) => p.url === pageUrl)!.name;
}

function getPageSlug(pageUrl: string) {
  return slugify(getPageName(pageUrl));
}

/**
 * Manually reproduce DSFR menu item anchor links
 * See following issue: https://github.com/DISIC/Confiture/issues/130
 */
function updateActiveAnchorLink(id: string, event: MouseEvent) {
  event.preventDefault();

  const previousSelectedAnchor = document.querySelector(
    '[aria-current="page"]'
  );
  if (previousSelectedAnchor) {
    previousSelectedAnchor.removeAttribute("aria-current");
    previousSelectedAnchor.parentElement?.classList.remove(
      "fr-sidemenu__item--active"
    );
  }
  const target = event.target as HTMLAnchorElement;
  if (target) {
    target.setAttribute("aria-current", "page");
    target.parentElement?.classList.add("fr-sidemenu__item--active");

    const anchor = document.querySelector(`#${id}`);
    if (anchor) {
      anchor.scrollIntoView();
      router.push({ hash: `#${id}` });
    }
  }
}
</script>

<template>
  <template v-if="report.data">
    <div class="main">
      <div class="sidebar">
        <nav class="fr-sidemenu" aria-label="Liste des pages">
          <div class="fr-sidemenu__inner">
            <button
              class="fr-sidemenu__btn"
              hidden
              aria-controls="fr-sidemenu-wrapper"
              aria-expanded="false"
            >
              Pages
            </button>
            <div id="fr-sidemenu-wrapper" class="fr-collapse">
              <div class="fr-sidemenu__title">Pages</div>
              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item fr-sidemenu__item--active">
                  <!-- FIXME: seems there is an issue with anchor links inside tabs -->
                  <a
                    class="fr-sidemenu__link"
                    :href="`#${getPageSlug(
                      report.data.context.samples[0].url
                    )}`"
                    target="_self"
                    aria-current="page"
                    @click="
                      updateActiveAnchorLink(
                        getPageSlug(report.data!.context.samples[0].url),
                        $event
                      )
                    "
                    >{{ report.data.context.samples[0].name }}</a
                  >
                </li>
                <li
                  v-for="page in report.data.context.samples.slice(1)"
                  :key="page.name"
                  class="fr-sidemenu__item"
                >
                  <a
                    class="fr-sidemenu__link"
                    :href="`#${getPageSlug(page.url)}`"
                    target="_self"
                    @click="
                      updateActiveAnchorLink(getPageSlug(page.url), $event)
                    "
                    >{{ page.name }}</a
                  >
                  <a
                    class="fr-sidemenu__link"
                    :href="`#${getPageSlug(page.url)}`"
                    target="_self"
                    >{{ page.name }}</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div class="fr-text--bold fr-text--xl fr-mb-2w filter-title">
          Filtres
        </div>
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-right fr-mb-3w"
          :disabled="disabledResetFilters"
          @click="resetFilters"
        >
          Réinitialiser les filtres
        </button>
        <!-- <div class="fr-form-group">
          <fieldset class="fr-fieldset">
            <legend
              id="checkboxes-hint-element-legend"
              class="fr-fieldset__legend fr-text--regular fr-text--bold"
            >
              Critères
            </legend>
            <div class="fr-fieldset__content">
              <div class="fr-checkbox-group">
                <input id="user-impact-filter-minor" type="checkbox" />
                <label class="fr-label" for="user-impact-filter-minor"
                  >Conformes (10)
                </label>
              </div>
              <div class="fr-checkbox-group">
                <input id="user-impact-filter-major" type="checkbox" />
                <label class="fr-label" for="user-impact-filter-major"
                  >Non conforme (34)
                </label>
              </div>
              <div class="fr-checkbox-group">
                <input id="user-impact-filter-blocking" type="checkbox" />
                <label class="fr-label" for="user-impact-filter-blocking"
                  >Non applicable (56)
                </label>
              </div>
            </div>
          </fieldset>
        </div> -->
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
                <label class="fr-label" for="user-impact-filter-minor"
                  >Mineur (10)
                  <span class="fr-hint-text"
                    >Gêne dans l’utilisation du site</span
                  >
                </label>
              </div>
              <div class="fr-checkbox-group">
                <input
                  id="user-impact-filter-major"
                  v-model="userImpactFilters"
                  :value="CriterionResultUserImpact.MAJOR"
                  type="checkbox"
                />
                <label class="fr-label" for="user-impact-filter-major"
                  >Majeur (16)
                  <span class="fr-hint-text"
                    >Compléxifie grandement l’utilisation du site</span
                  >
                </label>
              </div>
              <div class="fr-checkbox-group">
                <input
                  id="user-impact-filter-blocking"
                  v-model="userImpactFilters"
                  :value="CriterionResultUserImpact.BLOCKING"
                  type="checkbox"
                />
                <label class="fr-label" for="user-impact-filter-blocking"
                  >Bloquant (8)
                  <span class="fr-hint-text"
                    >Empêche totalement l’utilisation du site</span
                  >
                </label>
              </div>
              <div class="fr-checkbox-group">
                <input
                  id="user-impact-filter-unknown"
                  v-model="userImpactFilters"
                  :value="null"
                  type="checkbox"
                />
                <label class="fr-label" for="user-impact-filter-unknown"
                  >Non renseigné
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div>
        <div class="fr-mb-6w header">
          <span class="fr-mb-0 fr-text--xl fr-text--bold"
            >{{ report.data.errorCount }} résultats</span
          >
          <button class="fr-btn fr-btn--tertiary-no-outline" @click="expandAll">
            Tout déplier
          </button>
        </div>
        <section v-for="page in errors" :key="page.pageUrl" class="fr-mb-8w">
          <h2
            :id="`${getPageSlug(page.pageUrl as string)}`"
            class="fr-mb-4w fr-h3 page-title"
          >
            {{ page.pageName }}
          </h2>

          <div
            v-for="(topic, i) in page.topics"
            :key="topic.topic"
            :class="{ 'fr-mt-9v': i !== 0 }"
          >
            <p class="fr-tag fr-tag--sm fr-mb-3w">
              {{ topic.name }}
            </p>
            <template v-for="(error, j) in topic.errors" :key="j">
              <p
                :class="[
                  'fr-text--lg fr-text--bold criterium-title',
                  { 'fr-mt-9v': j !== 0 },
                ]"
              >
                {{ error.topic }}.{{ error.criterium }}&nbsp;
                <span
                  v-html="getCriteriumTitle(error.topic, error.criterium)"
                />
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
                        error.userImpact === CriterionResultUserImpact.BLOCKING,
                    }"
                  >
                    Impact {{ formatUserImpact(error.userImpact) }}
                  </p>
                </li>
              </ul>

              <!-- Error -->
              <!-- TODO: complete condition to include example images -->
              <LazyAccordion
                v-if="error.errorDescription"
                title="Description de l'erreur"
              >
                <p class="fr-mb-3w">
                  {{ error.errorDescription }}
                </p>
                <!-- <p class="fr-text--xs fr-mb-1w error-accordion-subtitle">
                  Exemple(s) d’erreur(s)
                </p>
                <div class="fr-container--fluid">
                  <div class="fr-grid-row fr-grid-row--gutters">
                    <div class="fr-col-md-6 fr-col-12">
                      <img
                        style="width: 100%"
                        src="https://picsum.photos/id/123/300/200"
                        alt=""
                      />
                    </div>
                    <div class="fr-col-md-6 fr-col-12">
                      <img
                        style="width: 100%"
                        src="https://picsum.photos/id/43/300/200"
                        alt=""
                      />
                    </div>
                  </div>
                </div> -->
                <p
                  class="fr-text--xs fr-mt-3w fr-mb-1w error-accordion-subtitle"
                >
                  URL de la page concernée
                </p>
                <p class="fr-mb-0">
                  <a href="https://example.com" target="_blank" class="fr-link"
                    >https://example.com</a
                  >
                </p>
              </LazyAccordion>

              <!-- Recommendation -->
              <LazyAccordion
                v-if="error.recommandation"
                title="Recommandation de correction"
              >
                <p class="fr-mb-0">
                  {{ error.recommandation }}
                </p>
              </LazyAccordion>

              <!-- Tests -->
              <CriteriumTestsAccordion
                :topic-number="error.topic"
                :criterium="getCriterium(error.topic, error.criterium)"
              />
            </template>
          </div>
        </section>
      </div>
    </div>
  </template>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.filter-title {
  color: var(--text-title-grey);
}

.main {
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 2rem;
}

.sidebar {
  box-shadow: inset -1px 0 0 0 var(--border-default-grey);
}

.page-title {
  color: var(--text-active-blue-france);
}

.criterium-title {
  color: var(--text-title-grey);
}

.error-accordion-subtitle {
  color: var(--text-mention-grey);
}

.fr-sidemenu__inner {
  box-shadow: none !important;
}

@media (max-width: 768px) {
  .main {
    grid-template-columns: 1fr;
  }

  .sidebar {
    box-shadow: none;
  }
}
</style>
