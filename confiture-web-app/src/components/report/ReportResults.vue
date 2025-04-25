<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useUniqueId } from "../../composables/useUniqueId";
import { REFERENTIAL, TabSlug } from "../../enums";
import { useReportStore } from "../../store";
import { AuditStatus, AuditType } from "../../types";
import { getAuditStatus, pluralize, slugify } from "../../utils";
import { StatDonutTheme } from "../StatDonut.vue";
import SummaryCard from "../SummaryCard.vue";

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

const accordionUniqueId = useUniqueId();

const report = useReportStore();

const stats = computed(() => {
  return [
    ...(report.data?.auditType === AuditType.FULL
      ? [
          {
            title: "Taux global de conformité",
            description: auditInProgress.value
              ? "Disponible à la fin de l’audit"
              : REFERENTIAL,
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
      title: "Critères non conformes",
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
      title: "Critères conformes",
      description: `Sur ${report.data?.criteriaCount.applicable} ${pluralize(
        "critère applicable",
        "critères applicables",
        report.data!.criteriaCount.applicable
      )}`,
      value: report.data?.criteriaCount.compliant,
      total: report.data?.criteriaCount.applicable,
      theme: "green" as StatDonutTheme
    }
  ];
});

const pageDistributionTableData = {
  title: "Répartition des critères par pages",
  data: [
    ["Pages", "Critères conformes", "Critères non conformes"],
    ...(report.data
      ? report.data.pageDistributions.slice(1).map((p) => {
          return [
            p.name,
            Math.round(p.compliant.raw),
            Math.round(p.notCompliant.raw)
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
            Math.round(t.compliant.raw),
            Math.round(t.notCompliant.raw),
            Math.round(t.notApplicable.raw)
          ];
        })
      : [])
  ]
};

const auditInProgress = computed(
  () => !!report.data && getAuditStatus(report.data) === AuditStatus.IN_PROGRESS
);

const transverseNotCompliantCount = computed(() => {
  return report.data?.pageDistributions[0].notCompliant.raw;
});
</script>

<template>
  <template v-if="report.data">
    <h2>Synthèse des résultats</h2>

    <div class="report-metrics">
      <SummaryCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :description="stat.description"
        :value="stat.value!"
        :unit="stat.unit"
        :theme="stat.theme"
        :disabled="stat.disabled"
      />
      <section class="fr-accordion report-card-details-accordion">
        <div class="fr-accordion__title">
          <button
            class="fr-accordion__btn"
            aria-expanded="false"
            :aria-controls="`accordion-${accordionUniqueId}`"
          >
            En savoir plus sur le calcul du taux
          </button>
        </div>
        <div :id="`accordion-${accordionUniqueId}`" class="fr-collapse">
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
        </div>
      </section>
    </div>

    <div class="wrapper">
      <h2 class="fr-mt-8w">Détails des résultats</h2>

      <!-- Per page -->
      <h3 :id="slugify(pageDistributionTableData.title)" class="fr-h4 fr-mb-3w">
        {{ pageDistributionTableData.title }}
      </h3>

      <div class="fr-table fr-table--no-caption fr-mb-3v">
        <div class="fr-table__wrapper">
          <div class="fr-table__container">
            <div class="fr-table__content">
              <table class="fr-cell--multiline">
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
                          report.data.context.samples.find(
                            (s) => s.name === row[0]
                          )?.url
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
        </div>
      </div>

      <div v-if="transverseNotCompliantCount" class="fr-callout fr-mb-6w">
        <p class="fr-callout__text fr-text--md fr-mb-2w">
          <strong>{{ transverseNotCompliantCount }}</strong>
          {{ pluralize("critère", "critères", transverseNotCompliantCount) }}
          non
          {{ pluralize("conforme", "conformes", transverseNotCompliantCount) }}
          concernent des éléments transverses à toutes les pages de
          l’échantillon.
        </p>
        <RouterLink
          :to="{
            name: 'report-full',
            params: {
              uniqueId,
              tabSlug: TabSlug.REPORT_ERRORS_SLUG
            },
            hash: `#${TabSlug.AUDIT_COMMON_ELEMENTS_SLUG}`
          }"
          class="fr-link fr-link--sm"
          >Voir
          {{
            pluralize(
              "le critère non conforme transverse",
              "les critères non conformes transverses",
              transverseNotCompliantCount
            )
          }}</RouterLink
        >
      </div>

      <!-- Per topic -->
      <h3
        :id="slugify(topicDistributionTableData.title)"
        class="fr-h4 fr-mb-3w"
      >
        {{ topicDistributionTableData.title }}
      </h3>

      <div class="fr-table fr-table--no-caption fr-m-0">
        <div class="fr-table__wrapper">
          <div class="fr-table__container">
            <div class="fr-table__content">
              <table class="fr-cell--multiline">
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
                    v-for="(row, i) in report.data.topicDistributions.map(
                      (t, i) => {
                        return [
                          `${i + 1}. ${t.name}`,
                          `${Math.round(t.compliant.raw)}`,
                          `${Math.round(t.notCompliant.raw)}`,
                          `${Math.round(t.notApplicable.raw)}`
                        ];
                      }
                    )"
                    :key="i"
                  >
                    <td v-for="data in row" :key="data">{{ data }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.wrapper {
  max-width: 46rem;
}

.report-metrics {
  display: grid;
  grid-template-columns: repeat(v-bind("stats.length"), 1fr);
  gap: 0 1rem;

  @media (width < 62rem) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.report-card-details-accordion {
  margin-top: -1px;
  border-inline: 1px solid var(--border-default-grey);

  @media (width < 62rem) {
    grid-row: 2;
    margin-top: calc(-1rem - 1px);
  }
}
</style>
