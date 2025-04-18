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
    <ul
      :class="[
        'fr-btns-group fr-btns-group--icon-left',
        { 'fr-mb-3w': auditIsReady }
      ]"
    >
      <li>
        <RouterLink
          :to="{
            name: 'report',
            params: { uniqueId: audit.consultUniqueId }
          }"
          target="_blank"
          class="fr-btn fr-btn--tertiary fr-mb-0"
          title="Consulter le rapport - nouvelle fenêtre"
        >
          Consulter
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </RouterLink>
      </li>
    </ul>

    <template v-if="auditIsReady">
      <CopyBlock
        class="fr-m-0 report-step-copy-block"
        :to="{
          name: 'report',
          params: { uniqueId: audit.consultUniqueId }
        }"
        label="Lien de partage"
        title="Lien de partage du rapport d’audit"
        success-message="Le lien vers le rapport d’audit a bien été copié dans le presse-papier."
        button-class="fr-btn--secondary"
      />
    </template>
  </StepCard>
</template>

<style scoped>
.report-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.report-step-copy-block {
  grid-column: 1 / -1;
  grid-row: 4;
}
</style>
