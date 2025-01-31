<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import StepCard from "./StepCard.vue";

defineProps<{
  audit: Audit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
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
        <!-- TODO: download link + CSV -->
        <a
          href="#"
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line fr-mb-0"
        >
          Télécharger
        </a>
      </li>
    </ul>
    <div class="grid-step-download-info">
      <p class="fr-text--xs fr-mb-0 fr-mt-1v">
        Contient seulement les résultats des critères.<br />CSV – 22,45 Ko.
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
  grid-column: 1 / -1;
  grid-row: 1;

  /* FIXME: DSFR default badges dont align. Those with icons does. */
  display: flex;
  align-items: center;
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
