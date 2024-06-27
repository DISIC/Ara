<script setup lang="ts">
import { groupBy, mapValues, sortBy, uniqWith } from "lodash-es";
import { marked } from "marked";
import { computed } from "vue";

import rgaa from "../../criteres.json";
import { useReportStore } from "../../store";
import { AuditReport, CriteriumResultStatus } from "../../types";
import { pluralize } from "../../utils";
import MarkdownRenderer from "../ui/MarkdownRenderer.vue";

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
      report.data?.results.filter((r) => {
        return (
          [
            CriteriumResultStatus.COMPLIANT,
            CriteriumResultStatus.NOT_APPLICABLE
          ].includes(r.status) && !r.transverse
        );
      }),
      "pageId"
    )
  } as Record<number, AuditReport["results"]>;

  const data = sortBy(
    Object.entries(resultsGroupedByPage).map(([pageId, results]) => {
      return {
        pageId: Number(pageId),
        pageOrder: getPage(pageId).order,
        pageName: getPage(pageId).name,
        pageUrl: getPage(pageId).url,
        topics: sortBy(
          Object.values(
            mapValues(groupBy(results, "topic"), (results, topicNumber) => {
              return {
                topic: Number(topicNumber),
                name: getTopicName(Number(topicNumber)),
                errors: sortBy(
                  results.filter(
                    (r) =>
                      !r.transverse &&
                      (r.compliantComment || r.notApplicableComment)
                  ),
                  "criterium"
                ).map((r) => {
                  return {
                    ...r,
                    comment:
                      r.status === CriteriumResultStatus.COMPLIANT
                        ? r.compliantComment
                        : r.notApplicableComment
                  };
                })
              };
            })
          ),
          "topic"
        )
      };
    }),
    (el) => el.pageOrder
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
              [
                CriteriumResultStatus.COMPLIANT,
                CriteriumResultStatus.NOT_APPLICABLE
              ].includes(r.status)
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
          errors: results.map((r) => {
            return {
              ...r,
              comment:
                r.status === CriteriumResultStatus.COMPLIANT
                  ? r.compliantComment
                  : r.notApplicableComment
            };
          })
        };
      }
    )
  );
});

const displayedErrorCount = computed(() => {
  return (
    errors.value.map((page) => page.topics.map((topic) => topic.errors)).flat(2)
      .length + transverseErrors.value.length
  );
});

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
  <template v-if="report.data">
    <div class="main">
      <div class="sidebar">
        <nav class="fr-sidemenu fr-mb-3w" aria-label="Liste des pages">
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
              <div class="fr-sidemenu__title fr-mb-2w">Pages</div>
              <ul class="fr-sidemenu__list">
                <li
                  v-if="transverseErrors.length"
                  :class="[
                    'fr-sidemenu__item',
                    {
                      'fr-sidemenu__item--active': Boolean(
                        transverseErrors.length
                      )
                    }
                  ]"
                >
                  <a
                    class="fr-sidemenu__link"
                    href="#all-pages"
                    :aria-current="Boolean(transverseErrors.length)"
                    >Toutes les pages</a
                  >
                </li>
                <li
                  :class="[
                    'fr-sidemenu__item',
                    {
                      'fr-sidemenu__item--active': !Boolean(
                        transverseErrors.length
                      )
                    }
                  ]"
                >
                  <a
                    class="fr-sidemenu__link"
                    :href="`#${errors[0].pageId}`"
                    :aria-current="
                      !transverseErrors.length ? 'true' : undefined
                    "
                    >{{ errors[0].pageName }}</a
                  >
                </li>
                <li
                  v-for="page in errors.slice(1)"
                  :key="page.pageName"
                  class="fr-sidemenu__item"
                >
                  <a class="fr-sidemenu__link" :href="`#${page.pageId}`">
                    {{ page.pageName }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div>
        <div class="fr-mb-6w header">
          <div role="alert" aria-live="polite">
            <p class="fr-mb-0 fr-text--xl fr-text--bold">
              {{ displayedErrorCount }}
              {{ pluralize("résultat", "résultats", displayedErrorCount) }}
            </p>
          </div>
        </div>

        <section v-if="!transverseErrors.length && !errors.length">
          <h2 class="fr-h6 fr-mb-1w">
            Aucun résultat ne correspond à votre recherche
          </h2>
          <p>Veuillez sélectionner au moins un filtre "impact de l'erreur".</p>
        </section>

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
              {{ i + 1 }}.&nbsp;{{ topic.name }}
            </p>
            <template v-for="(error, j) in topic.errors" :key="j">
              <p
                :class="[
                  'fr-text--lg fr-text--bold criterium-title',
                  { 'fr-mt-9v': j !== 0 }
                ]"
              >
                {{ error.topic }}.{{ error.criterium }}&nbsp;
                <span
                  v-html="getCriteriumTitle(error.topic, error.criterium)"
                />
              </p>

              <MarkdownRenderer
                v-if="error.comment"
                :markdown="error.comment"
              />
            </template>
          </div>
        </section>
        <section v-for="page in errors" :key="page.pageId" class="fr-mb-8w">
          <h2 :id="`${page.pageId}`" class="fr-h3 fr-mb-2w page-title">
            {{ page.pageName }}
          </h2>
          <a
            :href="page.pageUrl"
            class="fr-link page-url"
            target="_blank"
            rel="noopener"
          >
            {{ page.pageUrl }} <span class="sr-only">(nouvelle fenêtre)</span>
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
              {{ i + 1 }}.&nbsp;{{ topic.name }}
            </p>
            <template v-for="(error, j) in topic.errors" :key="j">
              <p
                :class="[
                  'fr-text--lg fr-text--bold criterium-title',
                  { 'fr-mt-9v': j !== 0 }
                ]"
              >
                {{ error.topic }}.{{ error.criterium }}&nbsp;
                <span
                  v-html="getCriteriumTitle(error.topic, error.criterium)"
                />
              </p>

              <MarkdownRenderer
                v-if="error.comment"
                :markdown="error.comment"
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

.page-url {
  word-break: break-all;
}

.criterium-title {
  color: var(--text-title-grey);
}

.fr-sidemenu__inner {
  box-shadow: none !important;
}

@media (width < 48rem) {
  .main {
    grid-template-columns: 1fr;
  }

  .sidebar {
    box-shadow: none;
  }
}
</style>
