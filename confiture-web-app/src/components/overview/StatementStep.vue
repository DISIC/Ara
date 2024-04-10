<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { useAccountStore } from "../../store";
import { Audit } from "../../types";
import StepCard from "./StepCard.vue";
import CopyBlock from "../ui/CopyBlock.vue";

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
  <StepCard>
    <div class="fr-mb-3w statement-step-heading">
      <span
        v-if="auditIsPublishable"
        id="statement-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill statement-step-check"
      >
        <span class="sr-only">Étape terminée</span>
      </span>
      <h2
        class="fr-h3 fr-mb-0 statement-step-title"
        aria-describedby="statement-step-status"
      >
        Déclaration d’accessibilité
      </h2>
    </div>

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
      :class="[
        'fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left statement-step-actions',
        { 'fr-mb-3w': auditIsPublishable }
      ]"
    >
      <li>
        <RouterLink
          :to="
            auditIsPublishable
              ? {
                  name: 'report',
                  params: {
                    uniqueId: audit.consultUniqueId,
                    tab: 'declaration-daccessibilite'
                  }
                }
              : {
                  name: 'audit-declaration',
                  params: { uniqueId: audit.editUniqueId }
                }
          "
          :target="
            auditIsPublishable || !accountStore.account ? '_blank' : null
          "
          class="fr-btn fr-btn--icon-left fr-mb-md-0 no-external-icon"
          :class="{
            'fr-btn--secondary': !auditIsReady || auditIsPublishable,
            'fr-icon-edit-line': !auditIsPublishable,
            'fr-icon-eye-line': auditIsPublishable
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
            name: 'audit-declaration',
            params: { uniqueId: audit.editUniqueId }
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
            tab: 'declaration-daccessibilite'
          }
        }"
        label="Lien de partage"
        title="Lien de partage de la déclaration d’accessibilité"
        success-message="Le lien vers la déclaration d’accessibilité a bien été copié dans le presse-papier."
      />
    </template>
  </StepCard>
</template>

<style scoped>
.statement-step-heading {
  align-items: center;
  display: flex;
  gap: 1rem;
  grid-column: 1 / -1;
}

.statement-step-title {
  grid-column: 1 / -1;
  grid-row: 1;
}

.statement-step-check {
  color: var(--text-default-success);
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

@media (width < 48rem) {
  .statement-step-actions > li:first-child {
    width: 100%;
  }
}
</style>
