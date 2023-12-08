<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import PageMeta from "../components/PageMeta";
import BackLink from "../components/BackLink.vue";
import AuditStep from "../components/overview/AuditStep.vue";
import ReportStep from "../components/overview/ReportStep.vue";
import StatementStep from "../components/overview/StatementStep.vue";
import { useWrappedFetch } from "../composables/useWrappedFetch";
import { useAuditStore, useResultsStore, useAccountStore } from "../store";
import { AuditType } from "../types";

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
</script>

<template>
  <template v-if="audit">
    <PageMeta
      :title="`Synthèse ${audit.procedureName}`"
      description="Suivez l'avancement de votre travail et accédez à votre audit et vos livrables. Commencez par réaliser votre audit avant compléter la déclaration d'accessibilité. Livrez ensuite le rapport d'audit et la déclaration d'accessibilité. Le rapport d'audit est généré automatiquement à partir de l'audit. La déclaration d'accessibilité est pré-complétée automatiquement à partir de l'audit."
    />

    <template v-if="accountStore.account">
      <BackLink
        label="Retourner à mes audits"
        :to="{ name: 'account-dashboard' }"
      />
    </template>

    <h1>{{ audit.procedureName }}</h1>

    <ul class="fr-p-0 fr-m-0 overview-steps">
      <!-- Audit -->
      <AuditStep :audit="audit" />

      <!-- Report -->
      <ReportStep :audit="audit" />

      <!-- a11y statement -->
      <StatementStep v-if="audit.auditType === AuditType.FULL" :audit="audit" />
    </ul>
  </template>
</template>

<style scoped>
.overview-steps {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
</style>
