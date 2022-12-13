<script setup lang="ts">
import { computed } from "vue";

import { useReportStore } from "../store";
import { AuditType } from "../types";
import { slugify } from "../utils";
import ChartLegend from "./ChartLegend.vue";
import PieChart from "./PieChart.vue";
import ResultDetailsCard from "./ResultDetailsCard.vue";
import StackBarChart from "./StackBarChart.vue";
import SummaryCard from "./SummaryCard.vue";

const report = useReportStore();

const stats = computed(() => {
  return [
    ...(report.data?.auditType === AuditType.FULL
      ? [
          {
            title: "Conformité RGAA",
            description: "Taux global de conformité au RGAA",
            value: report.data!.accessibilityRate,
            total: 100,
            unit: "%",
            hasDetails: true,
          },
        ]
      : []),

    {
      title: "Erreurs d’accessibilité",
      description: `Dont ${
        report.data!.blockingErrorCount
      } bloquantes pour l’usager`,
      value: report.data!.errorCount,
      // FIXME: to confirm : error count is out of every criteria or only applicable criteria
      total:
        report.data!.totalCriteriaCount * report.data!.context.samples.length,
      danger: true,
    },
    {
      title: "Critères applicables",
      description: `Sur un total de ${
        report.data!.totalCriteriaCount
      } critères`,
      value: report.data!.applicableCriteriaCount,
      total: report.data!.totalCriteriaCount,
    },
  ];
});

const chartsName = {
  resultDistribution: "Répartition des critères par résultats",
  pageDistribution: "Répartition des critères par pages",
  topicDistribution: "Répartition des critères par thématiques",
};
</script>

<template>
  <template v-if="report.data">
    <h2>Synthèse des résultats</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="stat in stats"
        :key="stat.title"
        :class="`fr-col-12 fr-col-lg-${12 / stats.length}`"
      >
        <SummaryCard
          :title="stat.title"
          :description="stat.description"
          :value="stat.value"
          :total="stat.total"
          :unit="stat.unit"
          :danger="stat.danger"
        >
          <template v-if="stat.hasDetails" #accordion-title>
            En savoir plus sur le calcul du taux
          </template>
          <template v-if="stat.hasDetails" #accordion-content>
            <p>
              Le taux global de conformité au RGAA est calculé de la manière
              suivante :
            </p>

            <p class="fr-text--bold">C / (C + NC)</p>

            <p class="fr-m-0">
              <span class="fr-text--bold">C</span> = nombre de critères
              conformes<br />
              <span class="fr-text--bold">NC</span> = nombre de critères non
              conformes
            </p>
          </template>
        </SummaryCard>
      </div>
    </div>

    <h2 class="fr-mt-8w">Détails des résultats</h2>

    <ResultDetailsCard
      class="fr-mb-6w result-card"
      :title="chartsName.resultDistribution"
    >
      <div class="card-content">
        <ChartLegend class="card-legend" />
        <PieChart
          :compliant="report.data.resultDistribution.compliant.raw"
          :not-compliant="report.data.resultDistribution.notCompliant.raw"
          :not-applicable="report.data.resultDistribution.notApplicable.raw"
          :aria-labelledby="slugify(chartsName.resultDistribution)"
          aria-describedby="result-distribution-description"
          role="img"
        />
        <span id="result-distribution-description" class="sr-only">
          {{ Math.round(report.data.resultDistribution.compliant.percentage) }}%
          de critères conformes,
          {{
            Math.round(report.data.resultDistribution.notCompliant.percentage)
          }}% de critères non conformes,
          {{
            Math.round(report.data.resultDistribution.notApplicable.percentage)
          }}% de critères non applicables
        </span>
      </div>
    </ResultDetailsCard>

    <ResultDetailsCard
      class="fr-mb-6w result-card"
      :title="chartsName.pageDistribution"
    >
      <div class="card-content">
        <ChartLegend class="card-legend" />
        <div class="card-main">
          <StackBarChart
            :data="report.data.pageDistributions"
            :aria-labelledby="slugify(chartsName.pageDistribution)"
            aria-describedby="page-distribution-description"
            role="img"
          />
        </div>
        <span id="page-distribution-description" class="sr-only">
          <template
            v-for="page in report.data.pageDistributions"
            :key="page.name"
          >
            "{{ page.name }}" : {{ Math.round(page.compliant.percentage) }}% de
            critères conformes, {{ Math.round(page.notCompliant.percentage) }}%
            de critères non conformes et
            {{ Math.round(page.notApplicable.percentage) }}% de critères non
            applicables.
          </template>
        </span>
      </div>
    </ResultDetailsCard>

    <ResultDetailsCard
      class="result-card"
      :title="chartsName.topicDistribution"
    >
      <div class="card-content">
        <ChartLegend class="card-legend" />
        <div class="card-main">
          <StackBarChart
            :data="report.data.topicDistributions"
            :aria-labelledby="slugify(chartsName.topicDistribution)"
            aria-describedby="topic-distribution-description"
            role="img"
          />
        </div>
        <span id="topic-distribution-description" class="sr-only">
          <template
            v-for="topic in report.data.topicDistributions"
            :key="topic.name"
          >
            "{{ topic.name }}" : {{ Math.round(topic.compliant.percentage) }}%
            de critères conformes,
            {{ Math.round(topic.notCompliant.percentage) }}% de critères non
            conformes et {{ Math.round(topic.notApplicable.percentage) }}% de
            critères non applicables.
          </template>
        </span>
      </div>
    </ResultDetailsCard>
  </template>
</template>

<style scoped>
.result-card {
  max-width: 49.5rem;
}
.card-content {
  display: flex;
  gap: 3rem;
}

.card-legend {
  flex-shrink: 0;
}

.card-main {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 992px) {
  .card-content {
    flex-direction: column;
    gap: 0;
  }
}
</style>
