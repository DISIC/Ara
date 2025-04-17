<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyBlock from "../ui/CopyBlock.vue";
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
    <CopyBlock
      class="report-step-copy"
      :to="{
        name: 'report',
        params: { uniqueId: audit.consultUniqueId }
      }"
      :show-copy-button="auditIsReady"
      success-message="Le lien vers le rapport d’audit a bien été copié dans le presse-papier."
      link-hidden-label="le rapport"
      copy-button-hidden-label="du rapport"
    />
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
</style>
