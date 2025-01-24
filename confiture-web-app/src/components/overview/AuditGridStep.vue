<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import { formatBytes, slugify } from "../../utils";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
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
    <div class="fr-mb-3w audit-grid-step-heading">
      <span
        v-if="auditIsReady"
        id="audit-export-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill audit-grid-step-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <h2
        class="fr-h3 fr-mb-0 audit-grid-step-title"
        aria-describedby="audit-export-step-status"
      >
        Grille d’audit
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </h2>
    </div>

    <p class="audit-grid-step-description">
      {{
        auditIsReady
          ? "Vous pouvez livrer la grille d’audit."
          : "Terminez l’audit avant de livrer la grille d’audit."
      }}
    </p>

    <ul class="fr-btns-group fr-btns-group--icon-left">
      <li>
        <a
          class="fr-btn fr-btn--tertiary fr-mb-0"
          aria-describedby="audit-grid-step-download-informations"
          :href="csvExportUrl"
          :download="csvExportFilename"
        >
          Télécharger
        </a>
        <p
          id="audit-grid-step-download-informations"
          class="fr-text--sm fr-mb-0 audit-grid-step-instructions"
        >
          Contient seulement les résultats des critères.<br />
          CSV – {{ formatBytes(csvExportSizeEstimation, 2) }}.
        </p>
      </li>
    </ul>
  </StepCard>
</template>

<style scoped>
/* TODO: factory common styles into step card */

.audit-grid-step-heading {
  align-items: center;
  display: flex;
  gap: 1rem;
  grid-column: 1 / -1;
}

.audit-grid-step-title {
  grid-column: 1 / -1;
  grid-row: 1;

  /* FIXME: DSFR default badges dont align. Those with icons does. */
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.audit-grid-step-check {
  color: var(--text-default-success);
}

.audit-grid-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.audit-grid-step-instructions {
  color: var(--text-mention-grey);
  margin-left: 0.5rem;
}
</style>
