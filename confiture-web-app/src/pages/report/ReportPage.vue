<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AraTabs from "../../components/audit/AraTabs.vue";
import PageMeta from "../../components/PageMeta";
import OnboardingModal from "../../components/report/OnboardingModal.vue";
import ReportErrors from "../../components/report/ReportErrors.vue";
import ReportImprovements from "../../components/report/ReportImprovements.vue";
import ReportNotes from "../../components/report/ReportNotes.vue";
import ReportResults from "../../components/report/ReportResults.vue";
import Dropdown from "../../components/ui/Dropdown.vue";
import TopLink from "../../components/ui/TopLink.vue";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useReportStore } from "../../store";
import { AuditStatus, CriteriumResultStatus } from "../../types";
import { formatBytes, formatDate, getAuditStatus, slugify } from "../../utils";

const report = useReportStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

const hasNotes = computed(() => {
  return !!report.data?.notes || report.data?.notesFiles.length;
});

const hasCompliantOrNotApplicableComments = computed(() => {
  return report.data?.results.some((r) => {
    return (
      (r.status === CriteriumResultStatus.COMPLIANT && r.compliantComment) ||
      (r.status === CriteriumResultStatus.NOT_APPLICABLE &&
        r.notApplicableComment)
    );
  });
});

type TabData = { label: string; data: any };
const tabsData = computed((): TabData[] => {
  return [
    { label: "Résultats", data: ReportResults },
    ...(hasNotes.value ? [{ label: "Notes", data: ReportNotes }] : []),
    { label: "Détails des non-conformités", data: ReportErrors },
    ...(hasCompliantOrNotApplicableComments.value
      ? [{ label: "Points d’amélioration", data: ReportImprovements }]
      : [])
  ];
});

const showCopyAlert = ref(false);

async function copyReportUrl() {
  const url =
    window.location.origin +
    router.resolve({ name: "report", params: { uniqueId } }).fullPath;

  navigator.clipboard.writeText(url).then(() => {
    showCopyAlert.value = true;
  });
}

function hideReportAlert() {
  showCopyAlert.value = false;
}

const onboardingModalRef = ref<InstanceType<typeof OnboardingModal>>();

watch(
  () => report.data,
  (report) => {
    if (report) {
      if (
        getAuditStatus(report) !== AuditStatus.IN_PROGRESS &&
        localStorage.getItem("confiture:seen-onboarding") !== "true"
      ) {
        onboardingModalRef.value?.show();
      }
    }
  }
);

function onOnboardingClose() {
  localStorage.setItem("confiture:seen-onboarding", "true");
}

const targetTab = ref(route.params.tab as string | undefined);
const targetTabIndex = computed(() => {
  let index = tabsData.value.findIndex(
    (t) => slugify(t.label).toLowerCase() === targetTab.value?.toLowerCase()
  );
  return index === -1 ? 0 : index;
});
const router = useRouter();

function handleTabChange(tabIndex: number) {
  // change the URL in the browser adress bar without triggering vue-router navigation
  history.pushState(
    {},
    "null",
    router.resolve({
      name: "report",
      params: {
        uniqueId,
        tab: slugify(tabsData.value[tabIndex].label)
      }
    }).fullPath
  );
}

const csvExportUrl = computed(() => `/api/reports/${uniqueId}/exports/csv`);

const csvExportFilename = computed(() => {
  if (!report.data?.procedureName) {
    return "audit.csv";
  }
  return `audit-${slugify(report.data.procedureName)}.csv`;
});

const csvExportSizeEstimation = computed(() => {
  return 502 + (report.data?.pageDistributions.length || 0) * 318;
});

const siteUrl = computed(() => {
  if (report.data) {
    return (
      report.data.procedureUrl ||
      new URL(report.data.context.samples[1].url).origin
    );
  }

  return null;
});
</script>

<template>
  <div
    v-if="
      report.data && getAuditStatus(report.data) === AuditStatus.IN_PROGRESS
    "
    class="fr-pt-1w"
  >
    <div class="fr-alert fr-alert--warning fr-mb-6w">
      <p class="fr-alert__title">Audit en cours</p>
      <p>
        Les résultats de ce rapport sont provisoires tant que l’audit n'est pas
        terminé.
      </p>
    </div>
  </div>

  <div class="fr-mb-4w heading">
    <h1 class="fr-mb-0">Rapport d’audit accessibilité</h1>
    <div class="heading-actions">
      <button
        class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-links-fill"
        title="Copier le lien du rapport"
        @click="copyReportUrl"
        @blur="hideReportAlert"
      >
        Copier le lien du rapport
      </button>
      <Dropdown
        title="Télécharger"
        :button-props="{ class: 'fr-btn--secondary' }"
      >
        <ul role="list" class="fr-p-0 fr-m-0 dropdown-list">
          <li class="dropdown-item dropdown-item--with-meta">
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill fr-m-0"
              :href="csvExportUrl"
              :download="csvExportFilename"
            >
              Télécharger l'audit
              <span class="fr-text--xs fr-text--regular dropdown-item-meta">
                CSV – {{ formatBytes(csvExportSizeEstimation, 2) }}
              </span>
            </a>
          </li>
        </ul>
      </Dropdown>
    </div>
  </div>

  <div role="alert" aria-live="polite">
    <div
      v-if="showCopyAlert"
      class="fr-alert fr-alert--success fr-alert--sm fr-mb-2w"
    >
      <p>Le lien vers le rapport a bien été copié dans le presse-papier.</p>
    </div>
  </div>

  <template v-if="report.data">
    <PageMeta
      title="Rapport d’audit accessibilité"
      :description="`Découvrez la synthèse de l'audit de ${report.data?.procedureName}.`"
    />

    <OnboardingModal
      ref="onboardingModalRef"
      :accessibility-rate="report.data.accessibilityRate"
      @close="onOnboardingClose"
    />

    <div class="fr-mb-6w fr-mb-md-12w header">
      <p class="fr-text--lead fr-mb-2w">{{ report.data.procedureName }}</p>

      <p
        v-if="
          getAuditStatus(report.data) === AuditStatus.IN_PROGRESS &&
          report.data.creationDate
        "
        class="fr-text--light fr-mb-4w dates"
      >
        Commencé le {{ formatDate(report.data.creationDate) }}
      </p>

      <p
        v-else-if="report.data.publishDate"
        class="fr-text--light fr-mb-4w dates"
      >
        Publié le {{ formatDate(report.data.publishDate) }}
        <template v-if="report.data.updateDate">
          - Mis à jour le {{ formatDate(report.data.updateDate) }}
        </template>
      </p>

      <p class="fr-mb-1v">
        URL du site :
        <a v-if="siteUrl" class="fr-link" target="_blank" :href="siteUrl">
          {{ siteUrl }}
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </a>
        <template v-else>Non renseignée</template>
      </p>
      <p class="fr-mb-1v">
        Type d’audit :
        <strong>{{ report.data.criteriaCount.total }} critères</strong>
      </p>
      <p class="fr-mb-1v">
        Référentiel : <strong>{{ report.data.context.referencial }}</strong>
      </p>
      <p v-if="report.data.context.auditorName" class="fr-mb-1v">
        Auditeur ou auditrice :
        <strong>{{ report.data.context.auditorName }}</strong>
      </p>
      <p v-if="report.data.procedureInitiator">
        Déclaration d’accessibilité :
        <RouterLink
          :to="{ name: 'a11y-statement', params: { uniqueId } }"
          class="fr-link"
          target="_blank"
        >
          accéder à la déclaration
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </RouterLink>
      </p>
    </div>

    <!-- sticky-top="-0.1px" to prevent "one line background flickering"
			when scrolling the page -->
    <AraTabs
      :tabs="tabsData"
      sticky-top="-0.1px"
      :selected-tab="targetTabIndex"
      @change="handleTabChange"
    >
      <template #panel="{ data, i }">
        <ReportResults v-if="i === 0" />
        <component :is="data" v-else />
      </template>
    </AraTabs>
  </template>

  <TopLink />
</template>

<style scoped>
.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.heading-actions {
  display: flex;
  gap: 1rem;
}

.dates {
  color: var(--text-mention-grey);
}
</style>
