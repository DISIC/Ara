<script setup lang="ts">
import { computed } from "vue";
import slugify from "slugify";

import { useReportStore } from "../store";
import SummaryCard from "./SummaryCard.vue";
import ResultDetailsCard from "./ResultDetailsCard.vue";
import ChartLegend from "./ChartLegend.vue";
import PieChart from "./PieChart.vue";
import StackBarChart from "./StackBarChart.vue";

const report = useReportStore();

const stats = computed(() => {
  return [
    {
      title: "D’accessibilité",
      description: "Taux global de conformité au RGAA",
      value: report.data!.accessibilityRate,
      total: 100,
      unit: "%",
    },
    {
      title: "Erreurs d’accessibilité",
      description: `Dont ${
        report.data!.blockingErrorCount
      } bloquantes pour l’usager`,
      value: report.data!.errorCount,
      total: 200, // TODO
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
  resultDistribution: "Répartition des critères par résutats",
  pageDistribution: "Répartition des critères par pages",
  topicDistribution: "Répartition des critères par thématiques",
};

const resultDistributionPercentages = computed(() => {
  const total =
    report.data!.resultDistribution.compliant +
    report.data!.resultDistribution.notCompliant +
    report.data!.resultDistribution.notApplicable;
  const compliant = Math.round(
    (report.data!.resultDistribution.compliant / total) * 100
  );
  const notCompliant = Math.round(
    (report.data!.resultDistribution.notCompliant / total) * 100
  );
  const notApplicable = Math.round(
    (report.data!.resultDistribution.notApplicable / total) * 100
  );

  return {
    compliant,
    notCompliant,
    notApplicable,
  };
});

const pageDistributionDescription = computed(() => {
  return report
    .data!.pageDistributions.map((el) => {
      const total = el.compliant + el.notCompliant + el.notApplicable;
      const compliant = Math.round((el.compliant / total) * 100);
      const notCompliant = Math.round((el.notCompliant / total) * 100);
      const notApplicable = Math.round((el.notApplicable / total) * 100);

      return `Page "${el.name}" : ${compliant}% de critères conformes,
      ${notCompliant}% de critères non conformes
      et ${notApplicable}% de critères non applicables.`;
    })
    .join(" ");
});

const topicDistributionDescription = computed(() => {
  return report
    .data!.topicDistributions.map((el) => {
      const total = el.compliant + el.notCompliant + el.notApplicable;
      const compliant = Math.round((el.compliant / total) * 100);
      const notCompliant = Math.round((el.notCompliant / total) * 100);
      const notApplicable = Math.round((el.notApplicable / total) * 100);

      return `Thématique "${el.name}" : ${compliant}% de critères conformes,
      ${notCompliant}% de critères non conformes
      et ${notApplicable}% de critères non applicables.`;
    })
    .join(" ");
});
</script>

<template>
  <template v-if="report.data">
    <h2>Synthèse des résultats</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="fr-col-12 fr-col-lg-4"
      >
        <SummaryCard
          :title="stat.title"
          :description="stat.description"
          :value="stat.value"
          :total="stat.total"
          :unit="stat.unit"
          :danger="stat.danger"
        />
      </div>
    </div>

    <h2 class="fr-mt-8w">Détails des résultats</h2>

    <ResultDetailsCard
      class="fr-mb-6w result-card"
      :title="chartsName.resultDistribution"
      accordion-title="En savoir plus"
    >
      <div class="card-content">
        <ChartLegend class="card-legend" />
        <PieChart
          :compliant="report.data.resultDistribution.compliant"
          :not-compliant="report.data.resultDistribution.notCompliant"
          :not-applicable="report.data.resultDistribution.notApplicable"
          :aria-labelledby="slugify(chartsName.resultDistribution)"
          aria-describedby="result-distribution-description"
          role="img"
        />
      </div>

      <template #accordion>
        <ul id="result-distribution-description">
          <li>
            {{ resultDistributionPercentages.compliant }}% de critères conformes
          </li>
          <li>
            {{ resultDistributionPercentages.notCompliant }}% de critères non
            conformes
          </li>
          <li>
            {{ resultDistributionPercentages.notApplicable }}% de critères non
            applicables
          </li>
        </ul>
      </template>
    </ResultDetailsCard>

    <ResultDetailsCard
      class="fr-mb-6w result-card"
      :title="chartsName.pageDistribution"
      accordion-title="En savoir plus"
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
      </div>

      <!-- TODO: use lists once content will be pre-formatted -->
      <template #accordion>
        <span id="page-distribution-description">
          {{ pageDistributionDescription }}
        </span>
      </template>
    </ResultDetailsCard>

    <ResultDetailsCard
      class="result-card"
      :title="chartsName.topicDistribution"
      accordion-title="En savoir plus"
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
      </div>

      <!-- TODO: use lists once content will be pre-formatted -->
      <template #accordion>
        <span id="topic-distribution-description">
          {{ topicDistributionDescription }}
        </span>
      </template>
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
