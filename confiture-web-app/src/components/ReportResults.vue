<script setup lang="ts">
import SummaryCard from "./SummaryCard.vue";

const stats = [
  {
    title: "D’accessibilité",
    description: "Taux global de conformité au RGAA",
    value: 90,
    total: 100,
    unit: "%",
  },
  {
    title: "Erreurs d’accessibilité",
    description: "Dont 8 bloquantes pour l’usager",
    value: 8,
    total: 34,
    danger: true,
  },
  {
    title: "Critères applicables",
    description: "Sur un total de 106 critères",
    value: 54,
    total: 106,
  },
];
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
