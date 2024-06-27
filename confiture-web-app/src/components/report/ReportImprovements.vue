<script setup lang="ts">
import { groupBy, mapValues, uniqWith } from "lodash-es";
import { computed } from "vue";

import rgaa from "../../criteres.json";
import { useReportStore } from "../../store";
import { CriteriumResultStatus } from "../../types";
import ReportCriteria from "./ReportCriteria.vue";
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
          )
            .map(([topic, results]) => {
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
            .filter((t) => t.improvements.length)
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
const transverseImprovements = computed(() => {
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
          number: Number(topicNumber),
          name: getTopicName(Number(topicNumber)),
          errors: results.map((r) => {
            return {
              topic: r.topic,
              criterium: r.criterium,
              status: r.status,
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

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}
</script>

<template>
  <ReportCriteria
    v-if="report.data"
    :pages-data="pages"
    :transverse-data="transverseImprovements"
  >
    <template #transverse-data>
      <section class="fr-mb-8w">
        <h2 id="all-pages" class="fr-h3 fr-mb-2w page-title">
          Toutes les pages
        </h2>

        <div
          v-for="(topic, i) in transverseImprovements"
          :key="topic.number"
          :class="{ 'fr-mt-9v': i !== 0 }"
        >
          <p class="fr-tag fr-tag--sm fr-mb-3v">
            {{ topic.number }}.&nbsp;{{ topic.name }}
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
    </template>

    <template #pages-data>
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
            {{ topic.number }}.&nbsp;{{ topic.name }}
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
    </template>
  </ReportCriteria>
</template>
