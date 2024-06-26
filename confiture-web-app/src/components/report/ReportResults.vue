<script setup lang="ts">
import { computed } from "vue";

import { useReportStore } from "../../store";
import { AuditStatus, AuditType } from "../../types";
import { getAuditStatus, pluralize, slugify } from "../../utils";
import { StatDonutTheme } from "../StatDonut.vue";
import SummaryCard from "../SummaryCard.vue";

const report = useReportStore();

const stats = computed(() => {
  return [
    ...(report.data?.auditType === AuditType.FULL
      ? [
          {
            title: "Taux global de conformité",
            description: auditInProgress.value
              ? "(Disponible à la fin de l’audit)"
              : "RGAA version 4.1",
            value: auditInProgress.value ? 0 : report.data?.accessibilityRate,
            total: 100,
            unit: "%",
            hasDetails: true,
            theme: "blue" as StatDonutTheme,
            disabled: auditInProgress.value
          }
        ]
      : []),

    {
      title: "Critères<br/> non conformes",
      description: `Dont ${report.data?.criteriaCount.blocking} ${pluralize(
        "bloquant",
        "bloquants",
        report.data!.criteriaCount.blocking
      )} pour l’usager`,
      value: report.data?.criteriaCount.notCompliant,
      total: report.data?.criteriaCount.applicable,
      danger: true,
      theme: "red" as StatDonutTheme
    },
    {
      title: "Critères<br/> conformes",
      value: report.data?.criteriaCount.compliant,
      total: report.data?.criteriaCount.total,
      theme: "green" as StatDonutTheme
    }
  ];
});

const pageDistributionTableData = {
  title: "Répartition des critères par pages",
  data: [
    ["Pages", "Critères conformes", "Critères non conformes"],
    ...(report.data
      ? report.data.pageDistributions.map((p) => {
          return [
            p.name,
            `${Math.round(p.compliant.raw)}`,
            `${Math.round(p.notCompliant.raw)}`
          ];
        })
      : [])
  ]
};

const topicDistributionTableData = {
  title: "Répartition des critères par thématiques du RGAA",
  data: [
    [
      "Thématiques du RGAA",
      "Critères conformes",
      "Critères non conformes",
      "Critères non applicables"
    ],
    ...(report.data
      ? report.data.topicDistributions.map((t, i) => {
          return [
            `${i + 1}. ${t.name}`,
            `${Math.round(t.compliant.raw)}`,
            `${Math.round(t.notCompliant.raw)}`,
            `${Math.round(t.notApplicable.raw)}`
          ];
        })
      : [])
  ]
};

const auditInProgress = computed(
  () => !!report.data && getAuditStatus(report.data) === AuditStatus.IN_PROGRESS
);
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
          :value="stat.value!"
          :total="stat.total!"
          :unit="stat.unit"
          :theme="stat.disabled ? 'grey' : stat.theme"
          :disabled="stat.disabled"
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

    <!-- Per page -->
    <h3 :id="slugify(pageDistributionTableData.title)" class="fr-h4 fr-mb-3w">
      {{ pageDistributionTableData.title }}
    </h3>

    <div class="fr-p-4w fr-mb-6w table-wrapper">
      <div class="fr-table fr-table--no-caption fr-table--bordered fr-mb-0">
        <table>
          <caption>
            {{
              pageDistributionTableData.title
            }}
          </caption>
          <thead>
            <tr>
              <th
                v-for="header in pageDistributionTableData.data[0]"
                :key="header"
                scope="col"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in pageDistributionTableData.data.slice(1)"
              :key="i"
            >
              <td>
                <a
                  :href="
                    report.data.context.samples.find((s) => s.name === row[0])
                      ?.url
                  "
                  target="_blank"
                  class="fr-text--bold"
                >
                  {{ row[0] }}
                </a>
              </td>
              <td v-for="data in row.slice(1)" :key="data">{{ data }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Per topic -->
    <h3 :id="slugify(topicDistributionTableData.title)" class="fr-h4 fr-mb-3w">
      {{ topicDistributionTableData.title }}
    </h3>

    <div class="fr-p-4w table-wrapper">
      <div class="fr-table fr-table--no-caption fr-table--bordered fr-mb-0">
        <table>
          <caption>
            {{
              topicDistributionTableData.title
            }}
          </caption>
          <thead>
            <tr>
              <th
                v-for="header in [
                  'Thématique du RGAA',
                  'Critères conformes',
                  'Critères non conformes',
                  'Critères non applicables'
                ]"
                :key="header"
                scope="col"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in report.data.topicDistributions.map((t, i) => {
                return [
                  `${i + 1}. ${t.name}`,
                  `${Math.round(t.compliant.raw)}`,
                  `${Math.round(t.notCompliant.raw)}`,
                  `${Math.round(t.notApplicable.raw)}`
                ];
              })"
              :key="i"
            >
              <td v-for="data in row" :key="data">{{ data }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>

<style scoped>
.table-wrapper {
  border: 1px solid var(--border-default-grey);
  max-width: 49.5rem;
}

/* To avoid JS based MQ, we replicate `fr-table--layout-fixed` */
.fr-table table {
  display: table;
  table-layout: fixed;
}

@media (width < 36rem) {
  .fr-table table {
    display: block;
  }
}
</style>
