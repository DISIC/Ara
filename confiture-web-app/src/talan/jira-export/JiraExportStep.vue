<script setup lang="ts">
/**
 * Talan customisation (see CUSTOMISATIONS_TALAN.md): "Tickets Jira" card
 * of the audit overview page.
 */
import { computed } from "vue";

import StepCard from "../../components/overview/StepCard.vue";
import { useResultsStore } from "../../store";
import { downloadJiraCsv, ExportedAudit, getJiraTicketsCount } from "./jira-export";

const props = defineProps<{
  audit: ExportedAudit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const jiraTicketsCount = computed(() => {
  return getJiraTicketsCount(props.audit, resultsStore.data);
});
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w step-card-heading">
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 step-card-title"
      >
        Tickets Jira
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </component>
    </div>
    <p class="jira-step-description">
      {{
        jiraTicketsCount
          ? "Vous pouvez importer les erreurs de l’audit dans Jira Cloud, un ticket par erreur."
          : "Aucune erreur à exporter : aucun critère n’est non conforme."
      }}
    </p>
    <ul class="fr-btns-group fr-btns-group--icon-left">
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line fr-mb-1w"
          aria-describedby="audit-jira-step-download-informations"
          :disabled="!jiraTicketsCount"
          @click="downloadJiraCsv(audit, resultsStore.data)"
        >
          Télécharger
        </button>
      </li>
    </ul>
    <div v-if="jiraTicketsCount" class="jira-step-download-info">
      <p
        id="audit-jira-step-download-informations"
        class="fr-text--xs fr-mb-0 fr-mt-1v"
      >
        Format d’import CSV de Jira Cloud.<br />CSV –
        {{ jiraTicketsCount }} {{ jiraTicketsCount > 1 ? "tickets" : "ticket" }}.
      </p>
    </div>
  </StepCard>
</template>

<style scoped>
.jira-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.jira-step-download-info {
  color: var(--text-mention-grey);
  grid-column: 1;
}
</style>
