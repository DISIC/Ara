<script setup lang="ts">
import { computed } from "vue";

import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyBlock from "../ui/CopyBlock.vue";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});
const auditIsPublishable = computed(() => {
  return !!props.audit.initiator;
});
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w step-card-heading">
      <span
        v-if="auditIsPublishable"
        id="statement-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="statement-step-status"
      >
        Déclaration d’accessibilité
      </component>
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
                  name: 'a11y-statement',
                  params: {
                    uniqueId: audit.consultUniqueId
                  }
                }
              : {
                  name: 'audit-declaration',
                  params: { uniqueId: audit.editUniqueId }
                }
          "
          :target="auditIsPublishable ? '_blank' : null"
          class="fr-btn fr-btn--icon-left fr-mb-md-0"
          :class="{
            'fr-btn--tertiary': !auditIsReady || auditIsPublishable,
            'fr-icon-edit-line no-external-icon': !auditIsPublishable
          }"
          :title="
            auditIsPublishable
              ? 'Consulter la déclaration - nouvelle fenêtre'
              : null
          "
        >
          {{ auditIsPublishable ? "Consulter" : "Compléter" }}
          <span v-if="auditIsPublishable" class="fr-sr-only"
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
        :button-class="'fr-btn--secondary'"
        :to="{
          name: 'a11y-statement',
          params: {
            uniqueId: audit.consultUniqueId
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
