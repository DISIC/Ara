<script setup lang="ts">
import { computed } from "vue";

import { useReportStore } from "../store";
import SummaryCard from "./SummaryCard.vue";

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
</template>
