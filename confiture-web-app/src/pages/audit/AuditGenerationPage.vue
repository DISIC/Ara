<script setup lang="ts">
import { computed, ref, toRef, watch, watchEffect } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import AraTabs from "../../components/audit/AraTabs.vue";
import { AraTabsTabData } from "../../components/audit/AraTabsTabData";
import AuditGenerationFilters from "../../components/audit/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/audit/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import LayoutIcon from "../../components/icons/LayoutIcon.vue";
import PageMeta from "../../components/PageMeta";
import { StatDonutTheme } from "../../components/StatDonut.vue";
import BackLink from "../../components/ui/BackLink.vue";
import { useAuditStats } from "../../composables/useAuditStats";
import { useResizeObserver } from "../../composables/useResizeObserver";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";
import { FirstTab, StaticTabLabel } from "../../enums";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditType, CriteriumResultStatus } from "../../types";
import { pluralize } from "../../utils";

/** Props */
const props = withDefaults(
  defineProps<{
    tabSlug?: string;
    uniqueId: string;
  }>(),
  {
    tabSlug: FirstTab.AUDIT_SLUG
  }
);

/** Refs */

const showFilters = ref(true);

// Observe the height of the sticky indicator and sync the `top` CSS property with it.
const auditGenerationHeaderRef = ref<InstanceType<
  typeof AuditGenerationHeader
> | null>(null);

const stickyTop = ref("0px");
const selectedTabSlug = ref(props.tabSlug);

/** Stores */
const auditStore = useAuditStore();
const resultsStore = useResultsStore();
const filterStore = useFiltersStore();

/** Composables */
const {
  complianceLevel,
  compliantCriteriaCount,
  applicableCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount
} = useAuditStats();

/** Computed properties */

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

const filterResultsCount = computed(() =>
  filterStore.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0)
);

const pageTitle = computed(() => {
  // [audit name] - Page en cours « XXX » - X résultats pour « XXX »
  if (auditStore.currentAudit) {
    let title = auditStore.currentAudit.procedureName;

    const tabName = ` - Page en cours « ${
      auditStore.currentAudit.pages.find(
        (p) => p.id === auditStore.currentPageId
      )?.name ?? StaticTabLabel.AUDIT_COMMON_ELEMENTS_TAB_LABEL
    } »`;

    title += tabName;

    if (filterStore.search) {
      const results = ` - ${filterResultsCount.value} ${pluralize(
        "résultat",
        "résultats",
        filterResultsCount.value
      )} pour « ${filterStore.search} »`;

      title += results;
    }

    return title;
  }

  return "";
});

const tabsData = computed((): AraTabsTabData[] => {
  const transversePage = auditStore.currentAudit?.transverseElementsPage;
  return [
    ...(transversePage
      ? [
          new AraTabsTabData({
            label: transversePage?.name,
            icon: LayoutIcon,
            component: AuditGenerationPageCriteria,
            componentParams: {
              page: transversePage,
              auditUniqueId: "uniqueId"
            }
          })
        ]
      : []),
    ...(auditStore.currentAudit?.pages.map(
      (p) =>
        new AraTabsTabData({
          label: p.name,
          component: AuditGenerationPageCriteria,
          componentParams: {
            page: p,
            auditUniqueId: "uniqueId"
          }
        })
    ) ?? [])
  ];
});

/** Functions */

/**
 * Updates audit store `currentPageId` given a tab index.
 * Usefull for synchronising filters with current page (on tab change)
 *
 * @param {number} tabIndex
 */
function onSelectedTabChange(tabIndex: number) {
  console.log("onSelectedTabChange: " + tabIndex);
  auditStore.updateCurrentPageId(
    tabIndex === 0
      ? auditStore.currentAudit?.transverseElementsPage.id ?? null
      : auditStore.currentAudit?.pages
        ? auditStore.currentAudit?.pages.at(tabIndex - 1)?.id ?? null
        : null
  );
}

/**
 * Toggles filters
 *
 * @param {boolean} doShow if true, shows filters, otherwise hides them
 */
function toggleFilters(doShow: boolean) {
  showFilters.value = doShow;
}

/** Lifecycle hooks */

/** Note: here useWrappedFetch uses onMounted callback */
useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(props.uniqueId);
  await resultsStore.fetchResults(props.uniqueId);
  const stickyIndicator = toRef(
    auditGenerationHeaderRef.value!.stickyIndicator
  );

  useResizeObserver(stickyIndicator, () => {
    stickyTop.value = `calc(${getComputedStyle(stickyIndicator.value!).top} + ${
      stickyIndicator.value!.clientHeight
    }px)`;
  });
}, false);

/** Navigation guards */
onBeforeRouteLeave(() => {
  auditStore.showAuditEmailAlert = false;
});

/** Watchers */

watch(
  () => auditStore.currentAudit?.pages,
  (curr, prev) => {
    if (curr && !prev) {
      auditStore.currentPageId = auditStore.currentAudit!.pages[0].id;
    }
  }
);

watchEffect(() => {
  selectedTabSlug.value = props.tabSlug;
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
      ref="auditGenerationHeaderRef"
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
          :class="['filters-wrapper', { 'fr-pr-3v': showFilters }]"
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
          panel-scroll-behavior="sameCriteria"
          :route="{ name: 'audit-generation-full', params: { uniqueId } }"
          :sticky-top="stickyTop"
          :selected-tab-slug="selectedTabSlug"
          :tabs="tabsData"
          @selected-tab-change="onSelectedTabChange"
        >
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
  top: var(--filters-top-offset, 0);
  max-height: calc(100vh - var(--filters-top-offset, 0));
  max-height: calc(100dvh - var(--filters-top-offset, 0));
  overflow-y: auto;
  padding-top: 1rem;
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
