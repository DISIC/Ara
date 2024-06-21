<script setup lang="ts">
import { groupBy, mapValues, uniqWith } from "lodash-es";
import { computed } from "vue";

import rgaa from "../../criteres.json";
import { useReportStore } from "../../store";
import { CriteriumResultStatus } from "../../types";
import { pluralize } from "../../utils";
import ReportImprovementCriterium from "./ReportImprovementCriterium.vue";

const report = useReportStore();

/**
 *
[
  {
    id: 0,
    url: 'https://example.com',
    order: 0,
    name: 'Ma page',
    topics: [
      {
        number: 1,
        name: 'Images',
        improvements: [
          {
            criterium: 1,
            comment: 'blabla'
          }
        ]
      }
    ]
  }
]
 */

const pages = computed(() => {
  return (
    report.data?.context.samples
      .map((el) => {
        return {
          ...el,
          topics: Object.entries(
            groupBy(
              report.data?.results.filter((r) => {
                return r.pageId === el.id;
              }),
              "topic"
            )
          ).map(([topic, results]) => {
            return {
              number: Number(topic),
              name: getTopicName(Number(topic)),
              improvements: results
                .filter((r) => {
                  return (
                    !r.transverse &&
                    ((r.status === CriteriumResultStatus.COMPLIANT &&
                      r.compliantComment) ||
                      (r.status === CriteriumResultStatus.NOT_APPLICABLE &&
                        r.notApplicableComment))
                  );
                })
                .map((r) => {
                  return {
                    criterium: r.criterium,
                    status: r.status,
                    comment: r.compliantComment || r.notApplicableComment
                  };
                })
            };
          })
        };
      })
      .filter((p) => p.topics.length) || []
  );
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
    pages.value
      .map((page) => page.topics.map((topic) => topic.improvements))
      .flat(2).length + transverseErrors.value.length
  );
});

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
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
                    :href="`#${pages[0].id}`"
                    :aria-current="
                      !transverseErrors.length ? 'true' : undefined
                    "
                    >{{ pages[0].name }}</a
                  >
                </li>
                <li
                  v-for="page in pages.slice(1)"
                  :key="page.name"
                  class="fr-sidemenu__item"
                >
                  <a class="fr-sidemenu__link" :href="`#${page.id}`">
                    {{ page.name }}
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

        <section v-if="transverseErrors.length" class="fr-mb-8w">
          <h2 id="all-pages" class="fr-h3 fr-mb-2w page-title">
            Toutes les pages
          </h2>

          <div
            v-for="(topic, i) in transverseErrors"
            :key="topic.topic"
            :class="{ 'fr-mt-9v': i !== 0 }"
          >
            <p class="fr-tag fr-tag--sm fr-mb-3v">
              {{ i + 1 }}.&nbsp;{{ topic.name }}
            </p>
            <ReportImprovementCriterium
              v-for="(error, j) in topic.errors"
              :key="j"
              :class="j === 0 ? null : 'fr-mt-9v'"
              :topic="error.topic"
              :criterium="error.criterium"
              :comment="error.comment!"
              :status="error.status"
            />
          </div>
        </section>

        <section v-for="page in pages" :key="page.id" class="fr-mb-8w">
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

          <div
            v-for="(topic, i) in page.topics"
            :key="topic.number"
            :class="i === 0 ? 'fr-mt-4w' : 'fr-mt-9v'"
          >
            <p class="fr-tag fr-tag--sm fr-mb-3v">
              {{ i + 1 }}.&nbsp;{{ topic.name }}
            </p>
            <ReportImprovementCriterium
              v-for="(improvement, j) in topic.improvements"
              :key="j"
              :class="j === 0 ? null : 'fr-mt-9v'"
              :topic="topic.number"
              :criterium="improvement.criterium"
              :comment="improvement.comment!"
              :status="improvement.status"
            />
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
