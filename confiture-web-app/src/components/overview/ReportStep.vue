<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { useAccountStore } from "../../store";
import { Audit } from "../../types";
import CopyBlock from "../CopyBlock.vue";
import StepCard from "./StepCard.vue";

defineProps<{
  audit: Audit;
}>();

const resultsStore = useResultsStore();
const accountStore = useAccountStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});
</script>

<template>
  <StepCard :checked="auditIsReady">
    <h2 class="fr-h3 fr-mb-1w report-step-title">
      Rapport d’audit
      <p class="fr-badge fr-badge--info">Généré automatiquement</p>
    </h2>
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
            params: { uniqueId: audit.consultUniqueId },
          }"
          :target="accountStore.account ? null : '_blank'"
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-eye-fill fr-mb-0"
        >
          Consulter
        </RouterLink>
      </li>
    </ul>

    <template v-if="auditIsReady">
      <CopyBlock
        class="fr-m-0 report-step-copy-block"
        :to="{
          name: 'report',
          params: { uniqueId: audit.consultUniqueId },
        }"
        label="Lien de partage"
        success-message="Le lien du rapport d’audit a bien été copié dans le presse-papier."
      />
    </template>
  </StepCard>
</template>

<style scoped>
.report-step-title {
  grid-column: 1 / -1;
  grid-row: 1;
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
