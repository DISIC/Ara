<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { useAccountStore } from "../../store";
import { Audit } from "../../types";
import StepCard from "./StepCard.vue";
import CopyBlock from "../CopyBlock.vue";

const props = defineProps<{
  audit: Audit;
}>();

const resultsStore = useResultsStore();
const accountStore = useAccountStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});
const auditIsPublishable = computed(() => {
  return !!props.audit.initiator;
});
</script>

<template>
  <StepCard id="statement-step" :checked="auditIsPublishable">
    <h2
      class="fr-h3 fr-mb-1w statement-step-title"
      aria-describedby="statement-step"
    >
      Déclaration d’accessibilité
    </h2>
    <p class="statement-step-description">
      <template v-if="auditIsPublishable">
        Vous pouvez livrer la déclaration d’accessibilité.
      </template>
      <template v-else-if="auditIsReady">
        La déclaration d’accessibilité est prête à être complétée.
      </template>
      <template v-else>
        Terminez l’audit avant de compléter et livrer la déclaration
        d’accessibilité.
      </template>
    </p>

    <ul
      class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left fr-mb-3w statement-step-actions"
    >
      <li>
        <RouterLink
          :to="
            auditIsPublishable
              ? {
                  name: 'report',
                  params: {
                    uniqueId: audit.consultUniqueId,
                    tab: 'declaration-daccessibilite',
                  },
                }
              : {
                  name: 'edit-audit-declaration',
                  params: { uniqueId: audit.editUniqueId },
                }
          "
          :target="
            auditIsPublishable || !accountStore.account ? '_blank' : null
          "
          class="fr-btn fr-btn--icon-left fr-mb-md-0 no-external-icon"
          :class="{
            'fr-btn--secondary': !auditIsReady || auditIsPublishable,
            'fr-icon-edit-line': !auditIsPublishable,
            'fr-icon-eye-fill': auditIsPublishable,
          }"
          :title="
            auditIsPublishable
              ? 'Consulter la déclaration - nouvelle fenêtre'
              : null
          "
        >
          {{ auditIsPublishable ? "Consulter" : "Compléter" }}
          <span
            v-if="auditIsPublishable || !accountStore.account"
            class="sr-only"
            >(nouvelle fenêtre)</span
          >
        </RouterLink>
      </li>
      <li v-if="auditIsPublishable">
        <RouterLink
          :to="{
            name: 'edit-audit-declaration',
            params: { uniqueId: audit.editUniqueId },
          }"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-edit-line fr-mb-md-0"
        >
          Modifier
        </RouterLink>
      </li>
    </ul>

    <template v-if="auditIsPublishable">
      <CopyBlock
        class="fr-m-0 statement-step-copy-block"
        :to="{
          name: 'report',
          params: {
            uniqueId: audit.consultUniqueId,
            tab: 'declaration-daccessibilite',
          },
        }"
        label="Lien de partage"
        title="Lien de partage de la déclaration d’accessibilité"
        success-message="Le lien vers la déclaration d’accessibilité a bien été copié dans le presse-papier."
      />
    </template>
  </StepCard>
</template>

<style scoped>
.statement-step-title {
  grid-column: 1 / -1;
  grid-row: 1;
}

.statement-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.statement-step-actions {
  grid-column: 1 / -1;
}

/* FIXME: overrides fr-btns-group style */
.statement-step-actions > li:first-child {
  width: 50%;
}

.statement-step-actions > li > a {
  width: 100%;
}

.statement-step-copy-block {
  grid-column: 1 / -1;
  grid-row: 4;
}

@media (max-width: 48rem) {
  .statement-step-actions > li:first-child {
    width: 100%;
  }
}
</style>
