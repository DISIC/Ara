<script setup lang="ts">
import { computed } from "vue";

import { useReportStore } from "../store";
import SummaryCard from "./SummaryCard.vue";
import ResultDetailsCard from "./ResultDetailsCard.vue";
import ChartLegend from "./ChartLegend.vue";
import PieChart from "./PieChart.vue";
import StackBarChart from "./StackBarChart.vue";

const report = useReportStore();

const stats = computed(() => [
  {
    title: "D’accessibilité",
    description: "Taux global de conformité au RGAA",
    value: report.data.accessibilityRate,
    total: 100,
    unit: "%",
  },
  {
    title: "Erreurs d’accessibilité",
    description: `Dont ${report.data.blockingErrorCount} bloquantes pour l’usager`,
    value: report.data.errorCount,
    total: 200, // TODO
    danger: true,
  },
  {
    title: "Critères applicables",
    description: `Sur un total de ${report.data.totalCriteriaCount} critères`,
    value: report.data.applicableCriteriaCount,
    total: report.data.totalCriteriaCount,
  },
]);
</script>

<template>
  <h2>Synthèse des résultats</h2>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div v-for="stat in stats" :key="stat.title" class="fr-col-12 fr-col-lg-4">
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
    title="Répartition des critères par résutats"
    accordion-title="En savoir plus"
  >
    <div class="card-content">
      <ChartLegend class="card-legend" />
      <PieChart
        :compliant="report.data.resultDistribution.compliant"
        :not-compliant="report.data.resultDistribution.notCompliant"
        :not-applicable="report.data.resultDistribution.notApplicable"
      />
    </div>

    <template #accordion>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus
      aspernatur commodi cupiditate a aut placeat consequatur sed exercitationem
      praesentium, corporis dolorem quas fugiat consequuntur quod illo eaque
      mollitia iusto alias!
    </template>
  </ResultDetailsCard>

  <ResultDetailsCard
    class="fr-mb-6w result-card"
    title="Répartition des critères par pages"
    accordion-title="En savoir plus"
  >
    <div class="card-content">
      <ChartLegend class="card-legend" />
      <div class="card-main">
        <StackBarChart :data="report.data.pageDistributions" />
      </div>
    </div>

    <template #accordion>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus
      aspernatur commodi cupiditate a aut placeat consequatur sed exercitationem
      praesentium, corporis dolorem quas fugiat consequuntur quod illo eaque
      mollitia iusto alias!
    </template>
  </ResultDetailsCard>

  <ResultDetailsCard
    class="result-card"
    title="Répartition des critères par thématiques"
    accordion-title="En savoir plus"
  >
    <div class="card-content">
      <ChartLegend class="card-legend" />
      <div class="card-main">
        <StackBarChart :data="report.data.topicDistributions" />
      </div>
    </div>

    <template #accordion>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus
      aspernatur commodi cupiditate a aut placeat consequatur sed exercitationem
      praesentium, corporis dolorem quas fugiat consequuntur quod illo eaque
      mollitia iusto alias!
    </template>
  </ResultDetailsCard>
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
