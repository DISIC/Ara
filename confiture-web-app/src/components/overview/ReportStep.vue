<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyBlock from "../ui/CopyBlock.vue";
import StepCard from "./StepCard.vue";

defineProps<{
  audit: Audit;
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});
</script>

<template>
  <StepCard>
    <div class="fr-mb-1w report-step-heading">
      <span
        v-if="auditIsReady"
        id="report-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill report-step-check"
        aria-hidden="true"
      >
        <span class="sr-only">Étape terminée</span>
      </span>
      <h2
        class="fr-h3 fr-mb-0 report-step-title"
        aria-describedby="report-step-status"
      >
        Rapport d’audit
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </h2>
    </div>
    <p class="report-step-description">
      {{
        auditIsReady
          ? "Vous pouvez livrer le rapport d’audit."
          : "Terminez l’audit avant de livrer le rapport d’audit."
      }}
    </p>
    <ul class="fr-btns-group fr-btns-group--icon-left fr-mb-3w">
      <li>
        <RouterLink
          :to="{
            name: 'report',
            params: { uniqueId: audit.consultUniqueId }
          }"
          target="_blank"
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-eye-fill fr-mb-0 no-external-icon"
          title="Consulter le rapport - nouvelle fenêtre"
        >
          Consulter
          <span class="sr-only">(nouvelle fenêtre)</span>
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
      />
    </template>
  </StepCard>
</template>

<style scoped>
.report-step-heading {
  align-items: center;
  display: flex;
  gap: 1rem;
  grid-column: 1 / -1;
}

.report-step-title {
  grid-column: 1 / -1;
  grid-row: 1;

  /* FIXME: DSFR default badges dont align. Those with icons does. */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-step-check {
  color: var(--text-default-success);
}

.report-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.report-step-copy-block {
  grid-column: 1 / -1;
  grid-row: 4;
}
</style>
