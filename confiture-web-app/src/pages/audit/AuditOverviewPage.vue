<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import AuditStep from "../../components/overview/AuditStep.vue";
import GridStep from "../../components/overview/GridStep.vue";
import ReportStep from "../../components/overview/ReportStep.vue";
import StatementStep from "../../components/overview/StatementStep.vue";
import PageMeta from "../../components/PageMeta";
import BackLink from "../../components/ui/BackLink.vue";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAccountStore, useAuditStore, useResultsStore } from "../../store";
import { AuditType } from "../../types";

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();
const resultsStore = useResultsStore();
const accountStore = useAccountStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const audit = computed(() => {
  return auditStore.currentAudit;
});

// Banners management
const showDuplicatedAlert = ref(!!history.state.showDuplicatedAlert);

watch(route, () => {
  if (history.state.showDuplicatedAlert) {
    showDuplicatedAlert.value = true;
  }
});

function closeDuplicatedAuditAlert() {
  showDuplicatedAlert.value = false;
  focusPageHeading();
}

function closeAuditEmailAlert() {
  auditStore.showAuditEmailAlert = false;
  focusPageHeading();
}

function focusPageHeading() {
  const pageHeading = document.querySelector("h1");
  pageHeading?.setAttribute("tabindex", "-1");
  pageHeading?.focus();
}

const isLoggedInAndOwnAudit = computed(() => {
  return (
    auditStore.currentAudit &&
    auditStore.currentAudit?.auditorEmail === accountStore.account?.email
  );
});
</script>

<template>
  <template v-if="audit">
    <PageMeta
      :title="`Synthèse ${audit.procedureName}`"
      description="Suivez l'avancement de votre travail et accédez à votre audit et vos livrables. Commencez par réaliser votre audit avant compléter la déclaration d'accessibilité. Livrez ensuite le rapport d'audit et la déclaration d'accessibilité. Le rapport d'audit est généré automatiquement à partir de l'audit. La déclaration d'accessibilité est pré-complétée automatiquement à partir de l'audit."
    />

    <!-- Email alert -->
    <div
      v-if="auditStore.showAuditEmailAlert"
      class="fr-alert fr-alert--info fr-mb-3w"
    >
      <p class="fr-alert__title">Retrouvez vos documents</p>
      <p>
        Un lien pour accéder à cette page vient de vous être envoyé par e-mail à
        l’adresse
        <strong>{{ audit.auditorEmail }}</strong>
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeAuditEmailAlert"
      >
        Masquer le message
      </button>
    </div>

    <!-- Duplicated audit alert -->
    <div v-if="showDuplicatedAlert" class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">Audit dupliqué avec succès</p>
      <p>
        Un lien pour accéder à cette page vient de vous être envoyé par mail.
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeDuplicatedAuditAlert"
      >
        Masquer le message
      </button>
    </div>

    <BackLink
      v-if="isLoggedInAndOwnAudit"
      label="Retourner à mes audits"
      :to="{ name: 'account-dashboard' }"
    />

    <div class="content">
      <template v-if="isLoggedInAndOwnAudit">
        <h1 class="fr-mb-3v">Livrables</h1>
        <p class="fr-text--xl fr-mb-4w">{{ audit.procedureName }}</p>
      </template>

      <h1 v-else class="fr-mb-6w">{{ audit.procedureName }}</h1>

      <div class="fr-p-0 fr-m-0 overview-steps">
        <!-- Audit -->
        <AuditStep
          v-if="!isLoggedInAndOwnAudit"
          :audit="audit"
          class="fr-mb-1w"
        />

        <h2 v-if="!isLoggedInAndOwnAudit" class="fr-mb-0">Livrables</h2>

        <!-- Report -->
        <ReportStep
          :audit="audit"
          class="fr-mb-1w"
          :heading-level="isLoggedInAndOwnAudit ? 'h2' : 'h3'"
        />

        <!-- Grid -->
        <GridStep
          :audit="audit"
          class="fr-mb-1w"
          :heading-level="isLoggedInAndOwnAudit ? 'h2' : 'h3'"
        />

        <!-- a11y statement -->
        <StatementStep
          v-if="audit.auditType === AuditType.FULL"
          :audit="audit"
          :heading-level="isLoggedInAndOwnAudit ? 'h2' : 'h3'"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
  margin: 0 auto;
}

.overview-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
