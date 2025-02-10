<script setup lang="ts">
import { type Component, computed, onBeforeUnmount, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

import AraTabs from "../../components/audit/AraTabs.vue";
import AuditGenerationFilters from "../../components/audit/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/audit/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import LayoutIcon from "../../components/icons/LayoutIcon.vue";
import PageMeta from "../../components/PageMeta";
import { StatDonutTheme } from "../../components/StatDonut.vue";
import BackLink from "../../components/ui/BackLink.vue";
import { useAuditStats } from "../../composables/useAuditStats";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditPage, AuditType, CriteriumResultStatus } from "../../types";
import { pluralize, slugify } from "../../utils";

const route = useRoute();

const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
  await auditStore.updateCurrentPageId(
    auditStore.currentAudit?.transverseElementsPage.id || null
  );
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
            (result) =>
              result.topic === topic.number &&
              result.pageId !==
                auditStore.currentAudit?.transverseElementsPage.id
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
          value: Math.floor((testedCount / relevantCount) * 100)
        };
      })
  );
});

const auditIsInProgress = computed(() => resultsStore.auditProgress < 1);

function updateCurrentPageId(tabIndex: number) {
  auditStore.updateCurrentPageId(
    tabIndex === 0
      ? auditStore.currentAudit?.transverseElementsPage.id ?? null
      : auditStore.currentAudit?.pages
        ? auditStore.currentAudit?.pages.at(tabIndex - 1)?.id ?? null
        : null
  );

  // change the URL in the browser adress bar without triggering vue-router navigation
  // history.pushState(
  //   {},
  //   "null",
  //   router.resolve({
  //     name: "audit-generation",
  //     params: {
  //       uniqueId: uniqueId.value,
  //       tab: slugify(tabsData.value[tabIndex].label)
  //     }
  //   }).fullPath
  // );
}

const {
  complianceLevel,
  compliantCriteriaCount,
  applicableCriteriaCount,
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
    total: applicableCriteriaCount.value,
    theme: "red" as StatDonutTheme
  },
  {
    title: "Critères<br/> conformes",
    value: compliantCriteriaCount.value,
    total: applicableCriteriaCount.value,
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

// Observe the height of the sticky indicator and sync the `top` CSS property with it.
const auditGenerationHeader = ref<InstanceType<
  typeof AuditGenerationHeader
> | null>(null);

const stickyTop = ref<string>("0");
let resizeObserver: ResizeObserver | null = null;

// Because auditGenerationHeader ref is inside a "v-if",
// Vue will not instantiate the ref immediately.
// We need to watch it before observing nested stickyIndicator
watch(auditGenerationHeader, async () => {
  const stickyIndicator = auditGenerationHeader.value?.stickyIndicator;
  resizeObserver = new ResizeObserver((entries) => {
    const target = entries[0].target;
    stickyTop.value = `calc(${getComputedStyle(target).top} + ${
      target.clientHeight
    }px)`;
  });
  stickyIndicator && resizeObserver.observe(stickyIndicator);
});

onBeforeUnmount(() => {
  const stickyIndicator = auditGenerationHeader.value?.stickyIndicator;
  stickyIndicator && resizeObserver?.unobserve(stickyIndicator);
});

const pageTitle = computed(() => {
  // [audit name] - Page en cours « XXX » - X résultats pour « XXX »
  if (auditStore.currentAudit) {
    let title = auditStore.currentAudit.procedureName;

    const tabName = ` - Page en cours « ${
      auditStore.currentAudit.pages.find(
        (p) => p.id === auditStore.currentPageId
      )?.name ?? "Éléments transverses"
    } »`;

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

const targetTab = ref(route.params.tab as string | undefined);
const targetTabIndex = computed(() => {
  let index = tabsData.value.findIndex(
    (t) => slugify(t.label).toLowerCase() === targetTab.value?.toLowerCase()
  );
  return index === -1 ? 0 : index;
});

type TabData = {
  label: string;
  icon?: Component;
  data: AuditPage;
};

const tabsData = computed((): TabData[] => {
  const transversePage = auditStore.currentAudit?.transverseElementsPage;
  return [
    ...(transversePage
      ? [
          {
            label: transversePage?.name,
            icon: LayoutIcon,
            data: transversePage
          }
        ]
      : []),
    ...(auditStore.currentAudit?.pages.map((p) => ({
      label: p.name,
      data: p
    })) ?? [])
  ];
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
      ref="auditGenerationHeader"
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
          :class="['filters-wrapper fr-pt-4v', { 'fr-pr-3v': showFilters }]"
          role="search"
          :style="{ '--filters-top-offset': stickyTop }"
        >
          <AuditGenerationFilters
            :topics="topics"
            @toggle-filters="toggleFilters"
          />
        </div>
      </div>
      <div
        id="audit-tabs"
        :class="`fr-col-12 fr-col-md-${showFilters ? '9' : '11'}`"
      >
        <AraTabs
          :tabs="tabsData"
          :sticky-top="stickyTop"
          :selected-tab="targetTabIndex"
          @change="updateCurrentPageId"
        >
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
@import "../../styles/filters.css";

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
