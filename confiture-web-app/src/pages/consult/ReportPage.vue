<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import OnboardingModal from "../../components/OnboardingModal.vue";
import ReportA11yStatement from "../../components/ReportA11yStatement.vue";
import ReportErrors from "../../components/ReportErrors.vue";
import ReportResults from "../../components/ReportResults.vue";
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useReportStore } from "../../store";
import { AuditType, AuditStatus } from "../../types";
import {
  formatAuditType,
  getAuditStatus,
  formatDate,
  slugify,
} from "../../utils";

const report = useReportStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

const hasA11yStatement = computed(() => {
  return report.data?.auditType === AuditType.FULL;
});

const tabs = computed(() => [
  { title: "Résultats", component: ReportResults },
  ...(hasA11yStatement.value
    ? [{ title: "Déclaration d’accessibilité", component: ReportA11yStatement }]
    : []),
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

const targetTab = route.params.tab as string | undefined;
const targetTabIndex = computed(() => {
  let index = tabs.value.findIndex(
    (t) => slugify(t.title).toLowerCase() === targetTab?.toLowerCase()
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
}
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
    class="fr-alert fr-alert--warning fr-mb-6w"
  >
    <p class="fr-alert__title">Audit en cours</p>
    <p>
      Les résultats de ce rapports sont provisoires tant que l’audit n'est pas
      terminé.
    </p>
  </div>

  <div class="fr-mb-4w heading">
    <h1 class="fr-mb-0">Rapport d’audit accessibilité</h1>
    <div>
      <button
        class="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-links-fill"
        title="Copier le lien du rapport"
        @click="copyReportUrl"
        @blur="hideReportAlert"
      >
        Copier le lien
      </button>
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
          </button>
        </li>
      </ul>
      <div
        v-for="(tab, i) in tabs"
        :id="`tabpanel-${slugify(tab.title)}-panel`"
        :key="tab.title"
        class="fr-tabs__panel fr-tabs__panel--selected"
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

.dates {
  color: var(--text-mention-grey);
}
</style>
