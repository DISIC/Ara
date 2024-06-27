<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import AuditStep from "../../components/overview/AuditStep.vue";
import ReportStep from "../../components/overview/ReportStep.vue";
import StatementStep from "../../components/overview/StatementStep.vue";
import PageMeta from "../../components/PageMeta";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditType } from "../../types";

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();
const resultsStore = useResultsStore();

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
      <p class="fr-alert__title">Audit copié avec succès</p>
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

    <div class="content">
      <h1 class="fr-mb-6w">{{ audit.procedureName }}</h1>

      <ul class="fr-p-0 fr-m-0 overview-steps">
        <!-- Audit -->
        <AuditStep :audit="audit" />

        <!-- Report -->
        <ReportStep :audit="audit" />

        <!-- a11y statement -->
        <StatementStep
          v-if="audit.auditType === AuditType.FULL"
          :audit="audit"
        />
      </ul>
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
  gap: 2rem;
}
</style>
