<script setup lang="ts">
import slugify from "slugify";
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import { formatBytes } from "../../utils";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const csvExportUrl = computed(
  () => `/api/audits/${props.audit.editUniqueId}/exports/csv`
);

const csvExportFilename = computed(() => {
  return `audit-${slugify(props.audit.procedureName)}.csv`;
});

const csvExportSizeEstimation = computed(() => {
  return 502 + Object.keys(resultsStore.data ?? {}).length * 318;
});
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w grid-step-heading">
      <span
        v-if="auditIsReady"
        id="grid-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill grid-step-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 grid-step-title"
        aria-describedby="grid-step-status"
      >
        Grille d’audit
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </component>
    </div>
    <p class="grid-step-description">
      {{
        auditIsReady
          ? "Vous pouvez livrer la grille d’audit."
          : "Terminez l’audit avant de livrer la grille d’audit."
      }}
    </p>
    <ul class="fr-btns-group fr-btns-group--icon-left">
      <li>
        <a
          class="fr-btn fr-mb-1w fr-btn--icon-left fr-icon-download-line"
          :class="auditIsReady ? 'fr-btn--secondary' : 'fr-btn--tertiary'"
          aria-describedby="audit-grid-step-download-informations"
          :href="csvExportUrl"
          :download="csvExportFilename"
        >
          Télécharger
        </a>
      </li>
    </ul>
    <div class="grid-step-download-info">
      <p
        id="audit-grid-step-download-informations"
        class="fr-text--xs fr-mb-0 fr-mt-1v"
      >
        Contient seulement les résultats des critères.<br />CSV –
        {{ formatBytes(csvExportSizeEstimation, 2) }}.
      </p>
    </div>
  </StepCard>
</template>

<style scoped>
.grid-step-heading {
  align-items: center;
  display: flex;
  gap: 1rem;
  grid-column: 1 / -1;
}

.grid-step-title {
  /* FIXME: DSFR default badges dont align. Those with icons does. */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.grid-step-check {
  color: var(--text-default-success);
}

.grid-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.grid-step-download-info {
  color: var(--text-mention-grey);
  grid-column: 1;
}
</style>
