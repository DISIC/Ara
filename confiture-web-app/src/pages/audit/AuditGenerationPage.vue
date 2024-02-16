<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

import AraTabs from "../../components/audit/AraTabs.vue";
import NotesModal from "../../components/audit/NotesModal.vue";
import AuditGenerationFilters from "../../components/audit/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/audit/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useAuditStats } from "../../composables/useAuditStats";
import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";
import {
  useAuditStore,
  useFiltersStore,
  useResultsStore,
  useAccountStore
} from "../../store";
import { AuditPage, AuditType, CriteriumResultStatus } from "../../types";
import { getCriteriaCount, pluralize } from "../../utils";
import { usePreviousRoute } from "../../composables/usePreviousRoute";
import TransverseWarningModal from "../../components/audit/TransverseWarningModal.vue";
import TransverseNoticeModal from "../../components/audit/TransverseNoticeModal.vue";

const route = useRoute();
const previousRoute = usePreviousRoute();

const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const resultsStore = useResultsStore();
const notify = useNotifications();

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

function updateCurrentPageId(i: number) {
  const pageIdOrNull = auditStore.currentAudit?.pages.at(i)?.id ?? null;
  auditStore.updateCurrentPageId(pageIdOrNull);
}

const {
  complianceLevel,
  notApplicableCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount
} = useAuditStats();

const headerInfos = computed(() => [
  ...(auditStore.currentAudit?.auditType === AuditType.FULL
    ? [
        {
          title: "Taux global de conformité",
          description: "RGAA version 4.1",
          value: complianceLevel.value,
          total: 100,
          unit: "%",
          theme: "france"
        }
      ]
    : []),
  {
    title: "Critères non conformes",
    description: `Dont ${blockingCriteriaCount.value} bloquants pour l’usager`,
    value: notCompliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType),
    theme: "marianne"
  },
  {
    title: "Critères non applicables",
    description: `Sur un total de ${getCriteriaCount(
      auditStore.currentAudit?.auditType as AuditType
    )} critères`,
    value: notApplicableCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType)
  }
]);

onBeforeRouteLeave(() => {
  auditStore.showAuditEmailAlert = false;
});

const showFilters = ref(true);

function toggleFilters(value: boolean) {
  showFilters.value = value;
}

// Notes
const notesModal = ref<InstanceType<typeof NotesModal>>();
const isNotesLoading = ref(false);

function openNotesModal() {
  notesModal.value?.show();
}

const updateAuditNotes = async (notes: string) => {
  isNotesLoading.value = true;
  try {
    await auditStore.updateAuditNotes(uniqueId.value, {
      notes
    });
    notify(
      "success",
      undefined,
      "Annotation de l’audit mise à jour avec succès"
    );
  } catch (error) {
    console.error(error);
    notify(
      "error",
      "Une erreur est survenue",
      "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
  } finally {
    isNotesLoading.value = false;
    notesModal.value?.hide();
  }
};

const isOffline = useIsOffline();

const filterStore = useFiltersStore();
const filterResultsCount = computed(() =>
  filterStore.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0)
);

watch(
  () => auditStore.currentAudit,
  (currentAudit) => {
    if (currentAudit) {
      auditStore.currentPageId = currentAudit.pages[0].id;
    }
  },
  { immediate: true }
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
  return (
    auditStore.currentAudit?.pages.map((p) => ({
      label: p.name,
      data: p
    })) ?? []
  );
});

const accountStore = useAccountStore();

const transverseWarningModalRef =
  ref<InstanceType<typeof TransverseWarningModal>>();

const transverseWarningResolve = ref<() => void>();

function onTransverseWarningConfirm() {
  transverseWarningResolve.value?.();
}

provide("openTransverseWarning", () => {
  transverseWarningModalRef.value?.show();

  return new Promise<void>((resolve) => {
    // Store the resolve callback to be called when the modal is "accepted"
    transverseWarningResolve.value = resolve;
  });
});

const transverseNoticeModalRef =
  ref<InstanceType<typeof TransverseNoticeModal>>();

type TransverseNoticeResult = "thisPage" | "allPages";

const transverseNoticeResolve = ref<(result: TransverseNoticeResult) => void>();

function onTransverseNoticeConfirm(result: TransverseNoticeResult) {
  transverseNoticeResolve.value?.(result);
}

provide("openTransverseNotice", () => {
  transverseNoticeModalRef.value?.show();

  return new Promise<TransverseNoticeResult>((resolve) => {
    transverseNoticeResolve.value = resolve;
  });
});

const currentPageName = computed(
  () =>
    auditStore.currentAudit?.pages.find(
      (p) => p.id === auditStore.currentPageId
    )?.name ?? ""
);
</script>

<template>
  <!-- FIXME: handle loading states -->
  <div v-if="auditStore.currentAudit && resultsStore.data" class="page-wrapper">
    <PageMeta
      :title="pageTitle"
      description="Réalisez simplement et validez votre audit d'accessibilité numérique."
    />

    <BackLink
      :label="
        accountStore.account &&
        previousRoute.route?.name === 'account-dashboard'
          ? 'Accéder à la synthèse'
          : 'Retourner à la synthèse'
      "
      :to="
        accountStore.account &&
        previousRoute.route?.name === 'account-dashboard'
          ? { name: 'account-dashboard' }
          : { name: 'audit-overview', params: { uniqueId } }
      "
    />

    <AuditGenerationHeader
      :audit-name="auditStore.currentAudit.procedureName"
      :key-infos="headerInfos"
      :audit-publication-date="auditStore.currentAudit.publicationDate"
      :audit-edition-date="auditStore.currentAudit.editionDate"
      :edit-unique-id="uniqueId"
    >
      <template #actions>
        <li>
          <button
            class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-draft-line"
            :disabled="isOffline"
            @click="openNotesModal"
          >
            Annoter l’audit
          </button>
        </li>
        <li>
          <component
            :is="isOffline ? 'button' : 'RouterLink'"
            class="fr-btn fr-btn--secondary"
            :to="{
              name: 'report',
              params: { uniqueId: auditStore.currentAudit?.consultUniqueId }
            }"
            target="_blank"
            :disabled="isOffline"
          >
            Consulter le rapport
            <span class="sr-only">(Nouvelle fenêtre)</span>
          </component>
        </li>
      </template>
    </AuditGenerationHeader>

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

  <NotesModal
    ref="notesModal"
    :is-loading="isNotesLoading"
    @confirm="updateAuditNotes"
  />

  <TransverseWarningModal
    ref="transverseWarningModalRef"
    @confirm="onTransverseWarningConfirm"
  />

  <TransverseNoticeModal
    ref="transverseNoticeModalRef"
    :page-name="currentPageName"
    @confirm-on-all-pages="onTransverseNoticeConfirm('allPages')"
    @confirm-on-page="onTransverseNoticeConfirm('thisPage')"
  />
</template>

<style scoped>
/* Override DSFR columns width */
.columns {
  --gap: 1.5rem;
  --filters-column-width: 2rem;
}

@media (max-width: 992px) {
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
