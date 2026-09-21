<script setup lang="ts">
/**
 * Talan customisation (see CUSTOMISATIONS_TALAN.md): "Exporter les tickets
 * Jira" entry of the audit "Actions" dropdown.
 */
import { computed } from "vue";

import { useAuditStore, useResultsStore } from "../../store";
import { downloadJiraCsv, getJiraTicketsCount } from "./jira-export";

const emit = defineEmits<{
  exported: [];
}>();

const auditStore = useAuditStore();
const resultsStore = useResultsStore();

const jiraTicketsCount = computed(() => {
  if (!auditStore.currentAudit) {
    return 0;
  }
  return getJiraTicketsCount(auditStore.currentAudit, resultsStore.data);
});

function exportJiraTickets() {
  if (auditStore.currentAudit) {
    downloadJiraCsv(auditStore.currentAudit, resultsStore.data);
  }
  emit("exported");
}
</script>

<template>
  <li class="dropdown-item">
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-download-fill jira-export-button"
      :disabled="!jiraTicketsCount"
      @click="exportJiraTickets"
    >
      Exporter les tickets Jira
      <span class="fr-text--xs fr-text--regular jira-export-meta">
        {{
          jiraTicketsCount
            ? `CSV – ${jiraTicketsCount} ${jiraTicketsCount > 1 ? "tickets" : "ticket"}`
            : "Aucune erreur à exporter"
        }}
      </span>
    </button>
  </li>
</template>

<style scoped>
.jira-export-button {
  display: flex;
  flex-wrap: wrap;
  text-align: start;
}

.jira-export-meta {
  flex-basis: 100%;
  color: var(--text-mention-grey);
}
</style>
