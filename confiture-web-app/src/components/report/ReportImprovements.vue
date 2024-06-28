<script setup lang="ts">
import { useReportStore } from "../../store";
import {
  getReportImprovements,
  getReportTransverseImprovements
} from "./getReportImprovements";
import ReportCriteria from "./ReportCriteria.vue";
import ReportImprovementCriterium from "./ReportImprovementCriterium.vue";

const report = useReportStore();
</script>

<template>
  <ReportCriteria
    v-if="report.data"
    :pages-data="getReportImprovements(report)"
    :transverse-data="getReportTransverseImprovements(report)"
  >
    <template #transverse-data>
      <section class="fr-mb-8w">
        <h2 id="all-pages" class="fr-h3 fr-mb-2w page-title">
          Toutes les pages
        </h2>

        <div
          v-for="(topic, i) in getReportTransverseImprovements(report)"
          :key="topic.number"
          :class="{ 'fr-mt-9v': i !== 0 }"
        >
          <p class="fr-tag fr-tag--sm fr-mb-3v">
            {{ topic.number }}.&nbsp;{{ topic.name }}
          </p>

          <ReportImprovementCriterium
            v-for="(improvement, j) in topic.improvements"
            :key="j"
            :class="j === 0 ? null : 'fr-mt-9v'"
            :topic="improvement.topic"
            :criterium="improvement.criterium"
            :comment="improvement.comment!"
            :status="improvement.status"
          />
        </div>
      </section>
    </template>

    <template #pages-data>
      <section
        v-for="page in getReportImprovements(report)"
        :key="page.id"
        class="fr-mb-8w"
      >
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
