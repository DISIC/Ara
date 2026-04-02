<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyButton from "../ui/CopyButton.vue";
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
    <div class="fr-mb-2w step-card-heading">
      <span
        v-if="auditIsReady"
        id="report-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="report-step-status"
      >
        Rapport d’audit
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </component>
    </div>
    <p class="report-step-description">
      {{
        auditIsReady
          ? "Vous pouvez livrer le rapport d’audit."
          : "Terminez l’audit avant de livrer le rapport d’audit."
      }}
    </p>
    <div class="report-step-actions">
      <div class="fr-btns-group fr-btns-group--icon-left">
        <RouterLink
          :to="{
            name: 'report',
            params: { uniqueId: audit.consultUniqueId }
          }"
          target="_blank"
          class="fr-btn fr-btn--tertiary fr-mb-0"
        >
          Consulter
          <span class="fr-sr-only">le rapport (nouvelle fenêtre)</span>
        </RouterLink>
      </div>

      <div class="fr-btns-group fr-btns-group--icon-left">
        <CopyButton
          label="Copier le lien de partage"
          icon="fr-icon-link"
          success-label="Lien de partage copié"
          :content-to-copy="{
            name: 'report',
            params: { uniqueId: audit.consultUniqueId }
          }"
          is-within-btn-group
        />
      </div>
    </div>
  </StepCard>
</template>

<style scoped>
.report-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.report-step-copy {
  grid-column: 1 / -1;
}

.report-step-actions {
  grid-column: 1/-1;
  display: grid;
  grid-template-columns: subgrid;

  @media (width < 48rem) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
  }
}
</style>
