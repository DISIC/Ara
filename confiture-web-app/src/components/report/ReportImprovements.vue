<script setup lang="ts">
import { computed } from "vue";

import { StaticTabLabel, TabSlug } from "../../enums";
import { useReportStore } from "../../store";
import { pluralize } from "../../utils";
import { getReportImprovements } from "./getReportImprovements";
import ReportCriteria from "./ReportCriteria.vue";
import ReportImprovementCriterium from "./ReportImprovementCriterium.vue";

const report = useReportStore();

const transverseImprovements = computed(() => {
  return getReportImprovements(report)[0];
});

const pagesImprovements = computed(() => {
  return getReportImprovements(report)
    .slice(1)
    .filter((p) => p.topics.length > 0);
});

const improvementsCount = computed(() => {
  return getReportImprovements(report)
    .map((page: any) => page.topics.map((topic: any) => topic.improvements))
    .flat(2).length;
});
</script>

<template>
  <ReportCriteria
    v-if="report.data"
    top-notice="Ci-dessous les commentaires de l’auditeur ou de l’auditrice concernant des critères conformes ou non applicables."
    :count="`${improvementsCount} ${pluralize(
      'point d’amélioration',
      'points d’amélioration',
      improvementsCount
    )}`"
    :pages-data="pagesImprovements"
    :transverse-data="transverseImprovements"
  >
    <template #transverse-data>
      <h2 class="fr-sr-only">
        {{ StaticTabLabel.REPORT_IMPROVEMENTS_TAB_LABEL }}
      </h2>
      <section v-if="transverseImprovements.topics.length > 0" class="fr-mb-8w">
        <h3
          :id="TabSlug.AUDIT_COMMON_ELEMENTS_SLUG"
          class="fr-h3 fr-mb-2w page-title"
        >{{ StaticTabLabel.AUDIT_COMMON_ELEMENTS_TAB_LABEL }}</h3>
        <ul
          v-if="report.data.transverseElements.length"
          class="fr-tags-group fr-mb-5v"
        >
          <li v-for="(tag, i) in report.data.transverseElements" :key="i">
            <p class="fr-tag">{{ tag }}</p>
          </li>
        </ul>

        <div
          v-for="(topic, i) in transverseImprovements.topics"
          :key="topic.number"
        >
          <template v-for="(improvement, j) in topic.improvements" :key="j">
            <ReportImprovementCriterium
              :topic="topic.number"
              :criterium="improvement.criterium"
              :comment="improvement.comment!"
              :status="improvement.status"
            />

            <hr
              v-if="
                i !== transverseImprovements.topics.length - 1 ||
                  j !== topic.improvements.length - 1
              "
              class="fr-mt-4w fr-pb-4w"
            />
          </template>
        </div>
      </section>
    </template>

    <template #pages-data>
      <section
        v-for="(page, i) in pagesImprovements"
        :key="page.id"
        :class="{ 'fr-mb-8w': i !== pagesImprovements.length - 1 }"
      >
        <h3 :id="`page_${page.id}`" class="fr-h3 fr-mb-2w page-title">
          {{ page.name }}
        </h3>
        <a
          :href="page.url"
          class="fr-link page-url"
          target="_blank"
          rel="noopener"
        >
          {{ page.url }} <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </a>

        <div
          v-for="(topic, j) in page.topics"
          :key="topic.number"
          :class="{ 'fr-mt-4w': j === 0 }"
        >
          <template v-for="(improvement, k) in topic.improvements" :key="k">
            <ReportImprovementCriterium
              :topic="topic.number"
              :criterium="improvement.criterium"
              :comment="improvement.comment!"
              :status="improvement.status"
            />

            <hr
              v-if="
                j !== page.topics.length - 1 ||
                  k !== topic.improvements.length - 1
              "
              class="fr-mt-4w fr-pb-4w"
            />
          </template>
        </div>
      </section>
    </template>

  </ReportCriteria>
</template>
