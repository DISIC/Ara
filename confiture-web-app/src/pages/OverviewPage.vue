<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import PageMeta from "../components/PageMeta";
import AuditStep from "../components/overview/AuditStep.vue";
import ReportStep from "../components/overview/ReportStep.vue";
import StatementStep from "../components/overview/StatementStep.vue";
import { useWrappedFetch } from "../composables/useWrappedFetch";
import { useAuditStore, useResultsStore } from "../store";
import { AuditType } from "../types";

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
</script>

<template>
  <template v-if="audit">
    <!-- TODO: fill meta description -->
    <PageMeta :title="`Synthèse ${audit.procedureName}`" description="TODO" />

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
