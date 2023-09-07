<script setup lang="ts">
import { computed, ref, watch, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import OnboardingModal from "../../components/OnboardingModal.vue";
import ReportA11yStatement from "../../components/ReportA11yStatement.vue";
import ReportNotes from "../../components/ReportNotes.vue";
import ReportErrors from "../../components/ReportErrors.vue";
import ReportResults from "../../components/ReportResults.vue";
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";
import Dropdown from "../../components/Dropdown.vue";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useReportStore, useAuditStore } from "../../store";
import { AuditType, AuditStatus } from "../../types";
import {
  formatAuditType,
  getAuditStatus,
  formatDate,
  slugify,
  formatBytes,
} from "../../utils";

const report = useReportStore();
const audit = useAuditStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

const hasA11yStatement = computed(() => {
  return report.data?.auditType === AuditType.FULL;
});

const hasNotes = computed(() => {
  return !!report.data?.notes;
});

const tabs = computed(() => [
  { title: "Résultats", component: ReportResults },
  ...(hasA11yStatement.value
    ? [{ title: "Déclaration d’accessibilité", component: ReportA11yStatement }]
    : []),
  ...(hasNotes.value ? [{ title: "Notes", component: ReportNotes }] : []),
  { title: "Détail des résultats", component: ReportErrors },
]);

const showCopyAlert = ref(false);

async function copyReportUrl() {
  const url = `${window.location.origin}/rapports/${uniqueId}`;

  navigator.clipboard.writeText(url).then(() => {
    showCopyAlert.value = true;
  });
}

function hideReportAlert() {
  showCopyAlert.value = false;
}

const onboardingModalRef = ref<InstanceType<typeof OnboardingModal>>();
const showOnboardingAlert = ref(false);

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

      showOnboardingAlert.value =
        getAuditStatus(report) !== AuditStatus.IN_PROGRESS &&
        localStorage.getItem("confiture:hide-onboarding-alert") !== "true";
    }
  }
);

function onOnboardingClose(confirmed: boolean) {
  localStorage.setItem("confiture:seen-onboarding", "true");
  showOnboardingAlert.value = !confirmed;
  if (confirmed) {
    localStorage.setItem("confiture:hide-onboarding-alert", "true");
  }
}

function onOnboardingAlertClose() {
  showOnboardingAlert.value = false;
  localStorage.setItem("confiture:hide-onboarding-alert", "true");
}

const targetTab = ref(route.params.tab) as Ref<string | undefined>;
const targetTabIndex = computed(() => {
  let index = tabs.value.findIndex(
    (t) => slugify(t.title).toLowerCase() === targetTab?.value?.toLowerCase()
  );
  return index === -1 ? 0 : index;
});
const router = useRouter();

function handleTabChange(tab: { title: string }) {
  // change the URL in the browser adress bar without triggering vue-router navigation
  history.pushState(
    {},
    "null",
    router.resolve({
      name: "report",
      params: {
        uniqueId,
        tab: slugify(tab.title),
      },
    }).fullPath
  );

  targetTab.value = slugify(tab.title);
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
</script>

<template>
  <div v-if="showOnboardingAlert" class="fr-alert fr-alert--info fr-mb-6w">
    <p class="fr-alert__title">Vous ne savez pas par quel bout commencer ?</p>
    <p>
      Retrouvez tous nos conseils dans la page
      <RouterLink to="/aide">Aide</RouterLink>
    </p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="onOnboardingAlertClose"
    >
      Masquer le message
    </button>
  </div>

  <div
    v-if="
      report.data && getAuditStatus(report.data) === AuditStatus.IN_PROGRESS
    "
    class="fr-pt-1w in-progress-alert"
  >
    <div class="fr-alert fr-alert--warning fr-mb-6w">
      <p class="fr-alert__title">Audit en cours</p>
      <p>
        Les résultats de ce rapports sont provisoires tant que l’audit n'est pas
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
          <li class="dropdown-item">
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill fr-m-0 download-link"
              :href="csvExportUrl"
              :download="csvExportFilename"
            >
              Télécharger l'audit
              <span class="fr-text--xs fr-text--regular download-meta">
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
        Audit commencé le {{ formatDate(report.data.creationDate) }}
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

      <p class="fr-mb-0">
        <strong>URL du site</strong> :
        <a
          v-if="report.data.procedureUrl"
          class="fr-link"
          target="_blank"
          :href="report.data.procedureUrl"
        >
          {{ report.data.procedureUrl }}
          <span class="sr-only">(nouvelle fenêtre)</span>
        </a>
        <template v-else>Non renseignée</template>
      </p>
      <p class="fr-mb-0">
        <strong>Type d’audit</strong> :
        {{ formatAuditType(report.data.auditType) }} ({{
          report.data.totalCriteriaCount
        }}
        critères)
      </p>
      <p class="fr-mb-0">
        <strong>Référentiel</strong> : {{ report.data.context.referencial }}
      </p>
      <p class="fr-mb-1v">
        <strong>Auditeur</strong> ou <strong>auditrice</strong> :
        {{ report.data.context.auditorName }}
        <template v-if="report.data.context.auditorEmail"
          >({{ report.data.context.auditorEmail }})</template
        >
      </p>

      <RouterLink class="fr-link" :to="{ name: 'context' }">
        Voir le contexte de l’audit
      </RouterLink>
    </div>

    <div class="fr-tabs">
      <ul class="fr-tabs__list" role="tablist" aria-label="Sections du rapport">
        <li v-for="(tab, i) in tabs" :key="tab.title" role="presentation">
          <button
            :id="`tabpanel-${slugify(tab.title)}`"
            class="fr-tabs__tab"
            tabindex="0"
            role="tab"
            :aria-selected="i === targetTabIndex"
            :aria-controls="`tabpanel-${slugify(tab.title)}-panel`"
          >
            {{ tab.title }}
            <span v-if="i === targetTabIndex" class="sr-only">&nbsp;Actif</span>
          </button>
        </li>
      </ul>
      <div
        v-for="(tab, i) in tabs"
        :id="`tabpanel-${slugify(tab.title)}-panel`"
        :key="tab.title"
        class="fr-tabs__panel"
        :class="{ 'fr-tabs__panel--selected': i === targetTabIndex }"
        role="tabpanel"
        :aria-labelledby="`tabpanel-${slugify(tab.title)}`"
        tabindex="0"
        v-on="{ 'dsfr.disclose': () => handleTabChange(tab) }"
      >
        <component :is="tab.component" />
      </div>
    </div>
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

.download-link {
  display: flex;
  flex-wrap: wrap;
}

.download-meta {
  flex-basis: 100%;
  color: var(--text-mention-grey);
}

.dates {
  color: var(--text-mention-grey);
}

.in-progress-alert {
  position: sticky;
  top: 0;
  background-color: var(--background-default-grey);
  z-index: 3;
}
</style>
