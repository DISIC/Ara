<script setup lang="ts">
import { sortBy } from "lodash-es";
import { computed, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

import AraTabs from "../../components/audit/AraTabs.vue";
import AuditGenerationFilters from "../../components/audit/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/audit/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useAuditStats } from "../../composables/useAuditStats";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditPage, AuditType, CriteriumResultStatus } from "../../types";
import { getCriteriaCount, pluralize } from "../../utils";
import { StatDonutTheme } from "../../components/StatDonut.vue";

const route = useRoute();

const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const resultsStore = useResultsStore();

/** Available topic filters and their global progression. */
const topics = computed(() => {
  if (!auditStore.currentAudit?.auditType) {
    return [];
  }

  return (
    rgaa.topics
      // hide topics not present in audit type
      .filter((topic) => {
        return CRITERIA_BY_AUDIT_TYPE[auditStore.currentAudit!.auditType!].find(
          (criterium) => criterium.topic === topic.number
        );
      })
      .map((topic) => {
        // Every results for the current topic
        const relevantResults =
          resultsStore.allResults?.filter(
            (result) => result.topic === topic.number
          ) ?? [];

        // number of criteria for the topic accross all pages
        const relevantCount = relevantResults.length;

        // number of tested criteria for the topic accross all pages
        const testedCount =
          relevantResults.filter(
            (result) => result.status !== CriteriumResultStatus.NOT_TESTED
          ).length ?? 0;

        return {
          title: topic.topic,
          number: topic.number,
          value: Math.round((testedCount / relevantCount) * 100)
        };
      })
  );
});

const auditIsInProgress = computed(() => resultsStore.auditProgress < 1);

function updateCurrentPageId(i: number) {
  const pageIdOrNull = auditStore.currentAudit?.pages.at(i)?.id ?? null;
  auditStore.updateCurrentPageId(pageIdOrNull);
}

const {
  complianceLevel,
  compliantCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount
} = useAuditStats();

const headerInfos = computed(() => [
  ...(auditStore.currentAudit?.auditType === AuditType.FULL
    ? [
        {
          title: "Taux global de conformité",
          description: auditIsInProgress.value
            ? "(Disponible à la fin de l’audit)"
            : "RGAA version 4.1",
          value: auditIsInProgress.value ? 0 : complianceLevel.value,
          total: 100,
          unit: "%",
          theme: auditIsInProgress.value
            ? ("grey" as StatDonutTheme)
            : ("blue" as StatDonutTheme),
          disabled: auditIsInProgress.value
        }
      ]
    : []),
  {
    title: "Critères<br/> non conformes",
    description: `Dont ${blockingCriteriaCount.value} ${pluralize(
      "bloquant",
      "bloquants",
      blockingCriteriaCount.value
    )} pour l’usager`,
    value: notCompliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType),
    theme: "red" as StatDonutTheme
  },
  {
    title: "Critères<br/> conformes",
    value: compliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType),
    theme: "green" as StatDonutTheme
  }
]);

onBeforeRouteLeave(() => {
  auditStore.showAuditEmailAlert = false;
});

const showFilters = ref(true);

function toggleFilters(value: boolean) {
  showFilters.value = value;
}

const filterStore = useFiltersStore();
const filterResultsCount = computed(() =>
  filterStore.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0)
);

watch(
  () => auditStore.currentAudit?.pages,
  (curr, prev) => {
    if (curr && !prev) {
      auditStore.currentPageId = auditStore.currentAudit!.pages[0].id;
    }
  }
);

const pageTitle = computed(() => {
  // Audit XXX - Page en cours « XXX » - X résultats pour « XXX »
  if (auditStore.currentAudit) {
    let title = `Audit ${auditStore.currentAudit.procedureName}`;

    const tabName = ` - Page en cours « ${auditStore.currentAudit.pages.find(
      (p) => p.id === auditStore.currentPageId
    )?.name} »`;

    title += tabName;

    if (filterStore.search) {
      const results = ` - ${filterResultsCount.value} ${pluralize(
        "résultat",
        "résultats",
        filterResultsCount.value
      )} pour « ${filterStore.search} »`;

      title += results;
    }

    return title;
  }

  return "";
});

type TabData = { label: string; data: AuditPage };

const tabsData = computed((): TabData[] => {
  return sortBy(
    auditStore.currentAudit?.pages.map((p) => ({
      label: p.name,
      data: p
    })) ?? [],
    (p) => p.data.order
  );
});
</script>

<template>
  <!-- FIXME: handle loading states -->
  <div v-if="auditStore.currentAudit && resultsStore.data" class="page-wrapper">
    <PageMeta
      :title="pageTitle"
      description="Réalisez simplement et validez votre audit d'accessibilité numérique."
    />

    <BackLink
      label="Aller au tableau de bord de l’audit"
      :to="{ name: 'audit-overview', params: { uniqueId } }"
    />

    <AuditGenerationHeader
      :audit-name="auditStore.currentAudit.procedureName"
      :key-infos="headerInfos"
      :audit-publication-date="auditStore.currentAudit.publicationDate"
      :audit-edition-date="auditStore.currentAudit.editionDate"
      :edit-unique-id="uniqueId"
    />

    <div class="fr-grid-row columns">
      <div
        :class="[
          `fr-col-12 fr-col-md-${showFilters ? '3' : '1'}`,
          { 'fr-px-0': showFilters }
        ]"
      >
        <div
          :class="['filters-wrapper', 'fr-pb-6w', { 'fr-pr-3v': showFilters }]"
          role="search"
        >
          <AuditGenerationFilters
            :topics="topics"
            @toggle-filters="toggleFilters"
          />
        </div>
      </div>
      <div :class="`fr-col-12 fr-col-md-${showFilters ? '9' : '11'}`">
        <AraTabs :tabs="tabsData" @change="updateCurrentPageId">
          <template #panel="{ data }">
            <AuditGenerationPageCriteria
              :page="data"
              :audit-unique-id="uniqueId"
            />
          </template>
        </AraTabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Override DSFR columns width */
.columns {
  --gap: 1.5rem;
  --filters-column-width: 2rem;
}

@media (width < 62rem) {
  .columns {
    --gap: 1rem;
  }
}
.fr-col-md-1 {
  flex: 0 0 var(--filters-column-width) !important;
}

.fr-col-md-11 {
  flex-grow: 1 !important;
  max-width: calc(
    100% - calc(var(--filters-column-width) + var(--gap))
  ) !important; /* Sidebar width + gap */
  width: auto !important;
}

.back-summary-link {
  display: inline-block;
}

.filters-wrapper {
  position: sticky;
  top: 5rem;
  max-height: 100vh;
  overflow-y: auto;
}

@media (width < 48rem) {
  .filters-wrapper {
    position: static;
    max-height: none;
    overflow-y: initial;
  }
}

.page-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.page-wrapper > :deep(*) {
  flex-basis: 100%;
  max-width: 100%;
}
</style>
